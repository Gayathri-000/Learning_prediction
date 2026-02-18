from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json

from app.database import get_db
from app.models.models import (
    User, Course, Test, TestQuestion, TestSubmission, 
    TestAnswer, Enrollment
)
from app.schemas.schemas import (
    TestCreate, TestResponse, TestUpdate, TestForStudent,
    TestSubmissionCreate, TestSubmissionResponse,
    TestSubmissionSummary, TestQuestionResponse
)
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/tests", tags=["tests"])

# Helper function to update enrollment average score
def update_enrollment_avg_score(db: Session, enrollment_id: int):
    """Recalculate and update average assignment score for enrollment"""
    from sqlalchemy import func
    
    # Get all graded test submissions for this enrollment
    avg_score = db.query(func.avg(TestSubmission.percentage)).filter(
        TestSubmission.enrollment_id == enrollment_id,
        TestSubmission.is_graded == True
    ).scalar()
    
    if avg_score:
        enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
        if enrollment:
            enrollment.avg_assignment_score = float(avg_score)
            db.commit()
            return float(avg_score)
    return None

@router.post("/", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test: TestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Create a new test with questions (teacher only)"""
    # Verify course exists and belongs to teacher
    course = db.query(Course).filter(
        Course.id == test.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or access denied"
        )
    
    # Create test
    db_test = Test(
        course_id=test.course_id,
        title=test.title,
        description=test.description,
        total_marks=test.total_marks,
        passing_marks=test.passing_marks,
        duration_minutes=test.duration_minutes,
        start_time=test.start_time,
        end_time=test.end_time
    )
    db.add(db_test)
    db.flush()
    
    # Create questions
    for question_data in test.questions:
        db_question = TestQuestion(
            test_id=db_test.id,
            question_text=question_data.question_text,
            question_type=question_data.question_type,
            marks=question_data.marks,
            options=question_data.options,
            correct_answer=question_data.correct_answer,
            order=question_data.order
        )
        db.add(db_question)
    
    db.commit()
    db.refresh(db_test)
    
    # Load questions for response
    db_test.questions = db.query(TestQuestion).filter(
        TestQuestion.test_id == db_test.id
    ).order_by(TestQuestion.order).all()
    
    return db_test

@router.get("/course/{course_id}", response_model=List[TestResponse])
def get_course_tests_teacher(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Get all tests for a course (teacher view with answers)"""
    # Verify course belongs to teacher
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or access denied"
        )
    
    tests = db.query(Test).filter(Test.course_id == course_id).all()
    
    # Load questions for each test
    for test in tests:
        test.questions = db.query(TestQuestion).filter(
            TestQuestion.test_id == test.id
        ).order_by(TestQuestion.order).all()
    
    return tests

@router.get("/course/{course_id}/student", response_model=List[TestForStudent])
def get_course_tests_student(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """Get all active tests for a course (student view without answers)"""
    # Verify student is enrolled
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this course"
        )
    
    # Get active tests
    tests = db.query(Test).filter(
        Test.course_id == course_id,
        Test.is_active == True
    ).all()
    
    # Filter by time if start/end times are set
    current_time = datetime.utcnow()
    available_tests = []
    
    for test in tests:
        # Check if test is available
        if test.start_time and current_time < test.start_time:
            continue
        if test.end_time and current_time > test.end_time:
            continue
        
        # Load questions without answers
        test.questions = db.query(TestQuestion).filter(
            TestQuestion.test_id == test.id
        ).order_by(TestQuestion.order).all()
        
        available_tests.append(test)
    
    return available_tests

@router.get("/{test_id}", response_model=TestResponse)
def get_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Get test details (teacher only)"""
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == test.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Load questions
    test.questions = db.query(TestQuestion).filter(
        TestQuestion.test_id == test.id
    ).order_by(TestQuestion.order).all()
    
    return test

@router.get("/{test_id}/student", response_model=TestForStudent)
def get_test_student(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """Get test for taking (student view without answers)"""
    test = db.query(Test).filter(
        Test.id == test_id,
        Test.is_active == True
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found or not available"
        )
    
    # Verify student is enrolled
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == test.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this course"
        )
    
    # Check if already submitted
    existing_submission = db.query(TestSubmission).filter(
        TestSubmission.test_id == test_id,
        TestSubmission.student_id == current_user.id
    ).first()
    
    if existing_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this test"
        )
    
    # Check time availability
    current_time = datetime.utcnow()
    if test.start_time and current_time < test.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Test has not started yet"
        )
    if test.end_time and current_time > test.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Test has ended"
        )
    
    # Load questions without correct answers
    test.questions = db.query(TestQuestion).filter(
        TestQuestion.test_id == test.id
    ).order_by(TestQuestion.order).all()
    
    return test

@router.patch("/{test_id}", response_model=TestResponse)
def update_test(
    test_id: int,
    test_update: TestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Update test details (teacher only)"""
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == test.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update fields
    update_data = test_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(test, field, value)
    
    db.commit()
    db.refresh(test)
    
    # Load questions
    test.questions = db.query(TestQuestion).filter(
        TestQuestion.test_id == test.id
    ).order_by(TestQuestion.order).all()
    
    return test

@router.delete("/{test_id}")
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Delete a test (teacher only)"""
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == test.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(test)
    db.commit()
    
    return {"message": "Test deleted successfully"}

@router.post("/submit", response_model=TestSubmissionResponse)
def submit_test(
    submission: TestSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """Submit test answers and get auto-graded (student only)"""
    # Get test
    test = db.query(Test).filter(Test.id == submission.test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Verify enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == test.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this course"
        )
    
    # Check if already submitted
    existing = db.query(TestSubmission).filter(
        TestSubmission.test_id == submission.test_id,
        TestSubmission.student_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this test"
        )
    
    # Create submission
    db_submission = TestSubmission(
        test_id=submission.test_id,
        student_id=current_user.id,
        enrollment_id=enrollment.id,
        total_marks=test.total_marks,
        submitted_at=datetime.utcnow()
    )
    db.add(db_submission)
    db.flush()
    
    # Auto-grade answers
    total_score = 0.0
    questions = {q.id: q for q in test.questions}
    
    for answer_data in submission.answers:
        question = questions.get(answer_data.question_id)
        if not question:
            continue
        
        # Check answer
        is_correct = False
        marks_awarded = 0.0
        
        if question.question_type in ['mcq', 'true_false']:
            # Exact match for MCQ and True/False
            if answer_data.answer_text.strip().lower() == question.correct_answer.strip().lower():
                is_correct = True
                marks_awarded = question.marks
        else:
            # Short answer - partial matching (you can improve this logic)
            student_answer = answer_data.answer_text.strip().lower()
            correct_answer = question.correct_answer.strip().lower()
            if student_answer == correct_answer:
                is_correct = True
                marks_awarded = question.marks
            elif student_answer in correct_answer or correct_answer in student_answer:
                # Partial credit for short answers
                is_correct = False
                marks_awarded = question.marks * 0.5
        
        total_score += marks_awarded
        
        # Store answer
        db_answer = TestAnswer(
            submission_id=db_submission.id,
            question_id=answer_data.question_id,
            answer_text=answer_data.answer_text,
            is_correct=is_correct,
            marks_awarded=marks_awarded
        )
        db.add(db_answer)
    
    # Update submission with score
    db_submission.score = total_score
    db_submission.percentage = (total_score / test.total_marks) * 100 if test.total_marks > 0 else 0
    db_submission.is_graded = True
    
    db.commit()
    db.refresh(db_submission)
    
    # Update enrollment average score
    update_enrollment_avg_score(db, enrollment.id)
    
    # Prepare response
    answers_response = []
    for answer in db_submission.answers:
        question = questions.get(answer.question_id)
        answers_response.append({
            'id': answer.id,
            'question_id': answer.question_id,
            'answer_text': answer.answer_text,
            'is_correct': answer.is_correct,
            'marks_awarded': answer.marks_awarded,
            'question_text': question.question_text if question else '',
            'correct_answer': question.correct_answer if question else ''
        })
    
    return {
        'id': db_submission.id,
        'test_id': db_submission.test_id,
        'student_id': db_submission.student_id,
        'student_name': current_user.full_name,
        'score': db_submission.score,
        'total_marks': db_submission.total_marks,
        'percentage': db_submission.percentage,
        'is_graded': db_submission.is_graded,
        'started_at': db_submission.started_at,
        'submitted_at': db_submission.submitted_at,
        'time_taken_minutes': db_submission.time_taken_minutes,
        'test_title': test.title,
        'answers': answers_response
    }

@router.get("/submissions/my", response_model=List[TestSubmissionSummary])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """Get all test submissions for current student"""
    submissions = db.query(TestSubmission).filter(
        TestSubmission.student_id == current_user.id
    ).all()
    
    result = []
    for sub in submissions:
        test = db.query(Test).filter(Test.id == sub.test_id).first()
        result.append({
            'id': sub.id,
            'test_id': sub.test_id,
            'test_title': test.title if test else 'Unknown',
            'score': sub.score,
            'total_marks': sub.total_marks,
            'percentage': sub.percentage,
            'is_graded': sub.is_graded,
            'submitted_at': sub.submitted_at
        })
    
    return result

@router.get("/{test_id}/submissions", response_model=List[TestSubmissionResponse])
def get_test_submissions(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Get all submissions for a test (teacher only)"""
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == test.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    submissions = db.query(TestSubmission).filter(
        TestSubmission.test_id == test_id
    ).all()
    
    result = []
    questions = {q.id: q for q in test.questions}
    
    for sub in submissions:
        student = db.query(User).filter(User.id == sub.student_id).first()
        
        answers_response = []
        for answer in sub.answers:
            question = questions.get(answer.question_id)
            answers_response.append({
                'id': answer.id,
                'question_id': answer.question_id,
                'answer_text': answer.answer_text,
                'is_correct': answer.is_correct,
                'marks_awarded': answer.marks_awarded,
                'question_text': question.question_text if question else '',
                'correct_answer': question.correct_answer if question else ''
            })
        
        result.append({
            'id': sub.id,
            'test_id': sub.test_id,
            'student_id': sub.student_id,
            'student_name': student.full_name if student else 'Unknown',
            'score': sub.score,
            'total_marks': sub.total_marks,
            'percentage': sub.percentage,
            'is_graded': sub.is_graded,
            'started_at': sub.started_at,
            'submitted_at': sub.submitted_at,
            'time_taken_minutes': sub.time_taken_minutes,
            'test_title': test.title,
            'answers': answers_response
        })
    
    return result

@router.get("/submission/{submission_id}", response_model=TestSubmissionResponse)
def get_submission_details(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed submission (student sees own, teacher sees all)"""
    submission = db.query(TestSubmission).filter(
        TestSubmission.id == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check access
    if current_user.role == "student" and submission.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if current_user.role == "teacher":
        test = db.query(Test).filter(Test.id == submission.test_id).first()
        course = db.query(Course).filter(
            Course.id == test.course_id,
            Course.teacher_id == current_user.id
        ).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Load test and questions
    test = db.query(Test).filter(Test.id == submission.test_id).first()
    questions = {q.id: q for q in test.questions}
    student = db.query(User).filter(User.id == submission.student_id).first()
    
    answers_response = []
    for answer in submission.answers:
        question = questions.get(answer.question_id)
        answers_response.append({
            'id': answer.id,
            'question_id': answer.question_id,
            'answer_text': answer.answer_text,
            'is_correct': answer.is_correct,
            'marks_awarded': answer.marks_awarded,
            'question_text': question.question_text if question else '',
            'correct_answer': question.correct_answer if question else ''
        })
    
    return {
        'id': submission.id,
        'test_id': submission.test_id,
        'student_id': submission.student_id,
        'student_name': student.full_name if student else 'Unknown',
        'score': submission.score,
        'total_marks': submission.total_marks,
        'percentage': submission.percentage,
        'is_graded': submission.is_graded,
        'started_at': submission.started_at,
        'submitted_at': submission.submitted_at,
        'time_taken_minutes': submission.time_taken_minutes,
        'test_title': test.title,
        'answers': answers_response
    }