import random
from sqlalchemy.orm import Session

from app.models.song import Song

def select_weighted_song(
        songs,
        time_bucket
):
    weighted_pool = []
    for song in songs:
        weight = 1
        time_slots = song.time_slots or "".split(",")
        moods = song.moods or "".split(",")
        if time_bucket in time_slots:
            weight += 5
        energy = int(song.energy or 5)

        if time_bucket in ["night", "late_night", "deep_night"]:
            if energy <= 3:
                weight += 4
        
        if time_bucket in ["morning", "workday"]:
            if energy >= 6:
                weight += 4
        
        if "melody" in moods:
            weight += 2
        
        priority = song.priority or 5

        weight += priority

        for _ in range(weight):
            weighted_pool.append(song)
    return random.choice(weighted_pool) if weighted_pool else None