from datetime import datetime

from app.models.session import Session

def register_session(db, session_id: str):
    existing = db.query(Session).filter(Session.session_id == session_id).first()
    if existing:
        existing.last_seen_at = datetime.utcnow()
        db.commit()
        return existing
    session = Session(session_id=session_id)
    db.add(session)
    db.commit()
    return session

def update_last_category(db, session_id: str, category_id: str):
    session = db.query(Session).filter(Session.session_id == session_id).first()
    if session:
        session.last_category = category_id
        session.last_seen_at = datetime.utcnow()
        db.commit()

def get_session_info(db, session_id: str):
    return db.query(Session).filter(Session.session_id == session_id).first()

def update_current_song(db, session_id: str, song_id: int, category_id: str):
    session = db.query(Session).filter(Session.session_id == session_id).first()
    if not session:
        return None
    session.last_song_id = song_id
    session.last_category = category_id
    session.last_song_started_at = datetime.utcnow()
    session.playback_position_seconds = 0
    db.commit()
    db.refresh(session)
    return session

def update_playback_position(db,session_id: str, song_id: int, position_seconds: int):
    session = db.query(Session).filter(Session.session_id == session_id).first()
    if not session:
        return None
    session.last_song_id = song_id
    session.playback_position_seconds = position_seconds
    session.last_position_updated_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session