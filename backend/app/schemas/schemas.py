from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class CourseBase(BaseModel):
    title: str
    description: str

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    teacher_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class EnrollmentBase(BaseModel):
    avg_assignment_score: float
    course_progress: float
    course_views: int
    resource_clicks: int
    engagement_frequency: float

class EnrollmentUpdate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    id: int
    student_id: int
    course_id: int
    predicted_outcome: Optional[str]
    prediction_probability: Optional[float]
    enrolled_at: datetime
    
    class Config:
        from_attributes = True

class ShapValueResponse(BaseModel):
    feature_name: str
    shap_value: float
    
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    recommendation_text: str
    category: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PredictionResponse(BaseModel):
    predicted_outcome: str
    prediction_probability: float
    shap_values: List[ShapValueResponse]
    recommendations: List[RecommendationResponse]