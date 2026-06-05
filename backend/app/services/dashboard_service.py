from fastapi import Depends
from sqlalchemy.orm import Session

from app.models.song import Song
from app.models.category import Category
from app.models.video_health import VideoHealth
from app.db.session import get_db

def get_dashboard_data(db:Session = Depends(get_db)):
    total_songs = db.query(Song).count()
    total_categories = db.query(Category).count()
    failed_video = db.query(VideoHealth).filter(VideoHealth.is_playable == False).count()
    total_video_health = total_songs - failed_video

    missing_moods = db.query(Song).filter((Song.moods == None) | (Song.moods == '')).count()
    missing_time_slots = db.query(Song).filter((Song.time_slots == None) | (Song.time_slots == '')).count()
    missing_energy = db.query(Song).filter((Song.energy == None) | (Song.energy == '')).count()
    missing_priority = db.query(Song).filter((Song.priority == None)).count()

    category_health = []
    categories = db.query(Category).all()
    for category in categories:
        song_count = db.query(Song).filter(Song.category_id == category.id).count()
        category_health.append({
            "id": category.id,
            "name": category.name,
            "song_count": song_count,
            "low_inventory": song_count < 10
        })
    category_health.sort(key=lambda x: x['song_count'])

    mood_coverage = round((total_songs - missing_moods)/max(total_songs, 1) * 100, 2)
    time_slot_coverage = round((total_songs - missing_time_slots)/max(total_songs, 1) * 100, 2)
    energy_coverage = round((total_songs - missing_energy)/max(total_songs, 1) * 100, 2)
    priority_coverage = round((total_songs - missing_priority)/max(total_songs, 1) * 100, 2)

    return {
        "overview": {
            "total_songs": total_songs,
            "total_categories": total_categories,
            "total_video_health": total_video_health,
            "failed_video": failed_video
        },
        "metadata": {
            "missing_moods": missing_moods,
            "missing_time_slots": missing_time_slots,
            "missing_energy": missing_energy,
            "missing_priority": missing_priority,
            "mood_coverage": mood_coverage,
            "time_slot_coverage": time_slot_coverage,
            "energy_coverage": energy_coverage,
            "priority_coverage": priority_coverage
        },
        "category_health": category_health
    }

# def get_dashboard_data(db:Session = Depends(get_db)):
#     total_songs = db.query(Song).count()
#     return {
#         "total_songs": total_songs
#     }