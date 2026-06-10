from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from app.models.playback_history import PlaybackHistory
from app.models.session_song_history import SessionSongHistory
from app.models.song import Song

MIN_TASTE_SAMPLES = 3
HISTORY_LIMIT = 10


@dataclass
class TasteProfile:
    mood_weights: dict[str, float] = field(default_factory=dict)
    preferred_energy: float = 5.0
    source: str = "none"


def _recency_weight(index: int) -> float:
    return 1.0 / (1 + index * 0.1)


def _build_profile_from_songs(
    weighted_songs: list[tuple[Song, float]],
) -> TasteProfile:
    mood_totals: dict[str, float] = {}
    energy_total = 0.0
    weight_total = 0.0

    for song, weight in weighted_songs:
        for mood in song.get_moods():
            if mood:
                mood_totals[mood] = mood_totals.get(mood, 0.0) + weight
        energy_total += int(song.energy or 5) * weight
        weight_total += weight

    if weight_total == 0:
        return TasteProfile()

    max_mood_weight = max(mood_totals.values()) if mood_totals else 1.0
    mood_weights = {
        mood: total / max_mood_weight
        for mood, total in mood_totals.items()
    }

    return TasteProfile(
        mood_weights=mood_weights,
        preferred_energy=energy_total / weight_total,
        source="completions",
    )


def _get_completion_songs(db: Session, session_id: str) -> list[tuple[Song, float]]:
    history = (
        db.query(SessionSongHistory, Song)
        .join(Song, SessionSongHistory.song_id == Song.id)
        .filter(SessionSongHistory.session_id == session_id)
        .order_by(SessionSongHistory.played_at.desc())
        .limit(HISTORY_LIMIT)
        .all()
    )
    return [(song, _recency_weight(index)) for index, (_, song) in enumerate(history)]


def _get_playback_songs(db: Session, session_id: str) -> list[tuple[Song, float]]:
    history = (
        db.query(PlaybackHistory, Song)
        .join(Song, PlaybackHistory.youtube_video_id == Song.youtube_video_id)
        .filter(PlaybackHistory.session_id == session_id)
        .order_by(PlaybackHistory.played_at.desc())
        .limit(HISTORY_LIMIT)
        .all()
    )
    return [(song, _recency_weight(index)) for index, (_, song) in enumerate(history)]


def get_session_taste_profile(db: Session, session_id: str) -> TasteProfile:
    completion_songs = _get_completion_songs(db, session_id)
    if len(completion_songs) >= MIN_TASTE_SAMPLES:
        profile = _build_profile_from_songs(completion_songs)
        profile.source = "completions"
        return profile

    playback_songs = _get_playback_songs(db, session_id)
    if len(playback_songs) >= MIN_TASTE_SAMPLES:
        profile = _build_profile_from_songs(playback_songs)
        profile.source = "playback"
        return profile

    return TasteProfile()
