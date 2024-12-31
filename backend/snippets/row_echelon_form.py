from typing import TypedDict
import numpy as np

class RowEchelonParams(TypedDict):
    matrix: list[list[float]]  # Input matrix
    reduce: bool  # If True, compute reduced row echelon form

async def execute(params: RowEchelonParams) -> list[list[float]]:
    """
    Convert a matrix to row echelon form (REF) or reduced row echelon form (RREF).
    Input a matrix and specify whether to compute the reduced form (RREF) or not (REF).
    """
    try:
        matrix = np.array(params["matrix"], dtype=float)
        reduce = bool(params["reduce"])  # Ensure boolean conversion
        
        if matrix.size == 0:
            raise ValueError("Matrix cannot be empty")

        # Make a copy to avoid modifying the input
        A = matrix.copy()
        rows, cols = A.shape
        
        # Forward elimination
        r = 0  # row index
        for c in range(cols):  # for each column
            # Find the pivot row
            pivot_row = None
            for i in range(r, rows):
                if abs(A[i, c]) > 1e-10:
                    pivot_row = i
                    break
                    
            if pivot_row is not None:
                # Swap rows if needed
                if pivot_row != r:
                    A[r], A[pivot_row] = A[pivot_row].copy(), A[r].copy()
                
                pivot = A[r, c]
                
                # Scale the pivot row only for RREF
                if reduce:
                    A[r] = A[r] / pivot
                
                # Eliminate below for REF, both above and below for RREF
                for i in range(rows):
                    if i != r and abs(A[i, c]) > 1e-10:
                        if reduce:  # Eliminate both above and below
                            A[i] = A[i] - A[i, c] * A[r]
                        elif i > r:  # Only eliminate below for REF
                            factor = A[i, c] / pivot
                            A[i] = A[i] - factor * A[r]
                
                r += 1
                if r == rows:
                    break

        # Clean up very small values (close to zero)
        A[np.abs(A) < 1e-10] = 0
        
        return A.tolist()
        
    except Exception as e:
        raise ValueError(f"Error computing {'reduced ' if params['reduce'] else ''}row echelon form: {str(e)}")