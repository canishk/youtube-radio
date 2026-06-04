import json


MOOD_RULES = {
    "party": ["party", "celebration", "club"],
    "dance": ["dance", "remix", "dj"],
    "romantic": ["love", "romantic", "heart"],
    "sad": ["sad", "alone", "missing", "breakup"],
    "devotional": ["god", "bhajan", "devotional"],
    "workout": ["gym", "workout", "fitness"],
    "melody": ["lofi", "acoustic", "relax"],
    "peaceful": ["peaceful", "calm", "meditation"],
    "friendship": ["friendship", "friends", "bff"],
}

ENERGY_RULES = {
    9: ["party", "dance", "dj", "remix"],
    7: ["rock", "workout", "gym"],
    5: ["melody", "love", "romantic"],
    3: ["soft", "acoustic", "melody"],
    1: ["sad", "devotional"]
}


TIME_SLOT_RULES = {
    "morning": [
        "melody",
        "romantic",
        "morning"
    ],
    "workday": [
        "workout",
        "gym",
        "focus",
        "dj"
    ],

    "afternoon": [
        "melody",
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
    ],
    "deep_night": [
        "sad",
        "romantic",
        "friendship",
        "night",
        "peaceful"
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
            moods.append("melody")
    
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

