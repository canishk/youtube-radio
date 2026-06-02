from datetime import datetime, timedelta

from app.models.session import Session
from app.models.playback_history import PlaybackHistory

def cleanup_expired_sessions(db):
    cutoff = datetime.utcnow() - timedelta(hours=48)

    expired_sessions = db.query(Session).filter(Session.created_at < cutoff).all()
    for session in expired_sessions:
        db.query(PlaybackHistory).filter(PlaybackHistory.session_id == session.id).delete()
        db.delete(session)
    db.commit()
    