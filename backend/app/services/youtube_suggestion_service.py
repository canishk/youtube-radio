from app.services.youtube_service import get_video_details

def fetch_video_metadata(video_id: str) -> dict:
    details = get_video_details(video_id)

    if not details:
        return None
    return {
        "title": details.get("title", ""),
        "channel_name": details.get("channel_name", ""),
        "description": details.get("description", "")
    }
