from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
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
    engagement_frequency = Column(Float, default=0.0)
    
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