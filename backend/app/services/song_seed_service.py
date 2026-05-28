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
            song = Song(
                category_id=song_data["category_id"],
                youtube_video_id=song_data["youtube_video_id"],
                title=song_data["title"],
                movie=song_data["movie"],
                moods=song_data["moods"],
                energy=song_data["energy"],
                time_slots=song_data["time_slots"],
                priority=song_data["priority"]
            )
            db.add(song)
        db.commit()
    