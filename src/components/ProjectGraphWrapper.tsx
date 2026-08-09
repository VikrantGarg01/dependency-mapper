'use client'

import { useState } from 'react'
import DependencyGraph from './DependencyGraph'

interface Service {
  id: string
  name: string
  description?: string | null
  status?: string | null
  positionX?: number | null
  positionY?: number | null
}

interface Dependency {
  id: string
  sourceServiceId: string
  targetServiceId: string
  dependencyType: string
  sourceService: Service
  targetService: Service
}

export default function ProjectGraphWrapper({
  services,
  dependencies,
  projectId
}: {
  services: any
  dependencies: any
  projectId: string
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [simulationMode, setSimulationMode] = useState(false)

  return (
    <DependencyGraph
      services={services}
      dependencies={dependencies}
      projectId={projectId}
      selectedNodeId={selectedNodeId}
      onNodeSelect={setSelectedNodeId}
      simulationMode={simulationMode}
    />
  )
}