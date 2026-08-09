'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDependency } from '@/app/actions'
import toast from 'react-hot-toast'

export default function CreateDependencyForm({ 
  projectId, 
  services 
}: { 
  projectId: string
  services: { id: string; name: string }[] 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      await createDependency(formData)
      toast.success('Dependency added successfully!')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to add dependency')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Add Dependency
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Dependency</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          
          <div>
            <label className="block text-sm font-medium mb-1">Source Service (Calls)</label>
            <select name="sourceServiceId" required className="w-full border rounded p-2">
              <option value="">Select source...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Service (Is called by)</label>
            <select name="targetServiceId" required className="w-full border rounded p-2">
              <option value="">Select target...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select name="dependencyType" className="w-full border rounded p-2">
              <option value="hard">Hard (Sync)</option>
              <option value="soft">Soft (Async/Queue)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}