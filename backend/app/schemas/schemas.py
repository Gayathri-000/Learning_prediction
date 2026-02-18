from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
import json

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
    #engagement_frequency: float

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

# Question and Answer Schemas
class QuestionBase(BaseModel):
    title: str
    content: str

class QuestionCreate(QuestionBase):
    course_id: int

class AnswerBase(BaseModel):
    content: str

class AnswerCreate(AnswerBase):
    question_id: int

class AnswerResponse(AnswerBase):
    id: int
    question_id: int
    teacher_id: int
    teacher_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionResponse(QuestionBase):
    id: int
    course_id: int
    student_id: int
    student_name: str
    is_answered: bool
    created_at: datetime
    answers: List[AnswerResponse] = []
    
    class Config:
        from_attributes = True

    # Test Schemas
class TestQuestionBase(BaseModel):
    question_text: str
    question_type: str  # 'mcq', 'true_false', 'short_answer'
    marks: float
    options: Optional[str] = None
    correct_answer: str
    order: int = 0

class TestQuestionCreate(TestQuestionBase):
    pass

class TestQuestionResponse(TestQuestionBase):
    id: int
    test_id: int
    
    class Config:
        from_attributes = True

class TestQuestionForStudent(BaseModel):
    """Question schema for students (without correct answer)"""
    id: int
    question_text: str
    question_type: str
    marks: float
    options: Optional[str] = None
    order: int
    
    class Config:
        from_attributes = True

class TestBase(BaseModel):
    title: str
    description: Optional[str] = None
    total_marks: float
    passing_marks: float
    duration_minutes: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class TestCreate(TestBase):
    course_id: int
    questions: List[TestQuestionCreate]

class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class TestResponse(TestBase):
    id: int
    course_id: int
    is_active: bool
    created_at: datetime
    questions: List[TestQuestionResponse] = []
    
    class Config:
        from_attributes = True

class TestForStudent(TestBase):
    """Test schema for students (without answers)"""
    id: int
    course_id: int
    is_active: bool
    created_at: datetime
    questions: List[TestQuestionForStudent] = []
    
    class Config:
        from_attributes = True

# Test Answer and Submission Schemas
class TestAnswerSubmit(BaseModel):
    question_id: int
    answer_text: str

class TestSubmissionCreate(BaseModel):
    test_id: int
    answers: List[TestAnswerSubmit]

class TestAnswerResponse(BaseModel):
    id: int
    question_id: int
    answer_text: str
    is_correct: Optional[bool]
    marks_awarded: float
    question_text: str
    correct_answer: str
    
    class Config:
        from_attributes = True

class TestSubmissionResponse(BaseModel):
    id: int
    test_id: int
    student_id: int
    student_name: str
    score: Optional[float]
    total_marks: float
    percentage: Optional[float]
    is_graded: bool
    started_at: datetime
    submitted_at: Optional[datetime]
    time_taken_minutes: Optional[int]
    test_title: str
    answers: List[TestAnswerResponse] = []
    
    class Config:
        from_attributes = True

class TestSubmissionSummary(BaseModel):
    id: int
    test_id: int
    test_title: str
    score: Optional[float]
    total_marks: float
    percentage: Optional[float]
    is_graded: bool
    submitted_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Video Schemas
class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    duration: int = 0

class VideoCreate(VideoBase):
    course_id: int

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration: Optional[int] = None

class VideoResponse(VideoBase):
    id: int
    course_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class VideoProgressCreate(BaseModel):
    watch_time: int  # in seconds
    completed: bool = False

class VideoProgressResponse(BaseModel):
    id: int
    video_id: int
    student_id: int
    watch_time: int
    completed: bool
    last_watched: datetime
    
    class Config:
        from_attributes = True

class VideoWithProgress(VideoResponse):
    progress: Optional[VideoProgressResponse] = None


# Add new schemas for Resources
class ResourceBase(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: str
    file_type: Optional[str] = None

class ResourceCreate(ResourceBase):
    course_id: int

class ResourceResponse(ResourceBase):
    id: int
    course_id: int
    uploaded_by: int
    teacher_name: str
    created_at: datetime
    click_count: int = 0
    
    class Config:
        from_attributes = True


