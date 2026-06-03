import os
import requests
import isodate


def fetch_video_metadata(video_id: str):

    api_key = os.getenv("YOUTUBE_API_KEY")

    url = ("https://www.googleapis.com/youtube/v3/videos")

    params = {
        "id": video_id,
        "part": "snippet,contentDetails",
        "key": api_key
    }

    response = requests.get(
        url,
        params=params,
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    items = data.get(
        "items",
        []
    )

    if not items:

        return None

    item = items[0]
    duration_raw = item["contentDetails"]["duration"]
    duration_obj = isodate.parse_duration(duration_raw)
    total_seconds = int(duration_obj.total_seconds())
    minutes, seconds = divmod(total_seconds, 60)

    return {

        "video_id": video_id,
        "title": item["snippet"]["title"],
        "channel": item["snippet"]["channelTitle"],
        "description": item["snippet"]["description"],
        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
        "duration_raw": duration_raw,
        "duration_display": f"{minutes}:{seconds:02d}"
    }


def get_thumbnail_url(video_id):
    return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"