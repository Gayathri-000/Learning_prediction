from app.database import engine, Base
from app.models.models import Test, TestQuestion, TestSubmission, TestAnswer

def create_test_tables():
    """Create test-related tables in the database"""
    print("Creating test tables...")
    Base.metadata.create_all(bind=engine)
    print("Test tables created successfully!")

if __name__ == "__main__":
    create_test_tables()