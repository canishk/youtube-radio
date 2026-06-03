import json

from app.models.metadata_suggestion import MetadataSuggestion


MOOD_RULES = {
    "party": ["party", "celebration", "club"],
    "dance": ["dance", "remix", "dj"],
    "romantic": ["love", "romantic", "heart"],
    "sad": ["sad", "alone", "missing", "breakup"],
    "devotional": ["god", "bhajan", "devotional"],
    "workout": ["gym", "workout", "fitness"],
    "chill": ["lofi", "acoustic", "relax"],
}

ENERGY_RULES = {
    9: ["party", "dance", "dj", "remix"],
    7: ["rock", "workout", "gym"],
    5: ["melody", "love", "romantic"],
    3: ["soft", "acoustic", "chill"],
    1: ["sad", "devotional"]
}


TIME_SLOT_RULES = {
    "morning": [
        "devotional",
        "romantic",
        "morning"
    ],

    "afternoon": [
        "chill",
        "dance",
        "workout"
    ],

    "evening": [
        "romantic",
        "melody",
        "party"
    ],

    "night": [
        "party",
        "dance",
        "dj"
    ],

    "late_night": [
        "sad",
        "devotional",
        "romantic"
    ]
}


def generate_suggestions(
        title: str,
        movie: str = "",
        channel_name: str = "",
        description: str = "",
):
    text = f"{title or ''} {movie or ''} {channel_name or ''} {description or ''}".lower()
    moods = []

    for mood, keywords in MOOD_RULES.items():
        if any(keyword in text for keyword in keywords):
            moods.append(mood)
        if not moods:
            moods.append("chill")
    
    energy = 3
    for score, keywords in ENERGY_RULES.items():
        if any(keyword in text for keyword in keywords):
            energy = score
            break
    
    time_slots = []
    for slot, keywords in TIME_SLOT_RULES.items():
        if any(keyword in text for keyword in keywords):
            time_slots.append(slot)
        if not time_slots:
            time_slots.append("evening")
    
    priority = min(10, max(5, len(moods) + energy))

    return {
        "moods": moods,
        "time_slots": time_slots,
        "energy": energy,
        "priority": priority
    }

def save_suggestion(
        db,
        song_id: int,
        suggestion: dict,
):
    record = MetadataSuggestion(
        song_id=song_id,
        suggested_moods=json.dumps(suggestion["moods"]),
        suggested_time_slots=json.dumps(suggestion["time_slots"]),
        suggested_energy=suggestion["energy"],
        suggested_priority=suggestion["priority"],
        suggestion_source="rules",
    )
    db.add(record)
    db.commit()
    return record

def generate_and_save(
        db,
        song
):
    suggestion = generate_suggestions(song.title, song.movie)
    return save_suggestion(db, song.id, suggestion)


def get_latest_suggestion(db, song_id: int):
    return db.query(MetadataSuggestion).filter_by(song_id=song_id).order_by(MetadataSuggestion.created_at.desc()).first()

