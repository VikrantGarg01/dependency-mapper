'use client'

import { useCallback, useMemo, useState, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  type Connection,
  type Node,
  type Edge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { deleteService, updateServiceStatus, deleteDependency } from '@/app/actions'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  description?: string | null
  status?: string | null
  positionX?: number | null
  positionY?: number | null
  serviceType?: string | null
}

interface Dependency {
  id: string
  sourceServiceId: string
  targetServiceId: string
  dependencyType: string
  sourceService: Service
  targetService: Service
}

function getBlastRadius(startNodeId: string, edges: Edge[]): Set<string> {
  const affected = new Set<string>()
  const queue = [startNodeId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const outgoingEdges = edges.filter(e => e.source === currentId)
    for (const edge of outgoingEdges) {
      if (!affected.has(edge.target)) {
        affected.add(edge.target)
        queue.push(edge.target)
      }
    }
  }
  return affected
}

// ========== PROFESSIONAL CUSTOM NODE ==========
function CustomNode({ data, id }: any) {
  const [showMenu, setShowMenu] = useState(false)
  const hideTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
    setShowMenu(true)
  }

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => {
      setShowMenu(false)
    }, 300) 
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() 
    if (confirm(`Delete service "${data.label}"?`)) {
      await deleteService(id, data.projectId)
      toast.success('Service deleted!')
      window.location.reload()
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    await updateServiceStatus(id, newStatus, data.projectId)
    toast.success(`Status updated to ${newStatus}`)
    window.location.reload()
  }

  // Determine colors based on status
  let statusColor = 'bg-green-500'
  let borderColor = 'border-l-green-500'
  let bgColor = 'bg-white dark:bg-gray-900'
  
  if (data.status === 'down') {
    statusColor = 'bg-red-500 animate-pulse'
    borderColor = 'border-l-red-500'
    bgColor = 'bg-red-50 dark:bg-red-900/20'
  } else if (data.status === 'degraded') {
    statusColor = 'bg-yellow-500'
    borderColor = 'border-l-yellow-500'
    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20'
  }

  if (data.isAffected) {
    borderColor = 'border-l-red-600'
    bgColor = 'bg-red-100 dark:bg-red-900/30'
  } else if (data.isSelected) {
    borderColor = 'border-l-blue-600'
    bgColor = 'bg-blue-50 dark:bg-blue-900/30'
  }

  return (
    <div 
      className="relative group cursor-grab active:cursor-grabbing"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white dark:!border-gray-900" 
      />
      
      <div className={`${bgColor} border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor} rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] p-4`}>
        {/* Header with Status */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-sm`}></div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate flex-1">
            {data.label}
          </h3>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
            {data.description}
          </p>
        )}

        {/* Footer */}
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

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white dark:!border-gray-900" 
      />

      {/* Delete Button */}
      {!data.simulationMode && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10 shadow-md"
          title="Delete service"
        >
          ×
        </button>
      )}

      {/* Status Menu */}
      {showMenu && !data.simulationMode && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1 z-20 flex gap-1">
          <button 
            onClick={() => handleStatusChange('healthy')}
            className="px-2 py-1 text-xs rounded hover:bg-green-50 dark:hover:bg-green-900/30"
            title="Set Healthy"
          >
            🟢
          </button>
          <button 
            onClick={() => handleStatusChange('degraded')}
            className="px-2 py-1 text-xs rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
            title="Set Degraded"
          >
            🟡
          </button>
          <button 
            onClick={() => handleStatusChange('down')}
            className="px-2 py-1 text-xs rounded hover:bg-red-50 dark:hover:bg-red-900/30"
            title="Set Down"
          >
            🔴
          </button>
        </div>
      )}

      {/* Simulation Mode Indicator */}
      {data.simulationMode && data.isSelected && (
        <div className="absolute -top-3 -left-3 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center animate-pulse shadow-lg">
          💥
        </div>
      )}
    </div>
  )
}

// ========== PROFESSIONAL CUSTOM EDGE ==========
function CustomEdge({
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
  selected,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isHard = data?.type === 'hard';
  const strokeColor = isHard ? '#ef4444' : '#3b82f6';
  const strokeDasharray = isHard ? '0' : '5,5';
  const label = isHard ? 'Hard' : 'Soft';

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: selected ? '#000000' : strokeColor,
          strokeWidth: selected ? 3 : 2,
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
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-md border ${
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

// ========== MAIN COMPONENT ==========
export default function DependencyGraph({ 
  services, 
  dependencies,
  projectId,
  selectedNodeId,
  onNodeSelect,
  simulationMode
}: { 
  services: Service[]
  dependencies: Dependency[]
  projectId: string
  selectedNodeId: string | null
  onNodeSelect: (id: string | null) => void
  simulationMode: boolean
}) {
  const nodeTypes = useMemo(() => ({
    custom: CustomNode
  }), [])

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge
  }), [])

  const initialNodes: Node[] = useMemo(() => 
    services.map((s, i) => ({
      id: s.id,
      type: 'custom',
      data: { 
        label: s.name, 
        projectId,
        status: s.status,
        description: s.description,
        serviceType: s.serviceType,
        simulationMode
      },
      position: { 
        x: s.positionX || 100 + (i % 3) * 350,
        y: s.positionY || 100 + Math.floor(i / 3) * 200
      },
    })),
    [services, projectId, simulationMode]
  )

  const initialEdges: Edge[] = useMemo(() => 
    dependencies.map((d) => ({
      id: d.id,
      source: d.sourceServiceId,
      target: d.targetServiceId,
      type: 'custom',
      data: { 
        type: d.dependencyType,
        dbId: d.id 
      },
      markerEnd: { 
        type: 'arrowclosed', 
        color: d.dependencyType === 'hard' ? '#ef4444' : '#3b82f6' 
      },
    })),
    [dependencies]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const affectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>()
    return getBlastRadius(selectedNodeId, edges)
  }, [selectedNodeId, edges])

  const styledNodes = useMemo(() => nodes.map(n => ({
    ...n,
    data: { 
      ...n.data, 
      isAffected: affectedNodeIds.has(n.id),
      isSelected: n.id === selectedNodeId
    }
  })), [nodes, affectedNodeIds, selectedNodeId])

  const styledEdges = useMemo(() => edges.map(e => {
    const isSelected = e.id === selectedEdgeId
    const isAffected = affectedNodeIds.has(e.target) || e.source === selectedNodeId
    
    return {
      ...e,
      selected: isSelected,
      style: { 
        stroke: isSelected ? '#000000' : (isAffected ? '#ef4444' : undefined), 
        strokeWidth: isSelected ? 3 : 2,
      },
    }
  }), [edges, affectedNodeIds, selectedNodeId, selectedEdgeId])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
    [setEdges]
  )

  const onEdgesDelete = useCallback(
    async (edgesToDelete: Edge[]) => {
      for (const edge of edgesToDelete) {
        await deleteDependency(edge.id, projectId)
      }
      toast.success('Dependency deleted!')
      window.location.reload() 
    },
    [projectId]
  )

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id)
  }, [])

  const onNodeClick = useCallback((_: any, node: Node) => {
    onNodeSelect(node.id === selectedNodeId ? null : node.id)
  }, [selectedNodeId, onNodeSelect])

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null)
    onNodeSelect(null)
  }, [onNodeSelect])

  return (
    <div className="w-full h-full min-h-[600px] bg-gray-50/50 dark:bg-gray-950/50 rounded-xl">
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        selectNodesOnDrag={false}
        className="bg-transparent"
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#9ca3af" 
          className="opacity-30 dark:opacity-20" 
        />
        <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-lg" />
        <MiniMap 
          className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-lg"
          nodeColor={(node) => {
            if (node.data?.status === 'down') return '#ef4444';
            if (node.data?.status === 'degraded') return '#eab308';
            return '#22c55e';
          }}
        />
      </ReactFlow>
    </div>
  )
}