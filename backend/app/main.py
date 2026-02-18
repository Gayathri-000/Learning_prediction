from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, courses, students,  visualizations, users , qa , tests , videos , resources
 
# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Explainable ML-Powered LMS",
    description="Learning Management System with ML predictions and SHAP explanations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(students.router)
app.include_router(visualizations.router)
app.include_router(users.router)
app.include_router(qa.router)
app.include_router(tests.router)
app.include_router(videos.router)
app.include_router(resources.router)

@app.get("/")
def root():
    return {
        "message": "Explainable ML-Powered LMS API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}