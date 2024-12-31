'use client';
import { cn } from "@/lib/utils";

interface MatrixDisplayProps {
  matrix: number[][];
  className?: string;
}

export function MatrixDisplay({ matrix, className }: MatrixDisplayProps) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  return (
    <div className={cn("inline-flex items-center", className)}>
      <div className="text-2xl mx-1">⎣</div>
      <div className="grid gap-2" style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
      }}>
        {matrix.map((row, i) => 
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="w-12 h-12 flex items-center justify-center bg-muted rounded-md font-mono"
            >
              {cell}
            </div>
          ))
        )}
      </div>
      <div className="text-2xl mx-1">⎤</div>
    </div>
  );
} 