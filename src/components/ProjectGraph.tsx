'use client'

import { useState, useMemo } from 'react'
import DependencyGraph from './DependencyGraph'
import BlastRadiusPanel from './BlastRadiusPanel'

interface Service {
  id: string
  name: string
  description?: string
}

interface Dependency {
  id: string
  sourceServiceId: string
  targetServiceId: string
  dependencyType: string
  sourceService: Service
  targetService: Service
}

export default function ProjectGraph({ 
  services, 
  dependencies,
  projectId 
}: { 
  services: Service[]
  dependencies: Dependency[]
  projectId: string
}) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [simulationMode, setSimulationMode] = useState(false)

  // Find affected services when one is selected
  const { selectedService, affectedServices } = useMemo(() => {
    if (!selectedServiceId) {
      return { selectedService: null, affectedServices: [] }
    }

    const selected = services.find(s => s.id === selectedServiceId) || null
    
    // Calculate blast radius
    const affected = new Set<string>()
    const queue = [selectedServiceId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const outgoingDeps = dependencies.filter(d => d.sourceServiceId === currentId)
      
      for (const dep of outgoingDeps) {
        if (!affected.has(dep.targetServiceId)) {
          affected.add(dep.targetServiceId)
          queue.push(dep.targetServiceId)
        }
      }
    }

    const affectedServicesList = services.filter(s => affected.has(s.id))

    return { selectedService: selected, affectedServices: affectedServicesList }
  }, [selectedServiceId, services, dependencies])

  const handleSimulationToggle = () => {
    setSimulationMode(!simulationMode)
    if (simulationMode) {
      setSelectedServiceId(null) // Clear selection when exiting simulation
    }
  }

  return (
    <>
      <div className="relative">
        {/* Simulation Mode Banner */}
        {simulationMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-10 flex items-center gap-3">
            <span className="animate-pulse">🔴</span>
            <div>
              <p className="font-bold">SIMULATION MODE</p>
              <p className="text-sm text-red-100">Click any service to simulate failure</p>
            </div>
            <button 
              onClick={handleSimulationToggle}
              className="ml-4 bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm"
            >
              Exit
            </button>
          </div>
        )}

        <DependencyGraph 
          services={services} 
          dependencies={dependencies}
          projectId={projectId}
          selectedNodeId={selectedServiceId}
          onNodeSelect={setSelectedServiceId}
          simulationMode={simulationMode}
        />

        {/* Simulation Toggle Button */}
        {!simulationMode && (
          <button
            onClick={handleSimulationToggle}
            className="absolute bottom-20 left-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium flex items-center gap-2 z-10"
          >
            <span>⚡</span>
            Simulate Outage
          </button>
        )}
      </div>
      
      {selectedService && (
        <BlastRadiusPanel 
          selectedService={selectedService}
          affectedServices={affectedServices}
          dependencies={dependencies}
          onClose={() => setSelectedServiceId(null)}
          simulationMode={simulationMode}
        />
      )}
    </>
  )
}