from collections import defaultdict

from sqlalchemy.orm import Session

from app.constants.playback_preferences import TIME_SLOT_PROFILES
from app.models.category import Category
from app.models.song import Song
from app.services.history_service import get_session_played_video_ids
from app.services.playback_service import check_playability


def build_mood_profile(songs) -> dict[str, float]:
    mood_counts: dict[str, float] = defaultdict(float)
    for song in songs:
        for mood in song.get_moods():
            mood_counts[mood] += 1.0
    total = sum(mood_counts.values())
    if total == 0:
        return {}
    return {mood: count / total for mood, count in mood_counts.items()}


def mood_similarity(profile_a: dict[str, float], profile_b: dict[str, float]) -> float:
    if not profile_a or not profile_b:
        return 0.0
    all_moods = set(profile_a) | set(profile_b)
    dot = sum(profile_a.get(m, 0.0) * profile_b.get(m, 0.0) for m in all_moods)
    mag_a = sum(v * v for v in profile_a.values()) ** 0.5
    mag_b = sum(v * v for v in profile_b.values()) ** 0.5
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def get_playable_songs(db: Session, category_id: str) -> list:
    songs = db.query(Song).filter(Song.category_id == category_id).all()
    return [s for s in songs if check_playability(s.youtube_video_id, db)]


def is_category_exhausted(db: Session, session_id: str, category_id: str) -> bool:
    playable = get_playable_songs(db, category_id)
    if not playable:
        return True
    played = get_session_played_video_ids(db, session_id, category_id)
    return all(s.youtube_video_id in played for s in playable)


def get_shared_moods(
    profile_a: dict[str, float],
    profile_b: dict[str, float],
    limit: int = 3,
) -> list[str]:
    shared = [
        mood
        for mood in profile_a
        if mood in profile_b
    ]
    shared.sort(key=lambda m: profile_a[m] * profile_b[m], reverse=True)
    return shared[:limit]


def _get_enabled_categories_with_songs(db: Session) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.enabled == True)
        .join(Song, Song.category_id == Category.id)
        .distinct()
        .all()
    )


def recommend_similar_category(
    db: Session,
    current_category_id: str,
    session_id: str,
    time_bucket: str,
) -> tuple[Category | None, list[str]]:
    current_songs = db.query(Song).filter(Song.category_id == current_category_id).all()
    current_profile = build_mood_profile(current_songs)
    slot_moods = set(TIME_SLOT_PROFILES.get(time_bucket, {}).get("moods", []))

    best_category = None
    best_score = -1.0
    best_shared: list[str] = []

    for category in _get_enabled_categories_with_songs(db):
        if category.id == current_category_id:
            continue
        if is_category_exhausted(db, session_id, category.id):
            continue

        candidate_songs = db.query(Song).filter(Song.category_id == category.id).all()
        candidate_profile = build_mood_profile(candidate_songs)
        score = mood_similarity(current_profile, candidate_profile)

        for mood in candidate_profile:
            if mood in slot_moods:
                score += 0.05

        if score > best_score:
            best_score = score
            best_category = category
            best_shared = get_shared_moods(current_profile, candidate_profile)

    return best_category, best_shared
