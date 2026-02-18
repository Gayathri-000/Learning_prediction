from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.models import User, Course, Video, VideoProgress, Enrollment
from app.schemas.schemas import (
    VideoCreate,
    VideoUpdate,
    VideoResponse,
    VideoProgressCreate,
    VideoProgressResponse,
    VideoWithProgress
)
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/videos", tags=["videos"])

@router.post("/", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
def create_video(
    video: VideoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Create a new video (teacher only)
    """
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == video.course_id,
        Course.teacher_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied or course not found"
        )
    
    # Create video
    db_video = Video(
        course_id=video.course_id,
        title=video.title,
        description=video.description,
        video_url=video.video_url,
        duration=video.duration
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    
    return db_video

@router.get("/course/{course_id}", response_model=List[VideoWithProgress])
def get_course_videos(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all videos for a course with progress (if student)
    """
    # Verify access
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course"
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
    
    # Get all videos
    videos = db.query(Video).filter(Video.course_id == course_id).all()
    
    # Add progress if student
    result = []
    for video in videos:
        video_dict = {
            "id": video.id,
            "course_id": video.course_id,
            "title": video.title,
            "description": video.description,
            "video_url": video.video_url,
            "duration": video.duration,
            "created_at": video.created_at,
            "progress": None
        }
        
        if current_user.role == "student":
            progress = db.query(VideoProgress).filter(
                VideoProgress.video_id == video.id,
                VideoProgress.student_id == current_user.id
            ).first()
            
            if progress:
                video_dict['progress'] = {
                    "id": progress.id,
                    "video_id": progress.video_id,
                    "student_id": progress.student_id,
                    "watch_time": progress.watch_time,
                    "completed": progress.completed,
                    "last_watched": progress.last_watched
                }
        
        result.append(video_dict)
    
    return result

@router.get("/{video_id}", response_model=VideoWithProgress)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific video with progress
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Verify access
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == video.course_id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == "teacher":
        course = db.query(Course).filter(
            Course.id == video.course_id,
            Course.teacher_id == current_user.id
        ).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    video_dict = {
        "id": video.id,
        "course_id": video.course_id,
        "title": video.title,
        "description": video.description,
        "video_url": video.video_url,
        "duration": video.duration,
        "created_at": video.created_at,
        "progress": None
    }
    
    if current_user.role == "student":
        progress = db.query(VideoProgress).filter(
            VideoProgress.video_id == video.id,
            VideoProgress.student_id == current_user.id
        ).first()
        
        if progress:
            video_dict['progress'] = {
                "id": progress.id,
                "video_id": progress.video_id,
                "student_id": progress.student_id,
                "watch_time": progress.watch_time,
                "completed": progress.completed,
                "last_watched": progress.last_watched
            }
    
    return video_dict

@router.put("/{video_id}", response_model=VideoResponse)
def update_video(
    video_id: int,
    video_update: VideoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Update video details (teacher only)
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == video.course_id,
        Course.teacher_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update fields
    if video_update.title is not None:
        video.title = video_update.title
    if video_update.description is not None:
        video.description = video_update.description
    if video_update.video_url is not None:
        video.video_url = video_update.video_url
    if video_update.duration is not None:
        video.duration = video_update.duration
    
    db.commit()
    db.refresh(video)
    
    return video

@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Delete a video (teacher only)
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Verify teacher owns the course
    course = db.query(Course).filter(
        Course.id == video.course_id,
        Course.teacher_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(video)
    db.commit()
    
    return {"message": "Video deleted successfully"}

@router.post("/{video_id}/progress", response_model=VideoProgressResponse)
def update_video_progress(
    video_id: int,
    progress_data: VideoProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """
    Update video watch progress (student only)
    Updates course_progress and course_views in enrollment
    """
    # Verify video exists
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Verify student is enrolled
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == video.course_id
    ).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this course"
        )
    
    # Get or create progress record
    progress = db.query(VideoProgress).filter(
        VideoProgress.video_id == video_id,
        VideoProgress.student_id == current_user.id
    ).first()
    
    if progress:
        # Update existing progress
        progress.watch_time = max(progress.watch_time, progress_data.watch_time)
        progress.completed = progress_data.completed or progress.completed
        progress.last_watched = datetime.utcnow()
    else:
        # Create new progress
        progress = VideoProgress(
            video_id=video_id,
            student_id=current_user.id,
            watch_time=progress_data.watch_time,
            completed=progress_data.completed
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    
    # Update course_progress and course_views in enrollment
    update_enrollment_from_video_progress(db, enrollment.id, current_user.id, video.course_id)
    
    return progress

@router.get("/course/{course_id}/progress", response_model=List[VideoProgressResponse])
def get_course_video_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """
    Get all video progress for a course (student only)
    """
    # Verify enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this course"
        )
    
    # Get all videos in the course
    videos = db.query(Video).filter(Video.course_id == course_id).all()
    video_ids = [v.id for v in videos]
    
    # Get progress for all videos
    progress_records = db.query(VideoProgress).filter(
        VideoProgress.video_id.in_(video_ids),
        VideoProgress.student_id == current_user.id
    ).all()
    
    return progress_records

@router.get("/course/{course_id}/stats")
def get_course_video_stats(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """
    Get video viewing statistics for all students (teacher only)
    """
    # Verify teacher owns course
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.teacher_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get all videos
    videos = db.query(Video).filter(Video.course_id == course_id).all()
    
    # Get all enrollments
    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).all()
    
    stats = []
    for video in videos:
        # Get all progress for this video
        progress_records = db.query(VideoProgress).filter(
            VideoProgress.video_id == video.id
        ).all()
        
        total_students = len(enrollments)
        students_watched = len(progress_records)
        students_completed = len([p for p in progress_records if p.completed])
        avg_watch_time = sum([p.watch_time for p in progress_records]) / max(students_watched, 1)
        
        stats.append({
            "video_id": video.id,
            "video_title": video.title,
            "total_students": total_students,
            "students_watched": students_watched,
            "students_completed": students_completed,
            "completion_rate": (students_completed / total_students * 100) if total_students > 0 else 0,
            "avg_watch_time": avg_watch_time
        })
    
    return stats

def update_enrollment_from_video_progress(db: Session, enrollment_id: int, student_id: int, course_id: int):
    """
    Helper function to update enrollment course_progress and course_views based on video watching
    """
    # Get all videos in course
    videos = db.query(Video).filter(Video.course_id == course_id).all()
    total_videos = len(videos)
    
    if total_videos == 0:
        return
    
    # Get all progress records for this student
    video_ids = [v.id for v in videos]
    progress_records = db.query(VideoProgress).filter(
        VideoProgress.video_id.in_(video_ids),
        VideoProgress.student_id == student_id
    ).all()
    
    # Calculate video completion percentage (this will update course_progress)
    completed_videos = len([p for p in progress_records if p.completed])
    video_completion_percentage = (completed_videos / total_videos) * 100
    
    # Count total views (number of videos watched at least partially)
    videos_watched = len([p for p in progress_records if p.watch_time > 0])
    
    # Update enrollment
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if enrollment:
        # Update course_progress with video completion percentage
        enrollment.course_progress = video_completion_percentage
        
        # Update course_views with number of videos watched
        enrollment.course_views = videos_watched
        
        db.commit()