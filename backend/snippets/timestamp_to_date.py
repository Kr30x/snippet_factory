from typing import TypedDict

class TimestampParams(TypedDict):
    timestamp: str  # Simplified type hint - we'll handle type conversion internally

def execute(params: TimestampParams) -> str:
    """
    Convert a timestamp to date in YYYY-MM-DD format.
    Supports Unix timestamps (seconds/milliseconds) and ISO format strings.
    """
    timestamp = params.get('timestamp', '')
    
    try:
        # Try parsing as integer/float (Unix timestamp)
        try:
            # Try as seconds
            ts = float(timestamp)
            # If timestamp looks like milliseconds, convert to seconds
            if ts > 1e11:  # Timestamps after year 1973 in milliseconds
                ts = ts / 1000
            from datetime import datetime
            date = datetime.fromtimestamp(ts)
        except ValueError:
            # Try parsing as string (ISO format)
            date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        return date.strftime('%Y-%m-%d')
        
    except Exception as e:
        raise ValueError(
            "Invalid timestamp format. Supported formats:\n"
            "- Unix timestamp in seconds (e.g., 1625097600)\n"
            "- Unix timestamp in milliseconds (e.g., 1625097600000)\n"
            "- ISO format string (e.g., '2021-07-01T00:00:00Z')"
        ) 