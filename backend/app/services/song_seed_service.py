import json
from sqlalchemy.orm import Session

from app.models import Song

def seed_songs(db: Session):
    existing = db.query(Song).first()
    if existing:
        return
    
    with open("app/data/songs.json", "r") as file:
        songs = json.load(file)

        for song_data in songs:
            # Accept either a JSON string or an already-parsed list for moods/time_slots
            raw_moods = song_data.get("moods")
            if isinstance(raw_moods, str):
                try:
                    moods = json.loads(raw_moods)
                except Exception:
                    moods = []
            else:
                moods = raw_moods or []

            raw_time_slots = song_data.get("time_slots")
            if isinstance(raw_time_slots, str):
                try:
                    time_slots = json.loads(raw_time_slots)
                except Exception:
                    time_slots = []
            else:
                time_slots = raw_time_slots or []

            song = Song(
                category_id=song_data["category_id"],
                youtube_video_id=song_data["youtube_video_id"],
                title=song_data["title"],
                movie=song_data["movie"],
                moods=json.dumps(moods),
                energy=song_data["energy"],
                time_slots=json.dumps(time_slots),
                priority=song_data["priority"]
            )
            db.add(song)
        db.commit()
    