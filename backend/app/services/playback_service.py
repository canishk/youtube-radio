import random

from sqlalchemy.orm import Session

from app.constants.playback_preferences import TIME_SLOT_PROFILES
from app.models.video_health import VideoHealth
from app.services.taste_service import get_session_taste_profile
from app.services.discovery_service import calculate_discovery_score, get_song_stats_map


def check_playability(youtube_video_id: str, db: Session) -> bool:
    video_health = db.query(VideoHealth).filter(VideoHealth.youtube_video_id == youtube_video_id).first()
    if video_health and video_health.is_playable is False:
        return False
    return True


def _score_song(song, time_bucket: str, taste_profile, stats=None) -> float:
    score = calculate_discovery_score(song, stats)
    moods = song.get_moods()
    time_slots = song.get_time_slots()
    energy = int(song.energy or 5)
    slot_profile = TIME_SLOT_PROFILES.get(time_bucket, {})

    if taste_profile.source != "none":
        taste_mood_bonus = sum(
            taste_profile.mood_weights.get(mood, 0.0) * 4
            for mood in moods
        )
        score += min(taste_mood_bonus, 12)

        energy_distance = abs(energy - taste_profile.preferred_energy)
        score += max(0.0, 6.0 - energy_distance)

    if time_bucket in time_slots:
        score += 3

    preferred_moods = slot_profile.get("moods", [])
    for mood in moods:
        if mood in preferred_moods:
            score += 2

    energy_range = slot_profile.get("energy")
    if energy_range and energy_range[0] <= energy <= energy_range[1]:
        score += 2

    score += song.priority or 5
    return score


def select_weighted_song(
    songs,
    time_bucket,
    recently_played,
    session_id: str,
    db: Session,
):
    filtered_songs = [song for song in songs if song.youtube_video_id not in recently_played]
    if not filtered_songs:
        return None

    taste_profile = get_session_taste_profile(db, session_id)
    stats_map = get_song_stats_map(db, [s.id for s in filtered_songs])
    candidates = []
    weights = []

    for song in filtered_songs:
        if not check_playability(song.youtube_video_id, db):
            continue
        candidates.append(song)
        weights.append(_score_song(song, time_bucket, taste_profile, stats_map.get(song.id)))

    if not candidates:
        return None

    return random.choices(candidates, weights=weights, k=1)[0]
