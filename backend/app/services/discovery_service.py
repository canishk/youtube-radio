from datetime import datetime, timedelta

from app.models.session_song_history import SessionSongHistory

def record_song_play(
    db,
    session_id,
    song_id,
    category_id,
):
    session_song_history = SessionSongHistory(
        session_id=session_id,
        song_id=song_id,
        category_id=category_id,
    )
    db.add(session_song_history)

def get_recent_song_ids(
    db,
    session_id,
    limit=10,
):
    recent_history = db.query(SessionSongHistory).filter(SessionSongHistory.session_id == session_id).order_by(SessionSongHistory.played_at.desc()).limit(limit).all()
    return [history.song_id for history in recent_history]

def cleanup_old_history(
    db,
    days=15
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    return db.query(SessionSongHistory).filter(SessionSongHistory.played_at < cutoff).delete()
