from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User, Course, Question, Answer, Enrollment
from app.schemas.schemas import (
    QuestionCreate, 
    QuestionResponse, 
    AnswerCreate, 
    AnswerResponse
)
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/qa", tags=["Q&A"])

@router.post("/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """
    Create a new question (student only)
    """
    # Verify student is enrolled in the course
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == question.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to ask questions"
        )
    
    # Create question
    db_question = Question(
        course_id=question.course_id,
        student_id=current_user.id,
        title=question.title,
        content=question.content
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Prepare response
    return {
        **db_question.__dict__,
        "student_name": current_user.full_name,
        "answers": []
    }

@router.get("/courses/{course_id}/questions", response_model=List[QuestionResponse])
def get_course_questions(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all questions for a course
    """
    # Verify access (must be enrolled student or course teacher)
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
    
    # Get all questions with answers
    questions = db.query(Question).filter(
        Question.course_id == course_id
    ).order_by(Question.created_at.desc()).all()
    
    # Format response
    result = []
    for q in questions:
        student = db.query(User).filter(User.id == q.student_id).first()
        
        answers_list = []
        for a in q.answers:
            teacher = db.query(User).filter(User.id == a.teacher_id).first()
            answers_list.append({
                **a.__dict__,
                "teacher_name": teacher.full_name if teacher else "Unknown"
            })
        
        result.append({
            **q.__dict__,
            "student_name": student.full_name if student else "Unknown",
            "answers": answers_list
        })
    
    return result

@router.post("/answers", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
def create_answer(
    answer: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Answer a question (teacher only)
    """
    # Verify question exists
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == question.course_id,
        Course.teacher_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create answer
    db_answer = Answer(
        question_id=answer.question_id,
        teacher_id=current_user.id,
        content=answer.content
    )
    db.add(db_answer)
    
    # Mark question as answered
    question.is_answered = True
    
    db.commit()
    db.refresh(db_answer)
    
    return {
        **db_answer.__dict__,
        "teacher_name": current_user.full_name
    }

@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a question (student who created it or teacher)
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check permissions
    is_owner = current_user.role == "student" and question.student_id == current_user.id
    is_teacher = False
    
    if current_user.role == "teacher":
        course = db.query(Course).filter(
            Course.id == question.course_id,
            Course.teacher_id == current_user.id
        ).first()
        is_teacher = course is not None
    
    if not (is_owner or is_teacher):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(question)
    db.commit()
    
    return {"message": "Question deleted successfully"}

@router.delete("/answers/{answer_id}")
def delete_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Delete an answer (teacher only)
    """
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    # Verify teacher owns this answer or the course
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    course = db.query(Course).filter(
        Course.id == question.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check if this was the only answer
    answer_count = db.query(Answer).filter(Answer.question_id == question.id).count()
    if answer_count == 1:
        question.is_answered = False
    
    db.delete(answer)
    db.commit()
    
    return {"message": "Answer deleted successfully"}