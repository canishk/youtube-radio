from datetime import datetime

from app.models.playback_history import PlaybackHistory

def log_playback(
        db,
        category_id,
        youtube_video_id
):
    history = PlaybackHistory(
        category_id=category_id,
        youtube_video_id=youtube_video_id,
        played_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

def get_recently_played(db, category_id, limit=10):
    history = db.query(
        PlaybackHistory
    ).filter(
        PlaybackHistory.category_id == category_id
    ).order_by(
        PlaybackHistory.played_at.desc()
    ).limit(limit).all()

    return [
        item.youtube_video_id for item in history
    ]
