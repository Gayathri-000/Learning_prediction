from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # 'student' or 'teacher'
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="student")
    courses_taught = relationship("Course", back_populates="teacher")
    # Add these to the User class (around line 18-19, after courses_taught)
    questions_asked = relationship("Question", foreign_keys="[Question.student_id]", back_populates="student")
    answers_given = relationship("Answer", foreign_keys="[Answer.teacher_id]", back_populates="teacher")
    # In the User class, add:
    resources_uploaded = relationship("Resource", foreign_keys="[Resource.uploaded_by]", back_populates="teacher")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="courses_taught")
    enrollments = relationship("Enrollment", back_populates="course")
    tests = relationship("Test", back_populates="course", cascade="all, delete-orphan")
    videos = relationship("Video", back_populates="course")
    questions = relationship(
        "Question",
        back_populates="course",
        cascade="all, delete-orphan"
    )
    # In the Course class, add:
    resources = relationship("Resource", back_populates="course", cascade="all, delete-orphan")
     
# Add this to the Course class (around line 32, after enrollments)
   # questions = relationship("Question", back_populates="course", cascade="all, delete-orphan")
    
class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    
    # Learning data
    avg_assignment_score = Column(Float, default=0.0)
    course_progress = Column(Float, default=0.0)
    course_views = Column(Integer, default=0)
    resource_clicks = Column(Integer, default=0)
    #engagement_frequency = Column(Float, default=0.0)
    
    # Prediction data
    predicted_outcome = Column(String, nullable=True)  # 'Pass' or 'Fail'
    prediction_probability = Column(Float, nullable=True)
    prediction_date = Column(DateTime, nullable=True)
    
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    shap_values = relationship("ShapValue", back_populates="enrollment")
    recommendations = relationship("Recommendation", back_populates="enrollment")

class ShapValue(Base):
    __tablename__ = "shap_values"
    
    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))
    feature_name = Column(String)
    shap_value = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    enrollment = relationship("Enrollment", back_populates="shap_values")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))
    recommendation_text = Column(Text)
    category = Column(String)  # 'assignment', 'engagement', 'progress'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    enrollment = relationship("Enrollment", back_populates="recommendations")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_answered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="questions")
    student = relationship("User", foreign_keys=[student_id], back_populates="questions_asked")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    question = relationship("Question", back_populates="answers")
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="answers_given")


class Test(Base):
    __tablename__ = "tests"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    total_marks = Column(Float, nullable=False)
    passing_marks = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)  # Test duration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    start_time = Column(DateTime, nullable=True)  # When test becomes available
    end_time = Column(DateTime, nullable=True)  # When test closes
    
    # Relationships
    course = relationship("Course", back_populates="tests")
    questions = relationship("TestQuestion", back_populates="test", cascade="all, delete-orphan")
    submissions = relationship("TestSubmission", back_populates="test", cascade="all, delete-orphan")

class TestQuestion(Base):
    __tablename__ = "test_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # 'mcq', 'true_false', 'short_answer'
    marks = Column(Float, nullable=False)
    options = Column(Text, nullable=True)  # JSON string for MCQ options
    correct_answer = Column(Text, nullable=False)
    order = Column(Integer, default=0)
    
    # Relationships
    test = relationship("Test", back_populates="questions")
    answers = relationship("TestAnswer", back_populates="question", cascade="all, delete-orphan")

class TestSubmission(Base):
    __tablename__ = "test_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))
    score = Column(Float, nullable=True)
    total_marks = Column(Float, nullable=False)
    percentage = Column(Float, nullable=True)
    is_graded = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    time_taken_minutes = Column(Integer, nullable=True)
    
    # Relationships
    test = relationship("Test", back_populates="submissions")
    student = relationship("User", foreign_keys=[student_id])
    enrollment = relationship("Enrollment")
    answers = relationship("TestAnswer", back_populates="submission", cascade="all, delete-orphan")

class TestAnswer(Base):
    __tablename__ = "test_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("test_submissions.id"))
    question_id = Column(Integer, ForeignKey("test_questions.id"))
    answer_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=True)
    marks_awarded = Column(Float, default=0.0)
    
    # Relationships
    submission = relationship("TestSubmission", back_populates="answers")
    question = relationship("TestQuestion", back_populates="answers")

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    video_url = Column(String, nullable=False)
    duration = Column(Integer, default=0)  # Duration in minutes
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="videos")
    progress_records = relationship("VideoProgress", back_populates="video", cascade="all, delete-orphan")

class VideoProgress(Base):
    __tablename__ = "video_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    watch_time = Column(Integer, default=0)  # Watch time in seconds
    completed = Column(Boolean, default=False)
    last_watched = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    video = relationship("Video", back_populates="progress_records")
    student = relationship("User", foreign_keys=[student_id])

# Add this new model class (add after the Answer class)

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String, nullable=False)
    file_type = Column(String)  # pdf, video, document, link, etc.
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="resources")
    teacher = relationship("User", foreign_keys=[uploaded_by], back_populates="resources_uploaded")
    clicks = relationship("ResourceClick", back_populates="resource", cascade="all, delete-orphan")

class ResourceClick(Base):
    __tablename__ = "resource_clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))
    clicked_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    resource = relationship("Resource", back_populates="clicks")
    student = relationship("User", foreign_keys=[student_id])
    enrollment = relationship("Enrollment")