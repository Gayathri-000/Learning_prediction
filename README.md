[33mcommit 9c958ec30859e0d584a1e49fd7d9c9f801a790db[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmaster[m[33m)[m
Author: Gayathri-000 <121491376+Gayathri-000@users.noreply.github.com>
Date:   Tue Jan 20 12:38:43 2026 +0530

    added ML and both fromt end and backend

[1mdiff --git a/backend/.gitignore b/backend/.gitignore[m
[1mnew file mode 100644[m
[1mindex 0000000..523d743[m
[1m--- /dev/null[m
[1m+++ b/backend/.gitignore[m
[36m@@ -0,0 +1,127 @@[m
[32m+[m[32m# Byte-compiled / optimized / DLL files[m
[32m+[m[32m__pycache__/[m
[32m+[m[32m*.py[cod][m
[32m+[m
[32m+[m[32m# C extensions[m
[32m+[m[32m*.so[m
[32m+[m
[32m+[m[32m# Distribution / packaging[m
[32m+[m[32m.Python[m
[32m+[m[32menv/[m
[32m+[m[32mbuild/[m
[32m+[m[32mdevelop-eggs/[m
[32m+[m[32mdist/[m
[32m+[m[32mdownloads/[m
[32m+[m[32meggs/[m
[32m+[m[32m.eggs/[m
[32m+[m[32mlib/[m
[32m+[m[32mlib64/[m
[32m+[m[32mparts/[m
[32m+[m[32msdist/[m
[32m+[m[32mvar/[m
[32m+[m[32mwheels/[m
[32m+[m[32mshare/python-wheels/[m
[32m+[m[32m*.egg-info/[m
[32m+[m[32m.installed.cfg[m
[32m+[m[32m*.egg[m
[32m+[m[32mMANIFEST[m
[32m+[m
[32m+[m[32m# PyInstaller[m
[32m+[m[32mdist/[m
[32m+[m[32m*.manifest[m
[32m+[m[32m*.spec[m
[32m+[m
[32m+[m[32m# Installer logs[m
[32m+[m[32mdebug.log[m
[32m+[m
[32m+[m[32m# Unit test / coverage reports[m
[32m+[m[32mhtmlcov/[m
[32m+[m[32m.tox/[m
[32m+[m[32m.nox/[m
[32m+[m[32m.coverage[m
[32m+[m[32m.coverage.*[m
[32m+[m[32m.cache[m
[32m+[m[32mnosetests.xml[m
[32m+[m[32mcoverage.xml[m
[32m+[m[32m*.cover[m
[32m+[m[32m.hypothesis/[m
[32m+[m[32m.pytest_cache/[m
[32m+[m
[32m+[m[32m# Translations[m
[32m+[m[32m*.mo[m
[32m+[m[32m*.pot[m
[32m+[m
[32m+[m[32m# Django stuff:[m
[32m+[m[32m*.log[m
[32m+[m[32mlocal_settings.py[m
[32m+[m[32mdb.sqlite3[m
[32m+[m
[32m+[m[32m# Flask stuff:[m
[32m+[m[32minstance/[m
[32m+[m[32m.webassets-cache[m
[32m+[m
[32m+[m[32m# Scrapy stuff:[m
[32m+[m[32m.scrapy[m
[32m+[m
[32m+[m[32m# Sphinx documentation[m
[32m+[m[32mdocs/_build/[m
[32m+[m
[32m+[m[32m# PyBuilder[m
[32m+[m[32mtarget/[m
[32m+[m
[32m+[m[32m# Jupyter Notebook[m
[32m+[m[32m.ipynb_checkpoints[m
[32m+[m
[32m+[m[32m# IPython[m
[32m+[m[32mprofile_default/[m
[32m+[m[32mipython_config.py[m
[32m+[m
[32m+[m[32m# pyenv[m
[32m+[m[32m.python-version[m
[32m+[m
[32m+[m[32m# pipenv[m
[32m+[m[32mPipfile.lock[m
[32m+[m
[32m+[m[32m# poetry[m
[32m+[m[32mpoetry.lock[m
[32m+[m
[32m+[m[32m# PEP 582; used by e.g. github.com/David-OConnor/pyflow[m
[32m+[m[32m__pypackages__/[m
[32m+[m
[32m+[m[32m# Celery[m
[32m+[m[32mcelerybeat-schedule[m
[32m+[m
[32m+[m[32m# SageMath parsed files[m
[32m+[m[32m*.sage.py[m
[32m+[m
[32m+[m[32m# Environments[m
[32m+[m[32m.env[m
[32m+[m[32m.venv[m
[32m+[m[32menv/[m
[32m+[m[32mvenv/[m
[32m+[m[32mENV/[m
[32m+[m[32menv.bak/[m
[32m+[m[32mvenv.bak/[m
[32m+[m
[32m+[m[32m# Spyder project settings[m
[32m+[m[32m.spyderproject[m
[32m+[m[32m.spyproject[m
[32m+[m
[32m+[m[32m# Rope project settings[m
[32m+[m[32m.ropeproject[m
[32m+[m
[32m+[m[32m# mkdocs documentation[m
[32m+[m[32m/site[m
[32m+[m
[32m+[m[32m# mypy[m
[32m+[m[32m.mypy_cache/[m
[32m+[m[32m.dmypy.json[m
[32m+[m
[32m+[m[32m# Pyre type checker[m
[32m+[m[32m.pyre/[m
[32m+[m
[32m+[m[32m# pytype static type analyzer[m
[32m+[m[32m.pytype/[m
[32m+[m
[32m+[m[32m# Cython debug symbols[m
[32m+[m[32mcython_debug/[m
\ No newline at end of file[m
[1mdiff --git a/backend/README.md b/backend/README.md[m
[1mnew file mode 100644[m
[1mindex 0000000..326a616[m
[1m--- /dev/null[m
[1m+++ b/backend/README.md[m
[36m@@ -0,0 +1,84 @@[m
[32m+[m[32m# Backend for Explainable LMS[m
[32m+[m
[32m+[m[32m## Installation[m
[32m+[m
[32m+[m[32mFollow these steps to set up and run the backend for the Explainable LMS project.[m
[32m+[m
[32m+[m[32m### Prerequisites[m
[32m+[m
[32m+[m[32m- Python 3.8 or higher[m
[32m+[m[32m- pip (Python package manager)[m
[32m+[m[32m- A virtual environment tool (optional but recommended)[m
[32m+[m[32m- Git (to clone the repository)[m
[32m+[m
[32m+[m[32m### Steps[m
[32m+[m
[32m+[m[32m1. **Clone the Repository**[m
[32m+[m
[32m+[m[32m   ```bash[m
[32m+[m[32m   git clone <repository-url>[m
[32m+[m[32m   cd explainable-lms/backend[m
[32m+[m[32m   ```[m
[32m+[m
[32m+[m[32m2. **Set Up a Virtual Environment (Optional)**[m
[32m+[m[32m   It is recommended to use a virtual environment to avoid dependency conflicts.[m
[32m+[m
[32m+[m[32m   ```bash[m
[32m+[m[32m   python -m venv env[m
[32m+[m[32m   source env/bin/activate  # On Windows: env\Scripts\activate[m
[32m+[m[32m   ```[m
[32m+[m
[32m+[m[32m3. **Install Dependencies**[m
[32m+[m[32m   Install the required Python packages using pip:[m
[32m+[m
[32m+[m[32m   ```bash[m
[32m+[m[32m   pip install -r requirements.txt[m
[32m+[m[32m   ```[m
[32m+[m
[32m+[m[32m4. **Set Up Environment Variables**[m
[32m+[m[32m   Create a `.env` file in the `backend` directory and add the necessary environment variables. For example:[m
[32m+[m
[32m+[m[32m   ```env[m
[32m+[m[32m   DATABASE_URL=postgresql://user:password@localhost/dbname[m
[32m+[m[32m   SECRET_KEY=your_secret_key[m
[32m+[m[32m   DEBUG=True[m
[32m+[m[32m   ```[m
[32m+[m
[32m+[m[32m5. **Run Database Migrations**[m
[32m+[m[32m   If the project uses a database, apply the migrations:[m
[32m+[m
[32m+[m[32m   ```bash[m
[32m+[m[32m   python app/database.py[m
[32m+[m[32m   ```[m
[32m+[m
[32m+[m[32m6. **Start the Backend Server**[m
[32m+[m[32m   Run the backend server:[m
[32m+[m
[32m+[m[32m   ```bash[m
[32m+[m[32m   python app/main.py[m
[32m+[m[32m   ```[m
[32m+[m
[32m+[m[32m   The server should now be running at `http://127.0.0.1:8000`.[m
[32m+[m
[32m+[m[32m## Project Structure[m
[32m+[m
[32m+[m[32m- `app/`[m
[32m+[m[32m  - Contains the main application code.[m
[32m+[m[32m- `routes/`[m
[32m+[m[32m  - Contains route handlers for different API endpoints.[m
[32m+[m[32m- `services/`[m
[32m+[m[32m  - Contains service logic for the application.[m
[32m+[m[32m- `schemas/`[m
[32m+[m[32m  - Contains data validation schemas.[m
[32m+[m[32m- `ml/`[m
[32m+[m[32m  - Contains machine learning-related code.[m
[32m+[m
[32m+[m[32m## Troubleshooting[m
[32m+[m
[32m+[m[32m- If you encounter issues with dependencies, ensure you are using the correct Python version and virtual environment.[m
[32m+[m[32m- Check the `.env` file for correct environment variable values.[m
[32m+[m[32m- Refer to the logs for debugging information.[m
[32m+[m
[32m+[m[32m## License[m
[32m+[m
[32m+[m[32mThis project is licensed under the MIT License. See the LICENSE file for details.[m
[1mdiff --git a/backend/app/__init__.py b/backend/app/__init__.py[m
[1mnew file mode 100644[m
[1mindex 0000000..e69de29[m
[1mdiff --git a/backend/app/database.py b/backend/app/database.py[m
[1mnew file mode 100644[m
[1mindex 0000000..1483966[m
[1m--- /dev/null[m
[1m+++ b/backend/app/database.py[m
[36m@@ -0,0 +1,16 @@[m
[32m+[m[32mfrom sqlalchemy import create_engine[m
[32m+[m[32mfrom sqlalchemy.ext.declarative import declarative_base[m
[32m+[m[32mfrom sqlalchemy.orm import sessionmaker[m
[32m+[m[32mimport os[m
[32m+[m[32mfrom dotenv import load_dotenv[m
[32m+[m[32mload_dotenv()[m
[32m+[m[32mDATABASE_URL = os.getenv("DATABASE_URL")[m
[32m+[m[32mengine = create_engine(DATABASE_URL)[m
[32m+[m[32mSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)[m
[32m+[m[32mBase = declarative_base()[m
[32m+[m[32mdef get_db():[m
[32m+[m[32m db = SessionLocal()[m
[32m+[m[32m try:[m
[32m+[m[32m  yield db[m
[32m+[m[32m finally:[m
[32m+[m[32m  db.close()[m
\ No newline at end of file[m
[1mdiff --git a/backend/app/main.py b/backend/app/main.py[m
[1mnew file mode 100644[m
[1mindex 0000000..dde07a6[m
[1m--- /dev/null[m
[1m+++ b/backend/app/main.py[m
[36m@@ -0,0 +1,42 @@[m
[32m+[m[32mfrom fastapi import FastAPI[m
[32m+[m[32mfrom fastapi.middleware.cors import CORSMiddleware[m
[32m+[m[32mfrom app.database import engine, Base[m
[32m+[m[32mfrom app.routes import auth, courses, students,  visualizations, users[m
[32m+[m
[32m+[m[32m# Create database tables[m
[32m+[m[32mBase.metadata.create_all(bind=engine)[m
[32m+[m
[32m+[m[32m# Initialize FastAPI app[m
[32m+[m[32mapp = FastAPI([m
[32m+[m[32m    title="Explainable ML-Powered LMS",[m
[32m+[m[32m    description="Learning Management System with ML predictions and SHAP explanations",[m
[32m+[m[32m    version="1.0.0"[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32m# Configure CORS[m
[32m+[m[32mapp.add_middleware([m
[32m+[m[32m    CORSMiddleware,[m
[32m+[m[32m    allow_origins=["http://localhost:3000", "http://localhost:5173"],[m
[32m+[m[32m    allow_credentials=True,[m
[32m+[m[32m    allow_methods=["*"],[m
[32m+[m[32m    allow_headers=["*"],[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32m# Include routers[m
[32m+[m[32mapp.include_router(auth.router)[m
[32m+[m[32mapp.include_router(courses.router)[m
[32m+[m[32mapp.include_router(students.router)[m
[32m+[m[32mapp.include_router(visualizations.router)[m
[32m+[m[32mapp.include_router(users.router)[m
[32m+[m
[32m+[m[32m@app.get("/")[m
[32m+[m[32mdef root():[m
[32m+[m[32m    return {[m
[32m+[m[32m        "message": "Explainable ML-Powered LMS API",[m
[32m+[m[32m        "version": "1.0.0",[m
[32m+[m[32m        "docs": "/docs"[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m@app.get("/health")[m
[32m+[m[32mdef health_check():[m
[32m+[m[32m    return {"status": "healthy"}[m
\ No newline at end of file[m
[1mdiff --git a/backend/app/ml/__init__.py b/backend/app/ml/__init__.py[m
[1mnew file mode 100644[m
[1mindex 0000000..e69de29[m
[1mdiff --git a/backend/app/ml/xgboost_model.pkl b/backend/app/ml/xgboost_model.pkl[m
[1mnew file mode 100644[m
[1mindex 0000000..dea5a27[m
Binary files /dev/null and b/backend/app/ml/xgboost_model.pkl differ
[1mdiff --git a/backend/app/models/__init__.py b/backend/app/models/__init__.py[m
[1mnew file mode 100644[m
[1mindex 0000000..e69de29[m
[1mdiff --git a/backend/app/models/models.py b/backend/app/models/models.py[m
[1mnew file mode 100644[m
[1mindex 0000000..290f7eb[m
[1m--- /dev/null[m
[1m+++ b/backend/app/models/models.py[m
[36m@@ -0,0 +1,82 @@[m
[32m+[m[32mfrom sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text[m
[32m+[m[32mfrom sqlalchemy.orm import relationship[m
[32m+[m[32mfrom datetime import datetime[m
[32m+[m[32mfrom app.database import Base[m
[32m+[m
[32m+[m[32mclass User(Base):[m
[32m+[m[32m    __tablename__ = "users"[m
[32m+[m[41m    [m
[32m+[m[32m    id = Column(Integer, primary_key=True, index=True)[m
[32m+[m[32m    email = Column(String, unique=True, index=True)[m
[32m+[m[32m    hashed_password = Column(String)[m
[32m+[m[32m    role = Column(String)  # 'student' or 'teacher'[m
[32m+[m[32m    full_name = Column(String)[m
[32m+[m[32m    created_at = Column(DateTime, default=datetime.utcnow)[m
[32m+[m[41m    [m
[32m+[m[32m    # Relationships[m
[32m+[m[32m    enrollments = relationship("Enrollment", back_populates="student")[m
[32m+[m[32m    courses_taught = relationship("Course", back_populates="teacher")[m
[32m+[m
[32m+[m[32mclass Course(Base):[m
[32m+[m[32m    __tablename__ = "courses"[m
[32m+[m[41m    [m
[32m+[m[32m    id = Column(Integer, primary_key=True, index=True)[m
[32m+[m[32m    title = Column(String)[m
[32m+[m[32m    description = Column(Text)[m
[32m+[m[32m    teacher_id = Column(Integer, ForeignKey("users.id"))[m
[32m+[m[32m    created_at = Column(DateTime, default=datetime.utcnow)[m
[32m+[m[41m    [m
[32m+[m[32m    # Relationships[m
[32m+[m[32m    teacher = relationship("User", back_populates="courses_taught")[m
[32m+[m[32m    enrollments = relationship("Enrollment", back_populates="course")[m
[32m+[m
[32m+[m[32mclass Enrollment(Base):[m
[32m+[m[32m    __tablename__ = "enrollments"[m
[32m+[m[41m    [m
[32m+[m[32m    id = Column(Integer, primary_key=True, index=True)[m
[32m+[m[32m    student_id = Column(Integer, ForeignKey("users.id"))[m
[32m+[m[32m    course_id = Column(Integer, ForeignKey("courses.id"))[m
[32m+[m[41m    [m
[32m+[m[32m    # Learning data[m
[32m+[m[32m    avg_assignment_score = Column(Float, default=0.0)[m
[32m+[m[32m    course_progress = Column(Float, default=0.0)[m
[32m+[m[32m    course_views = Column(Integer, default=0)[m
[32m+[m[32m    resource_clicks = Column(Integer, default=0)[m
[32m+[m[32m    engagement_frequency = Column(Float, default=0.0)[m
[32m+[m[41m    [m
[32m+[m[32m    # Prediction data[m
[32m+[m[32m    predicted_outcome = Column(String, nullable=True)  # 'Pass' or 'Fail'[m
[32m+[m[32m    prediction_probability = Column(Float, nullable=True)[m
[32m+[m[32m    prediction_date = Column(DateTime, nullable=True)[m
[32m+[m[41m    [m
[32m+[m[32m    enrolled_at = Column(DateTime, default=datetime.utcnow)[m
[32m+[m[41m    [m
[32m+[m[32m    # Relationships[m
[32m+[m[32m    student = relationship("User", back_populates="enrollments")[m
[32m+[m[32m    course = relationship("Course", back_populates="enrollments")[m
[32m+[m[32m    shap_values = relationship("ShapValue", back_populates="enrollment")[m
[32m+[m[32m    recommendations = relationship("Recommendation", back_populates="enrollment")[m
[32m+[m
[32m+[m[32mclass ShapValue(Base):[m
[32m+[m[32m    __tablename__ = "shap_values"[m
[32m+[m[41m    [m
[32m+[m[32m    id = Column(Integer, primary_key=True, index=True)[m
[32m+[m[32m    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))[m
[32m+[m[32m    feature_name = Column(String)[m
[32m+[m[32m    shap_value = Column(Float)[m
[32m+[m[32m    created_at = Column(DateTime, default=datetime.utcnow)[m
[32m+[m[41m    [m
[32m+[m[32m    # Relationships[m
[32m+[m[32m    enrollment = relationship("Enrollment", back_populates="shap_values")[m
[32m+[m
[32m+[m[32mclass Recommendation(Base):[m
[32m+[m[32m    __tablename__ = "recommendations"[m
[32m+[m[41m    [m
[32m+[m[32m    id = Column(Integer, primary_key=True, index=True)[m
[32m+[m[32m    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))[m
[32m+[m[32m    recommendation_text = Column(Text)[m
[32m+[m[32m    category = Column(String)  # 'assignment', 'engagement', 'progress'[m
[32m+[m[32m    created_at = Column(DateTime, default=datetime.utcnow)[m
[32m+[m[41m    [m
[32m+[m[32m    # Relationships[m
[32m+[m[32m    enrollment = relationship("Enrollment", back_populates="recommendations")[m
\ No newline at end of file[m
[1mdiff --git a/backend/app/routes/__init__.py b/backend/app/routes/__init__.py[m
[1mnew file mode 100644[m
[1mindex 0000000..e69de29[m
[1mdiff --git a/backend/app/routes/auth.py b/backend/app/routes/auth.py[m
[1mnew file mode 100644[m
[1mindex 0000000..1314f44[m
[1m--- /dev/null[m
[1m+++ b/backend/app/routes/auth.py[m
[36m@@ -0,0 +1,86 @@[m
[32m+[m[32mfrom fastapi import APIRouter, Depends, HTTPException, status[m
[32m+[m[32mfrom fastapi.security import OAuth2PasswordRequestForm[m
[32m+[m[32mfrom sqlalchemy.orm import Session[m
[32m+[m[32mfrom datetime import timedelta[m
[32m+[m
[32m+[m[32mfrom app.database import get_db[m
[32m+[m[32mfrom app.models.models import User[m
[32m+[m[32mfrom app.schemas.schemas import UserCreate, User as UserSchema, Token[m
[32m+[m[32mfrom app.services.auth import ([m
[32m+[m[32m    get_password_hash,[m[41m [m
[32m+[m[32m    verify_password,[m[41m [m
[32m+[m[32m    create_access_token,[m
[32m+[m[32m    get_current_user,[m
[32m+[m[32m    ACCESS_TOKEN_EXPIRE_MINUTES[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mrouter = APIRouter(prefix="/auth", tags=["authentication"])[m
[32m+[m
[32m+[m[32m@router.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)[m
[32m+[m[32mdef signup(user: UserCreate, db: Session = Depends(get_db)):[m
[32m+[m[32m    """[m
[32m+[m[32m    Register a new user (student or teacher)[m
[32m+[m[32m    """[m
[32m+[m[32m    # Check if email already exists[m
[32m+[m[32m    db_user = db.query(User).filter(User.email == user.email).first()[m
[32m+[m[32m    if db_user:[m
[32m+[m[32m        raise HTTPException([m
[32m+[m[32m            status_code=status.HTTP_400_BAD_REQUEST,[m
[32m+[m[32m            detail="Email already registered"[m
[32m+[m[32m        )[m
[32m+[m[41m    [m
[32m+[m[32m    # Validate role[m
[32m+[m[32m    if user.role not in ["student", "teacher"]:[m
[32m+[m[32m        raise HTTPException([m
[32m+[m[32m            status_code=status.HTTP_400_BAD_REQUEST,[m
[32m+[m[32m            detail="Role must be either 'student' or 'teacher'"[m
[32m+[m[32m        )[m
[32m+[m[41m    [m
[32m+[m[32m    # Create new user[m
[32m+[m[32m    hashed_password = get_password_hash(user.password)[m
[32m+[m[32m    db_user = User([m
[32m+[m[32m        email=user.email,[m
[32m+[m[32m        hashed_password=hashed_password,[m
[32m+[m[32m        full_name=user.full_name,[m
[32m+[m[32m        role=user.role[m
[32m+[m[32m    )[m
[32m+[m[32m    db.add(db_user)[m
[32m+[m[32m    db.commit()[m
[32m+[m[32m    db.refresh(db_user)[m
[32m+[m[41m    [m
[32m+[m[32m    return db_user[m
[32m+[m
[32m+[m[32m@router.post("/login", response_model=Token)[m
[32m+[m[32mdef login([m
[32m+[m[32m    form_data: OAuth2PasswordRequestForm = Depends(),[m[41m [m
[32m+[m[32m    db: Session = Depends(get_db)[m
[32m+[m[32m):[m
[32m+[m[32m    """[m
[32m+[m[32m    Login with email and password to get access token[m
[32m+[m[32m    """[m
[32m+[m[32m    # Find user by email[m
[32m+[m[32m    user = db.query(User).filter(User.email == form_data.username).first()[m
[32m+[m[41m    [m
[32m+[m[32m    # Verify password[m
[32m+[m[32m    if not user or not verify_password(form_data.password, user.hashed_password):[m
[32m+[m[32m        raise HTTPException([m
[32m+[m[32m            status_code=status.HTTP_401_UNAUTHORIZED,[m
[32m+[m[32m            detail="Incorrect email or password",[m
[32m+[m[32m            headers={"WWW-Authenticate": "Bearer"},[m
[32m+[m[32m        )[m
[32m+[m[41m    [m
[32m+[m[32m    # Create access token[m
[32m+[m[32m    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)[m
[32m+[m[32m    access_token = create_access_token([m
[32m+[m[32m        data={"sub": user.email, "role": user.role},[m[41m [m
[32m+[m[32m        expires_delta=access_token_expires[m
[32m+[m[32m    )[m
[32m+[m[41m    [m
[32m+[m[32m    return {"access_token": access_token, "token_type": "bearer"}[m
[32m+[m
[32m+[m[32m@router.get("/me", response_model=UserSchema)[m
[32m+[m[32mdef get_current_user_info(current_user: User = Depends(get_current_user)):[m
[32m+[m[32m    """[m
[32m+[m[32m    Get current logged-in user information[m
[32m+[m[32m    """[m
[32m+[m[32m    return current_user[m
\ No newline at end of file[m
[1mdiff --git a/backend/app/routes/courses.py b/backend/app/routes/courses.py[m
[1mnew file mode 100644[m
[1mindex 0000000..c1f4938[m
[1m--- /dev/null[m
[1m+++ b/backend/app/routes/courses.py[m
[36m@@ -0,0 +1,167 @@[m
[32m+[m[32mfrom fastapi import APIRouter, Depends, HTTPException, status[m
[32m+[m[32mfrom sqlalchemy.orm import Session[m
[32m+[m[32mfrom typing import List[m
[32m+[m
[32m+[m[32mfrom app.database import get_db[m
[32m+[m[32m
