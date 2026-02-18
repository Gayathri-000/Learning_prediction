from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.models import User, Course, Resource, ResourceClick, Enrollment
from app.schemas.schemas import ResourceCreate, ResourceResponse
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/resources", tags=["resources"])

@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Create a new resource (teacher only)
    """
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == resource.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied or course not found"
        )
    
    # Create resource
    db_resource = Resource(
        course_id=resource.course_id,
        title=resource.title,
        description=resource.description,
        file_url=resource.file_url,
        file_type=resource.file_type,
        uploaded_by=current_user.id
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    return {
        **db_resource.__dict__,
        "teacher_name": current_user.full_name,
        "click_count": 0
    }

@router.get("/courses/{course_id}", response_model=List[ResourceResponse])
def get_course_resources(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all resources for a course
    """
    # Verify access
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == "teacher":
        course = db.query(Course).filter(
            Course.id == course_id,
            Course.teacher_id == current_user.id
        ).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Get resources with click counts
    resources = db.query(Resource).filter(
        Resource.course_id == course_id
    ).order_by(Resource.created_at.desc()).all()
    
    result = []
    for r in resources:
        teacher = db.query(User).filter(User.id == r.uploaded_by).first()
        click_count = db.query(ResourceClick).filter(
            ResourceClick.resource_id == r.id
        ).count()
        
        result.append({
            **r.__dict__,
            "teacher_name": teacher.full_name if teacher else "Unknown",
            "click_count": click_count
        })
    
    return result

@router.post("/{resource_id}/click")
def track_resource_click(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """
    Track when a student clicks on a resource
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    # Verify student is enrolled
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == resource.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Must be enrolled to access resources"
        )
    
    # Track the click
    click = ResourceClick(
        resource_id=resource_id,
        student_id=current_user.id,
        enrollment_id=enrollment.id
    )
    db.add(click)
    
    # Update enrollment resource_clicks count
    current_count = db.query(func.count(ResourceClick.id)).filter(
        ResourceClick.enrollment_id == enrollment.id
    ).scalar()
    
    enrollment.resource_clicks = current_count + 1
    
    db.commit()
    
    return {
        "message": "Resource click tracked",
        "total_clicks": enrollment.resource_clicks
    }

@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Delete a resource (teacher only)
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == resource.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(resource)
    db.commit()
    
    return {"message": "Resource deleted successfully"}