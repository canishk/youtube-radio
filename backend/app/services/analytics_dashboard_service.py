from collections import Counter

from sqlalchemy import desc, case, Float
from app.models.song import Song
from app.models.category import Category
from app.models.song_statistics import SongStatistics
from app.models.category_statistics import CategoryStatistics
from app.services.analytics_service import get_analytics_summary
from app.services.stats_service import get_current_listener_count

def get_top_songs(db, limit:int=10):
    completion_ratio = case(
        (SongStatistics.play_count > 0,
         SongStatistics.completion_count.cast(Float) / SongStatistics.play_count),
        else_=0.0,
    )
    results = db.query(
        Song.id,
        Song.title,
        SongStatistics.play_count,
        SongStatistics.completion_count,
        SongStatistics.resume_count,
    ).join(SongStatistics, Song.id == SongStatistics.song_id).order_by(
        desc(SongStatistics.play_count),
        desc(completion_ratio),
    ).limit(limit).all()

    return [
        {
            "song_id": result.id,
            "title": result.title,
            "play_count": result.play_count,
            "completion_count": result.completion_count,
            "resume_count": result.resume_count,
            "completion_rate": round((result.completion_count / result.play_count) * 100) if result.play_count > 0 else 0,
        } for result in results
    ]

def get_top_categories(db, limit:int=10):
    results = db.query(
        Category.id,
        Category.name,
        CategoryStatistics.entry_count,
        CategoryStatistics.completion_count,
    ).join(CategoryStatistics, Category.id == CategoryStatistics.category_id).order_by(desc(CategoryStatistics.entry_count)).limit(limit).all()

    return [
        {
            "category_id": result.id,
            "name": result.name,
            "entries": result.entry_count,
            "completions": result.completion_count,
        } for result in results
    ]

def get_top_moods(db, limit:int=10):
    songs = (
        db.query(Song)
        .join(SongStatistics, Song.id == SongStatistics.song_id)
        .all()
    )

    mood_counts = Counter()
    for song in songs:
        for mood in song.get_moods():
            if mood:
                mood_counts[mood] += 1

    return [
        {"mood": mood, "count": count}
        for mood, count in mood_counts.most_common(limit)
    ]


def get_dashboard_data(db):
    analytics = get_analytics_summary(db)
    analytics["current_listeners"] = get_current_listener_count(db)
    # analytics["top_songs"] = get_top_songs(db)
    # analytics["top_categories"] = get_top_categories(db)
    # analytics["top_moods"] = get_top_moods(db)
    return analytics