from typing import TypedDict, Dict
from datetime import datetime

class CurrentTimeParams(TypedDict):
    pass  # No parameters needed

async def execute(params: CurrentTimeParams) -> Dict[str, str]:
    """
    Get current time in multiple formats.
    Returns timestamp, date, and ISO format.
    """
    now = datetime.now()
    
    return {
        "timestamp": str(int(now.timestamp())),
        "date": now.strftime("%Y-%m-%d"),
        "iso": now.isoformat(),
        "time": now.strftime("%H:%M:%S")
    } 