import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine style based on dependency type
  const isHard = data?.type === 'hard';
  const strokeColor = isHard ? '#ef4444' : '#3b82f6'; // Red for hard, Blue for soft
  const strokeDasharray = isHard ? '0' : '5,5'; // Solid for hard, Dashed for soft
  const label = isHard ? 'Hard' : 'Soft';

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: 2,
          strokeDasharray: strokeDasharray,
          fill: 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border ${
            isHard 
              ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' 
              : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
          }`}>
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}