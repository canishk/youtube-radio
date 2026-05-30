import random
import json
from sqlalchemy.orm import Session
from app.models.song import Song
from app.models.video_health import VideoHealth


from app.services.history_service import get_recently_played

def check_playability(youtube_video_id: str, db: Session) -> bool:
    video_health = db.query(VideoHealth).filter(VideoHealth.youtube_video_id == youtube_video_id).first()
    if video_health and video_health.is_playable is False:
        return False
    return True


def select_weighted_song(
    songs,
    time_bucket,
    recently_played,
    db: Session,
):
    weighted_pool = []
    filtered_songs = [song for song in songs if song.youtube_video_id not in recently_played]
    if not filtered_songs:
        filtered_songs = songs
    for song in filtered_songs:
        if not check_playability(song.youtube_video_id, db):
            continue
        weight = 1
        time_slots = json.loads(song.time_slots) if song.time_slots else []
        moods = json.loads(song.moods) if song.moods else []
        if time_bucket in time_slots:
            weight += 5
        energy = int(song.energy or 5)

        if time_bucket in ["night", "late_night", "deep_night"]:
            if energy <= 3:
                weight += 4
            if "melody" in moods or "night" in moods:
                weight += 2
        
        if time_bucket in ["morning", "workday"]:
            if energy >= 6:
                weight += 4
            if "energetic" in moods:
                weight += 2
        
        
        priority = song.priority or 5

        weight += priority

        for _ in range(weight):
            weighted_pool.append(song)
    return random.choice(weighted_pool) if weighted_pool else None