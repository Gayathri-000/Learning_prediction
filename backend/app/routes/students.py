from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.models import User, Enrollment, ShapValue, Recommendation, Course
from app.schemas.schemas import (
    EnrollmentUpdate, 
    Enrollment as EnrollmentSchema,
    PredictionResponse,
    ShapValueResponse,
    RecommendationResponse
)
from app.services.auth import get_current_user, require_role
from app.services.ml_service import ml_service

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/enrollments", response_model=List[EnrollmentSchema])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """
    Get all enrollments for current student
    """
    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id
    ).all()
    return enrollments

@router.get("/enrollments/{enrollment_id}", response_model=EnrollmentSchema)
def get_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get specific enrollment details
    """
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Check access permissions
    if current_user.role == "student" and enrollment.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if current_user.role == "teacher":
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return enrollment

@router.put("/enrollments/{enrollment_id}", response_model=EnrollmentSchema)
def update_enrollment(
    enrollment_id: int,
    enrollment_update: EnrollmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Update student enrollment data (teacher only)
    """
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update enrollment data
    enrollment.avg_assignment_score = enrollment_update.avg_assignment_score
    enrollment.course_progress = enrollment_update.course_progress
    enrollment.course_views = enrollment_update.course_views
    enrollment.resource_clicks = enrollment_update.resource_clicks
    
    db.commit()
    db.refresh(enrollment)
    
    return enrollment

@router.post("/enrollments/{enrollment_id}/predict", response_model=PredictionResponse)
def predict_outcome(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run ML prediction for student enrollment
    """
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Check access permissions
    if current_user.role == "student" and enrollment.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if current_user.role == "teacher":
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Prepare enrollment data for prediction
    enrollment_data = {
        'avg_assignment_score': enrollment.avg_assignment_score,
        'course_progress': enrollment.course_progress,
        'course_views': enrollment.course_views,
        'resource_clicks': enrollment.resource_clicks,
    }
    
    # Run prediction
    try:
        prediction = ml_service.predict(enrollment_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
    
    # Update enrollment with prediction
    enrollment.predicted_outcome = prediction['predicted_outcome']
    enrollment.prediction_probability = prediction['prediction_probability']
    enrollment.prediction_date = datetime.utcnow()
    
    # Delete old SHAP values and recommendations
    db.query(ShapValue).filter(ShapValue.enrollment_id == enrollment_id).delete()
    db.query(Recommendation).filter(Recommendation.enrollment_id == enrollment_id).delete()
    
    # Store new SHAP values
    for shap_val in prediction['shap_values']:
        db_shap = ShapValue(
            enrollment_id=enrollment_id,
            feature_name=shap_val['feature'],
            shap_value=shap_val['shap_value']
        )
        db.add(db_shap)
    
    # Generate and store recommendations
    recommendations = ml_service.generate_recommendations(
        enrollment_data, 
        prediction['shap_values']
    )
    
    for rec in recommendations:
        db_rec = Recommendation(
            enrollment_id=enrollment_id,
            recommendation_text=rec['recommendation_text'],
            category=rec['category']
        )
        db.add(db_rec)
    
    db.commit()
    
    # Fetch stored data for response
    shap_values = db.query(ShapValue).filter(
        ShapValue.enrollment_id == enrollment_id
    ).all()
    recommendations_db = db.query(Recommendation).filter(
        Recommendation.enrollment_id == enrollment_id
    ).all()
    
    # ===== FIX: Explicitly convert to dictionaries =====
    shap_values_list = [
        ShapValueResponse.from_orm(shap) for shap in shap_values
    ]
    recommendations_list = [
        RecommendationResponse.from_orm(rec) for rec in recommendations_db
    ]
    
    print("=" * 50)
    print("BACKEND DEBUG - PREDICTION RESPONSE")
    print(f"Recommendations Count: {len(recommendations_list)}")
    if recommendations_list:
        print(f"First Recommendation: {recommendations_list[0]}")
    print("=" * 50)
    
    return PredictionResponse(
        predicted_outcome=prediction['predicted_outcome'],
        prediction_probability=prediction['prediction_probability'],
        shap_values=shap_values_list,
        recommendations=recommendations_list
    )

@router.get("/enrollments/{enrollment_id}/prediction", response_model=PredictionResponse)
def get_prediction(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get existing prediction for enrollment
    """
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Check if prediction exists
    if not enrollment.predicted_outcome:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction available. Please run prediction first."
        )
    
    # Fetch SHAP values and recommendations
    shap_values = db.query(ShapValue).filter(
        ShapValue.enrollment_id == enrollment_id
    ).all()
    recommendations = db.query(Recommendation).filter(
        Recommendation.enrollment_id == enrollment_id
    ).all()
    
    # ===== FIX: Explicitly convert to Pydantic models =====
    shap_values_list = [
        ShapValueResponse.from_orm(shap) for shap in shap_values
    ]
    recommendations_list = [
        RecommendationResponse.from_orm(rec) for rec in recommendations
    ]
    
    print("=" * 50)
    print("BACKEND DEBUG - GET PREDICTION")
    print(f"Recommendations Count: {len(recommendations_list)}")
    if recommendations_list:
        print(f"First Recommendation: {recommendations_list[0]}")
    print("=" * 50)
    
    return PredictionResponse(
        predicted_outcome=enrollment.predicted_outcome,
        prediction_probability=enrollment.prediction_probability,
        shap_values=shap_values_list,
        recommendations=recommendations_list
    )