'use client';
import ReactFlow, { 
  Node, 
  Edge,
  Background,
  Controls,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from "@/lib/utils";

interface DependencyGraphProps {
  dependencies: string[];
  currentSnippet: string;
  executionStates: Record<string, 'pending' | 'executing' | 'completed' | 'error'>;
}

const getNodeStyle = (state?: 'pending' | 'executing' | 'completed' | 'error') => {
  switch (state) {
    case 'executing':
      return 'bg-yellow-100 border-yellow-400 animate-pulse text-yellow-900';
    case 'completed':
      return 'bg-green-100 border-green-500 text-green-900';
    case 'error':
      return 'bg-red-100 border-red-500 text-red-900';
    default:
      return 'bg-muted border-muted-foreground';
  }
};

const getEdgeStyle = (sourceState: string, targetState: string) => {
  if (targetState === 'error') {
    return {
      strokeWidth: 2,
      stroke: '#ef4444', // red-500
      animated: false
    };
  }
  if (targetState === 'executing') {
    return {
      strokeWidth: 2,
      stroke: '#64748b', // slate-500
      animated: true
    };
  }
  if (targetState === 'completed') {
    return {
      strokeWidth: 2,
      stroke: '#22C55E', // green-500
      animated: false
    };
  }
  return {
    strokeWidth: 2,
    stroke: '#64748b', // slate-500
    animated: false
  };
};

export function DependencyGraph({ 
  dependencies, 
  currentSnippet,
  executionStates 
}: DependencyGraphProps) {
  if (!dependencies || dependencies.length === 0) return null;

  // Calculate total width needed
  const nodeWidth = 180;  // approximate width of a node
  const nodeGap = 100;    // gap between nodes
  const totalWidth = dependencies.length * (nodeWidth + nodeGap);
  const startX = totalWidth / 2;  // center the graph

  // Create nodes with horizontal layout
  const nodes: Node[] = [
    // Dependencies on the left
    ...dependencies.map((dep, index) => ({
      id: dep,
      data: { 
        label: (
          <div className="flex items-center gap-2">
            <span>{dep}</span>
            {executionStates[dep] === 'executing' && (
              <span className="text-xs">Running...</span>
            )}
          </div>
        )
      },
      position: { 
        x: index * (nodeWidth + nodeGap),
        y: 50
      },
      className: cn(
        'px-4 py-2 rounded-md border-2',
        getNodeStyle(executionStates[dep])
      )
    })),
    // Main snippet on the right
    {
      id: currentSnippet,
      data: { 
        label: (
          <div className="flex items-center gap-2">
            <span>{currentSnippet}</span>
            {executionStates[currentSnippet] === 'executing' && (
              <span className="text-xs">Running...</span>
            )}
          </div>
        )
      },
      position: { 
        x: (dependencies.length * (nodeWidth + nodeGap)) / 2,
        y: 200
      },
      className: cn(
        'px-4 py-2 rounded-md border-2',
        getNodeStyle(executionStates[currentSnippet])
      )
    }
  ];

  // Create edges with markers
  const edges: Edge[] = dependencies.map(dep => ({
    id: `${dep}-${currentSnippet}`, // Reversed to show correct flow
    source: dep,
    target: currentSnippet,
    style: getEdgeStyle(
      executionStates[dep] || 'pending',
      executionStates[currentSnippet] || 'pending'
    ),
    type: 'smoothstep',  // Use smooth edges
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: executionStates[dep] === 'error' ? '#ef4444' : 
             executionStates[dep] === 'completed' ? '#22C55E' : '#64748b',
    },
  }));

  return (
    <div className="w-full h-[300px] border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        className="bg-background"
        fitViewOptions={{
          padding: 0.2,
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
} 