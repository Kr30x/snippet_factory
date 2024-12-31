from typing import TypedDict, List
import numpy as np

class AddMatricesParams(TypedDict):
    matrix1: list[list[float]]  # First matrix
    matrix2: list[list[float]]  # Second matrix

async def execute(params: AddMatricesParams) -> list[list[float]]:
    """
    Add two matrices of the same dimensions.
    Input two matrices as 2D arrays of numbers. Matrices must have the same dimensions.
    """
    try:
        matrix1 = np.array(params["matrix1"], dtype=float)
        matrix2 = np.array(params["matrix2"], dtype=float)
        
        if matrix1.shape != matrix2.shape:
            raise ValueError(f"Matrix dimensions must match. Got {matrix1.shape} and {matrix2.shape}")
        
        result = matrix1 + matrix2
        # Convert back to list for JSON serialization
        return result.tolist()
        
    except Exception as e:
        raise ValueError(f"Error adding matrices: {str(e)}") 