def get_time_bucket(hour: int):

    if 5 <= hour < 8:
        return "morning"

    elif 8 <= hour < 12:
        return "workday"

    elif 12 <= hour < 16:
        return "afternoon"

    elif 16 <= hour < 19:
        return "evening"

    elif 19 <= hour < 22:
        return "night"

    elif 22 <= hour <= 23:
        return "late_night"

    return "deep_night"