import re

def extract_video_id(url):
    if not url:
        return ""
    # Regular expression to match YouTube video IDs
    patterns = [
        r"youtube\.com/watch\?v=([^&]+)",
        r"youtu\.be/([^?]+)"
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return url

