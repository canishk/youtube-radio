from datetime import datetime
 
from app.models.video_health import VideoHealth

def record_failure(db,youtube_video_id, reason):
    video = db.query(
        VideoHealth
    ).filter(
        VideoHealth.youtube_video_id == youtube_video_id
    ).first()

    if not video:
        video = VideoHealth(
            youtube_video_id=youtube_video_id
        )
        db.add(video)

    video.failure_count += 1
    video.last_failure_reason = reason
    video.last_failure_time = datetime.utcnow()
    if video.failure_count >= 3:
        video.is_playable = False
    db.commit()
    