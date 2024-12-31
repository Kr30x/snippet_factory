from typing import TypedDict, List
import numpy as np

class DeterminantParams(TypedDict):
    matrix: list[list[float]]  # 2D array representing the matrix

async def execute(params: DeterminantParams) -> float:
    """
    Calculate the determinant of a square matrix.
    Input a square matrix as a 2D array of numbers.
    """
    try:
        matrix = np.array(params["matrix"], dtype=float)
        if matrix.shape[0] != matrix.shape[1]:
            raise ValueError("Matrix must be square")
        
        return float(np.linalg.det(matrix))
    except Exception as e:
        raise ValueError(f"Error calculating determinant: {str(e)}") 