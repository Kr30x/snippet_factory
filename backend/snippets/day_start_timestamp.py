from typing import TypedDict
from datetime import datetime
from backend.core.utils import execute_snippet

class DayStartParams(TypedDict):
    pass  # No parameters needed

async def execute(params: DayStartParams) -> int:
    """
    Get Unix timestamp for the start of the current day (midnight).
    Uses current_time snippet to get the current date.
    """
    # Get current date from current_time snippet
    current_time_result = await execute_snippet("current_time", {})
    date_str = current_time_result["date"]
    
    # Parse the date and set time to midnight
    date = datetime.strptime(date_str, "%Y-%m-%d")
    
    # Convert to timestamp
    return int(date.timestamp()) 