from datetime import datetime, timedelta

from app.models.session import Session
from app.models.playback_history import PlaybackHistory
from app.models.session_song_history import SessionSongHistory
from app.services.discovery_service import cleanup_old_history

def cleanup_expired_sessions(db):
    cutoff = datetime.utcnow() - timedelta(hours=48)
    history_cutoff = datetime.utcnow() - timedelta(days=14)
    expired_sessions = db.query(Session).filter(Session.created_at < cutoff).all()
    count = len(expired_sessions)
    for session in expired_sessions:
        db.query(PlaybackHistory).filter(PlaybackHistory.session_id == session.session_id).delete()
        db.query(SessionSongHistory).filter(SessionSongHistory.session_id == session.session_id).delete()
        db.delete(session)
    db.commit()
    count += db.query(PlaybackHistory).filter(PlaybackHistory.played_at < history_cutoff).delete()
    count += cleanup_old_history(db)
    db.commit()
    return count
    