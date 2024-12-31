'use client';
import { useState, useEffect } from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { Plus, Minus } from "lucide-react";

interface MatrixInputProps {
  value: number[][];
  onChange: (matrix: number[][]) => void;
  className?: string;
  allowRectangular?: boolean;
}

export function MatrixInput({ value, onChange, className, allowRectangular = false }: MatrixInputProps) {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrix, setMatrix] = useState<number[][]>([[0, 0], [0, 0]]);

  // Initialize matrix when dimensions change
  useEffect(() => {
    try {
      const initialMatrix = Array(rows).fill(0).map(() => 
        Array(cols).fill(0)
      );
      setMatrix(initialMatrix);
      onChange(initialMatrix);
    } catch (err) {
      console.error('Error initializing matrix:', err);
    }
  }, [rows, cols]);

  const handleCellChange = (row: number, col: number, value: string) => {
    try {
      const newValue = parseFloat(value) || 0;
      const newMatrix = matrix.map(r => [...r]);
      newMatrix[row][col] = newValue;
      setMatrix(newMatrix);
      onChange(newMatrix);
    } catch (err) {
      console.error('Error updating cell:', err);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rows:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRows(Math.max(1, rows - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{rows}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRows(rows + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {allowRectangular && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Columns:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCols(Math.max(1, cols - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{cols}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCols(cols + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-2" style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
      }}>
        {matrix.map((row, i) => 
          row.map((cell, j) => (
            <Input
              key={`${i}-${j}`}
              type="number"
              value={cell}
              onChange={(e) => handleCellChange(i, j, e.target.value)}
              className="w-full text-center"
              step="any"
            />
          ))
        )}
      </div>
    </div>
  );
} 