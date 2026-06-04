from datetime import datetime, timedelta

from app.models.session import Session

def get_current_listener_count(db):
    cutoff_time = datetime.utcnow() - timedelta(minutes=10)
    return db.query(Session).filter(Session.last_seen_at >= cutoff_time).count()
