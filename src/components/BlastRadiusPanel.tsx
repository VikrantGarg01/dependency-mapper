'use client'

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

export default function BlastRadiusPanel({ 
  selectedService,
  affectedServices,
  dependencies,
  onClose,
  simulationMode
}: { 
  selectedService: Service | null
  affectedServices: Service[]
  dependencies: Dependency[]
  onClose: () => void
  simulationMode: boolean
}) {
  if (!selectedService) return null

  // Calculate the dependency chain
  const getDependencyChain = (serviceId: string, deps: Dependency[], visited = new Set<string>()): string[] => {
    const chain: string[] = []
    const directDeps = deps.filter(d => d.sourceServiceId === serviceId && !visited.has(d.targetServiceId))
    
    for (const dep of directDeps) {
      if (!visited.has(dep.targetServiceId)) {
        visited.add(dep.targetServiceId)
        const targetName = dep.targetService.name
        chain.push(`${targetName} (${dep.dependencyType})`)
        const subChain = getDependencyChain(dep.targetServiceId, deps, visited)
        chain.push(...subChain.map(s => `  → ${s}`))
      }
    }
    
    return chain
  }

  const dependencyChain = getDependencyChain(selectedService.id, dependencies)

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Blast Radius Report
              {simulationMode && (
                <span className="ml-2 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                  SIMULATION
                </span>
              )}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Selected Service */}
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-600 uppercase mb-1">Selected Service</h3>
          <p className="text-xl font-bold text-blue-900">{selectedService.name}</p>
          {selectedService.description && (
            <p className="text-sm text-blue-700 mt-1">{selectedService.description}</p>
          )}
        </div>

        {/* Impact Summary */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-600 uppercase mb-2">Impact Summary</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Affected Services:</span>
            <span className="text-2xl font-bold text-red-600">{affectedServices.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Severity:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              affectedServices.length === 0 ? 'bg-green-100 text-green-700' :
              affectedServices.length <= 2 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {affectedServices.length === 0 ? 'Low' :
               affectedServices.length <= 2 ? 'Medium' :
               'Critical'}
            </span>
          </div>
        </div>

        {/* Affected Services List */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Affected Services</h3>
          {affectedServices.length === 0 ? (
            <p className="text-gray-500 italic">No downstream dependencies</p>
          ) : (
            <div className="space-y-2">
              {affectedServices.map((service, index) => (
                <div key={service.id} className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-red-900">{service.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dependency Chain */}
        {dependencyChain.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Failure Propagation</h3>
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="font-mono text-sm text-gray-700">
                {selectedService.name}<br/>
                {dependencyChain.map((step, i) => (
                  <span key={i}>{step}<br/></span>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}