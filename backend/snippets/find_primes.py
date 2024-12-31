from typing import TypedDict, Dict, List

class PrimeParams(TypedDict):
    limit: str  # We'll convert to int internally

class PrimeResult(TypedDict):
    count: int
    primes: List[int]

def execute(params: PrimeParams) -> PrimeResult:
    """
    Find all prime numbers up to the given limit.
    Returns count of primes and the prime numbers themselves.
    """
    try:
        limit = int(params['limit'])
        if limit < 2:
            raise ValueError("Limit must be at least 2")
            
        # Sieve of Eratosthenes algorithm
        sieve = [True] * (limit + 1)
        sieve[0] = sieve[1] = False
        
        # Intentionally add some delay to show execution progress
        import time
        
        for i in range(2, int(limit ** 0.5) + 1):
            if sieve[i]:
                # Add small delay every few iterations
                if i % 100 == 0:
                    time.sleep(0.1)
                # Mark multiples as non-prime
                for j in range(i * i, limit + 1, i):
                    sieve[j] = False
        
        # Collect prime numbers
        primes = [num for num, is_prime in enumerate(sieve) if is_prime]
        
        return {
            "count": len(primes),
            "primes": primes
        }
        
    except ValueError as e:
        raise ValueError(f"Invalid input: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error finding primes: {str(e)}") 