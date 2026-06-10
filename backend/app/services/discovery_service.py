from datetime import datetime, timedelta

from app.models.session_song_history import SessionSongHistory
from app.models.song_statistics import SongStatistics

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


def get_song_stats_map(db, song_ids: list[int]) -> dict[int, SongStatistics]:
    if not song_ids:
        return {}
    rows = db.query(SongStatistics).filter(SongStatistics.song_id.in_(song_ids)).all()
    return {row.song_id: row for row in rows}


def calculate_discovery_score(
    song,
    stats
):

    play_count = (
        stats.play_count
        if stats
        else 0
    )

    completion_count = (
        stats.completion_count
        if stats
        else 0
    )

    resume_count = (
        stats.resume_count
        if stats
        else 0
    )

    return (
        1
        + (play_count * 0.1)
        + (completion_count * 2)
        + (resume_count * 0.5)
    )