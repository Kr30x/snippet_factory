from typing import TypedDict

class AddNumbersParams(TypedDict):
    a: float
    b: float

def execute(params: AddNumbersParams) -> float:
    """
    Add two numbers together.
    """
    a = float(params.get('a', 0))
    b = float(params.get('b', 0))
    return a + b  # Now returning float directly instead of Dict