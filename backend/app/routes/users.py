from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/students")
def get_all_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Get all students (teacher only)
    """
    students = db.query(User).filter(User.role == "student").all()
    
    return [
        {
            "id": student.id,
            "email": student.email,
            "full_name": student.full_name,
            "created_at": student.created_at
        }
        for student in students
    ]