import { Handle, Position, NodeProps } from 'reactflow';

// Define the shape of the data your node will receive
interface ServiceNodeData {
  label: string;
  status?: string;
  description?: string;
  serviceType?: string;
}

export default function CustomNode({ data }: NodeProps<ServiceNodeData>) {
  // Determine colors based on status
  let statusColor = 'bg-green-500';
  let borderColor = 'border-l-green-500';
  
  if (data.status === 'down') {
    statusColor = 'bg-red-500 animate-pulse';
    borderColor = 'border-l-red-500';
  } else if (data.status === 'degraded') {
    statusColor = 'bg-yellow-500';
    borderColor = 'border-l-yellow-500';
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor} rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[180px] p-4 group`}>
      {/* Handles for connections */}
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white dark:!border-gray-900" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white dark:!border-gray-900" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-sm`}></div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
          {data.label}
        </h3>
      </div>

      {/* Description (if exists) */}
      {data.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Footer / Type */}
      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          {data.serviceType || 'Service'}
        </span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
    </div>
  );
}