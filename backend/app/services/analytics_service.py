from datetime import datetime
from sqlalchemy.sql import func

from app.models.song_statistics import SongStatistics
from app.models.category_statistics import CategoryStatistics
from app.models.song import Song

def get_or_create_song_stats(db, song_id:int):
    stats = db.query(SongStatistics).filter(SongStatistics.song_id == song_id).first()
    if not stats:
        stats = SongStatistics(song_id=song_id)
        db.add(stats)
        db.flush()
    return stats

def get_or_create_category_stats(db, category_id: str):
    print(category_id)
    stats = db.query(CategoryStatistics).filter(CategoryStatistics.category_id == category_id).first()
    if not stats:
        stats = CategoryStatistics(category_id= category_id)
        db.add(stats)
        db.flush()
    return stats

def track_song_play(db, song_id: int):
    song_stats = get_or_create_song_stats(db, song_id)
    song_stats.play_count +=1
    song_stats.last_played_at = datetime.utcnow()
    db.commit()

def track_category_entry(db, category_id: str):
    category_stats = get_or_create_category_stats(db, category_id)
    category_stats.entry_count +=1
    category_stats.last_played_at = datetime.utcnow()
    db.commit()


def track_song_completion(db, song_id: int, category_id: str):
    if not category_id:
        song = db.query(Song).filter(Song.id == song_id).first()
        if not song:
            return
        category_id = song.category_id
    
    song_stats = get_or_create_song_stats(db, song_id)
    song_stats.completion_count +=1

    category_stats = get_or_create_category_stats(db, category_id)
    category_stats.completion_count +=1

    db.commit()

def track_song_resume(db, song_id: int):

    song_stats = get_or_create_song_stats(db, song_id)
    song_stats.resume_count += 1

    db.commit()

def get_analytics_summary(db):

    song_count = (
        db.query(SongStatistics)
        .count()
    )

    totals = (
        db.query(
            func.sum(SongStatistics.play_count),
            func.sum(SongStatistics.completion_count),
            func.sum(SongStatistics.resume_count)
        )
        .first()
    )

    plays = totals[0] or 0
    completions = totals[1] or 0
    resumes = totals[2] or 0

    estimated_skips = max(
        0,
        plays - completions
    )
    completion_rate = round((completions/plays) * 100) if plays > 0 else 0

    return {

        "songs_tracked":
            song_count,

        "plays":
            plays,

        "completions":
            completions,

        "estimated_skips":
            estimated_skips,

        "resumes":
            resumes,
        "completion_rate":
            completion_rate
    }

