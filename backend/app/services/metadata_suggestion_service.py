import json


MOOD_RULES = {

    "melody": [
        "melody",
        "melodies",
        "soft songs"
    ],

    "travel": [
        "travel",
        "journey",
        "road trip",
        "roadtrip",
        "drive"
    ],

    "rain": [
        "rain",
        "mazha",
        "monsoon"
    ],

    "romantic": [
        "love",
        "romantic",
        "heart",
        "valentine"
    ],

    "sad": [
        "sad",
        "alone",
        "missing",
        "broken"
    ],

    "energetic": [
        "energy",
        "energetic",
        "workout",
        "gym",
        "motivation",
        "fitness"
    ],

    "party": [
        "party",
        "celebration",
        "club"
    ],

    "devotional": [
        "god",
        "bhajan",
        "devotional",
        "krishna",
        "shiva",
        "allah",
        "jesus",
        "temple"
    ],

    "nostalgia": [
        "retro",
        "classic",
        "80s",
        "90s",
        "old hits",
        "evergreen"
    ],

    "friendship": [
        "friend",
        "friends",
        "friendship"
    ],

    "motivation": [
        "motivation",
        "motivational",
        "success",
        "winner",
        "inspire"
    ],

    "dance": [
        "dance",
        "remix",
        "dj",
        "mix"
    ],

    "night": [
        "night",
        "late night",
        "midnight"
    ],

    "peaceful": [
        "peaceful",
        "relax",
        "calm",
        "lofi",
        "acoustic",
        "instrumental"
    ]
}

ENERGY_RULES = {

    5: [
        "party",
        "dance",
        "dj",
        "remix",
        "workout",
        "gym"
    ],

    4: [
        "motivation",
        "travel",
        "roadtrip"
    ],

    3: [
        "melody",
        "romantic"
    ],

    2: [
        "peaceful",
        "acoustic",
        "instrumental"
    ],

    1: [
        "sad",
        "devotional"
    ]
}

TIME_SLOT_RULES = {

    "morning": [
        "devotional",
        "motivation"
    ],

    "afternoon": [
        "travel",
        "friendship"
    ],

    "evening": [
        "melody",
        "romantic"
    ],

    "night": [
        "party",
        "dance",
        "night"
    ],

    "late_night": [
        "sad",
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

    confidence = min(100, (len(moods) * 20 + len(time_slots) * 5))

    return {
        "moods": moods,
        "time_slots": time_slots,
        "energy": energy,
        "priority": priority,
        "confidence": confidence
    }

