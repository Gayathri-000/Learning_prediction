from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User, Course, Enrollment
from app.schemas.schemas import CourseCreate, Course as CourseSchema
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/courses", tags=["courses"])

@router.post("/", response_model=CourseSchema, status_code=status.HTTP_201_CREATED)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Create a new course (teacher only)
    """
    db_course = Course(
        title=course.title,
        description=course.description,
        teacher_id=current_user.id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/", response_model=List[CourseSchema])
def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all courses for current user
    - Teachers see courses they teach
    - Students see courses they're enrolled in
    """
    if current_user.role == "teacher":
        courses = db.query(Course).filter(Course.teacher_id == current_user.id).all()
    else:
        # Get student's enrollments and then courses
        enrollments = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id
        ).all()
        course_ids = [e.course_id for e in enrollments]
        courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
    
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get specific course details
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check access permissions
    if current_user.role == "teacher" and course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course"
            )
    
    return course

@router.post("/{course_id}/enroll/{student_id}")
def enroll_student(
    course_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Enroll a student in a course (teacher only)
    """
    # Verify course exists and belongs to teacher
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or access denied"
        )
    
    # Verify student exists and has student role
    student = db.query(User).filter(
        User.id == student_id, 
        User.role == "student"
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already enrolled"
        )
    
    # Create enrollment
    enrollment = Enrollment(student_id=student_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    
    return {"message": "Student enrolled successfully"}

@router.get("/{course_id}/students")
def get_course_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Get all students enrolled in a course (teacher only)
    """
    # Verify course exists and belongs to teacher
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or access denied"
        )
    
    # Get enrollments
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    
    # Build student list
    students = []
    for enrollment in enrollments:
        student = db.query(User).filter(User.id == enrollment.student_id).first()
        students.append({
            "id": student.id,
            "email": student.email,
            "full_name": student.full_name,
            "enrollment_id": enrollment.id
        })
    
    return students

@router.delete("/{course_id}/unenroll/{student_id}")
def unenroll_student(
    course_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Unenroll a student from a course (teacher only)
    Deletes enrollment and all associated data (SHAP values, recommendations)
    """
    # Verify course exists and belongs to teacher
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or access denied"
        )
    
    # Find the enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student is not enrolled in this course"
        )
    
    # Get student name for response
    student = db.query(User).filter(User.id == student_id).first()
    student_name = student.full_name if student else "Unknown Student"
    
    # Delete associated SHAP values
    from app.models.models import ShapValue, Recommendation
    db.query(ShapValue).filter(ShapValue.enrollment_id == enrollment.id).delete()
    
    # Delete associated recommendations
    db.query(Recommendation).filter(Recommendation.enrollment_id == enrollment.id).delete()
    
    # Delete the enrollment
    db.delete(enrollment)
    db.commit()
    
    return {
        "message": f"Successfully unenrolled {student_name} from {course.title}",
        "student_id": student_id,
        "course_id": course_id
    }