from datetime import datetime, timedelta

from app.models.active_session import ActiveSession

def heartbeat(db, session_id:str, song_id: int | None, category_id: str | None):
    active_session = db.query(ActiveSession).filter(ActiveSession.session_id == session_id).first()
    if not active_session:
        active_session = ActiveSession(
            session_id = session_id,
            current_song_id = song_id,
            current_category_id = category_id,
            last_seen_at = datetime.utcnow()
        )
        db.add(active_session)
    else:
        active_session.current_song_id = song_id
        active_session.current_category_id = category_id
        active_session.last_seen_at = datetime.utcnow()
    db.flush()
    return active_session

def current_listener_count(db):
    cutoff_time = datetime.utcnow() - timedelta(seconds=60)

    return db.query(ActiveSession).filter(ActiveSession.last_seen_at >= cutoff_time).count()

def active_listeners(db):
    cutoff_time = datetime.utcnow() - timedelta(seconds=60)
    return db.query(ActiveSession).filter(ActiveSession.last_seen_at >= cutoff_time).all()

def cleanup_expired_sessions(db):
    cutoff_time = datetime.utcnow() - timedelta(minutes=5)
    deleted = db.query(ActiveSession).filter(ActiveSession.last_seen_at >= cutoff_time).delete()
    db.commit()
    return deleted

def get_listener_summary(db):
    current = current_listener_count(db)
    return {
        "current_listeners": current
    }