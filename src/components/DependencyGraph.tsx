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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { deleteService, updateServiceStatus, deleteDependency } from '@/app/actions'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  description?: string | null       // <-- Added | null
  status?: string | null            // <-- Added | null
  positionX?: number | null         // <-- Added | null
  positionY?: number | null         // <-- Added | null
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

    let borderColor = 'border-gray-300'
  let bgColor = 'bg-white'
  let statusEmoji = '🟢'
  let textColor = 'text-gray-900' // Add this
  
  if (data.status === 'down') {
    borderColor = 'border-red-500 border-2'
    bgColor = 'bg-red-50'
    statusEmoji = '🔴'
  } else if (data.status === 'degraded') {
    borderColor = 'border-yellow-500 border-2'
    bgColor = 'bg-yellow-50'
    statusEmoji = '🟡'
  } else if (data.status === 'healthy' || !data.status) {
    // Ensure healthy status shows
    statusEmoji = '🟢'
    textColor = 'text-gray-900'
  }

  if (data.isAffected) {
    borderColor = 'border-red-600 border-4'
    bgColor = 'bg-red-100'
  } else if (data.isSelected) {
    borderColor = 'border-blue-500 border-2'
    bgColor = 'bg-blue-50'
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
        className="!bg-gray-400 !w-3 !h-3" 
      />
      
      <div className={`${bgColor} ${borderColor} rounded-lg px-4 py-3 min-w-[160px] text-center font-medium shadow-sm transition-all`}>
        <div className="flex items-center justify-center gap-2">
          <span className={textColor}>{statusEmoji}</span>
          <span className={textColor}>{data.label}</span>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-gray-400 !w-3 !h-3" 
      />

      {!data.simulationMode && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10"
          title="Delete service"
        >
          ×
        </button>
      )}

      {showMenu && !data.simulationMode && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-xl p-1 z-20 flex gap-1">
          <button 
            onClick={() => handleStatusChange('healthy')}
            className="px-2 py-1 text-xs rounded hover:bg-green-50"
            title="Set Healthy"
          >
            🟢
          </button>
          <button 
            onClick={() => handleStatusChange('degraded')}
            className="px-2 py-1 text-xs rounded hover:bg-yellow-50"
            title="Set Degraded"
          >
            🟡
          </button>
          <button 
            onClick={() => handleStatusChange('down')}
            className="px-2 py-1 text-xs rounded hover:bg-red-50"
            title="Set Down"
          >
            🔴
          </button>
        </div>
      )}

      {data.simulationMode && data.isSelected && (
        <div className="absolute -top-3 -left-3 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
          💥
        </div>
      )}
    </div>
  )
}

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
    default: (props: any) => <CustomNode {...props} />
  }), [])

  const initialNodes: Node[] = useMemo(() => 
    services.map((s, i) => ({
      id: s.id,
      type: 'default',
      data: { 
        label: s.name, 
        projectId,
        status: s.status
      },
      position: { 
        x: 100 + (i % 3) * 300,
        y: 100 + Math.floor(i / 3) * 150
      },
    })),
    [services, projectId]
  )

  const initialEdges: Edge[] = useMemo(() => 
    dependencies.map((d) => ({
      id: d.id,
      source: d.sourceServiceId,
      target: d.targetServiceId,
      label: d.dependencyType,
      animated: d.dependencyType === 'soft',
      style: { stroke: '#2563eb', strokeWidth: 2 },
      data: { dbId: d.id }
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
      style: { 
        stroke: isSelected ? '#000000' : (isAffected ? '#ef4444' : '#2563eb'), 
        strokeWidth: isSelected ? 4 : 2,
      },
      animated: e.animated || isSelected,
    }
  }), [edges, affectedNodeIds, selectedNodeId, selectedEdgeId])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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
    <div style={{ width: '100%', height: '600px' }}>
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
        fitView
        selectNodesOnDrag={false}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}