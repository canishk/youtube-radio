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