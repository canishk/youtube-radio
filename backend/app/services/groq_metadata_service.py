import json
import os
import re

from groq import Groq

SUPPORTED_MOODS = [
    "melody",
    "travel",
    "rain",
    "romantic",
    "sad",
    "energetic",
    "party",
    "devotional",
    "nostalgia",
    "friendship",
    "motivation",
    "dance",
    "night",
    "peaceful"
]

SUPPORTED_TIME_SLOTS = [
    "morning",
    "afternoon",
    "evening",
    "night",
    "late_night"
]

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None

def generate_ai_suggestions(
        title: str,
        movie: str = "",
        channel_name: str = "",
        description: str = "",
):
    prompt = f"""
        You are a music metadata classifier.

        Allowed moods: {', '.join(SUPPORTED_MOODS)}

        Allowed time slots: {', '.join(SUPPORTED_TIME_SLOTS)}

        Return only valid JSON

        Input:
        Title: {title}
        Movie: {movie}
        Channel Name: {channel_name}
        Description: {description}

        Response format:
        {{
            "moods": [],
            "time_slots": [],
            "energy":1-10,
            priority: 1-10
        }}
    """
    if not client:
        print("GROQ_API_KEY not set; skipping AI call and returning defaults.")
        return {
            "moods": [],
            "time_slots": [],
            "energy": 3,
            "priority": 5
        }

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content

    # Attempt to extract a JSON object from the model response. Models
    # may wrap JSON in markdown fences or include explanatory text.
    text = content.strip()

    # If the response contains a fenced code block, strip the fences.
    # Otherwise, try to locate the first {...} substring.
    json_text = None
    # Remove triple backtick fences if present
    if text.startswith("```") and text.endswith("```"):
        # remove surrounding ``` and any language specifier
        inner = re.sub(r"^```\w*\n|\n```$", "", text)
        json_text = inner.strip()
    else:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            json_text = m.group(0)
        else:
            json_text = text

    try:
        result = json.loads(json_text)
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        print("Original content:")
        print(content)
        print("Extracted json_text:")
        print(json_text)
        return {
            "moods": [],
            "time_slots": [],
            "energy": 3,
            "priority": 5
        }

    return result