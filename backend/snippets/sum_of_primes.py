from typing import TypedDict
from backend.core.utils import execute_snippet

class SumOfPrimesParams(TypedDict):
    limit: str  # Keep the same type as find_primes for consistency

async def execute(params: SumOfPrimesParams) -> int:
    """
    Calculate the sum of all prime numbers up to the given limit.
    Uses find_primes snippet to get the list of primes.
    """
    try:
        # First, get all primes using the find_primes snippet
        try:
            primes_result = await execute_snippet("find_primes", params)
        except Exception as e:
            # Mark the dependency as failed and re-raise
            raise ValueError(f"Failed to execute snippet find_primes: {str(e)}")
        
        # Get the list of primes from the result
        primes = primes_result["primes"]
        
        # Calculate and return the sum
        return sum(primes)
        
    except Exception as e:
        # This will be caught by the main execution handler
        raise ValueError(f"Error calculating sum of primes: {str(e)}") 