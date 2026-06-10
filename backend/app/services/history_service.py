from datetime import datetime

from app.models.playback_history import PlaybackHistory

def log_playback(
        db,
        session_id,
        category_id,
        youtube_video_id
):
    history = PlaybackHistory(
        session_id=session_id,
        category_id=category_id,
        youtube_video_id=youtube_video_id,
        played_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

def get_recently_played(db, session_id, category_id, limit=10):
    history = db.query(
        PlaybackHistory
    ).filter(
        PlaybackHistory.session_id == session_id
    ).filter(
        PlaybackHistory.category_id == category_id
    ).order_by(
        PlaybackHistory.played_at.desc()
    ).limit(limit).all()

    return [
        item.youtube_video_id for item in history
    ]


def get_session_played_video_ids(db, session_id, category_id) -> set[str]:
    rows = (
        db.query(PlaybackHistory.youtube_video_id)
        .filter(PlaybackHistory.session_id == session_id)
        .filter(PlaybackHistory.category_id == category_id)
        .distinct()
        .all()
    )
    return {row[0] for row in rows}
