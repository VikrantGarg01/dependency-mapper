'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createService } from '@/app/actions'
import { toast } from 'react-hot-toast'

export default function CreateServiceForm({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

// ... inside the component ...
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      await createService(formData)
      toast.success('Service added successfully!')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to add service')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add Service
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Service</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden input to tell the database which project this belongs to */}
          <input type="hidden" name="projectId" value={projectId} />
          
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input name="name" required placeholder="e.g., Payment Service" className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" placeholder="What does this service do?" className="w-full border rounded p-2" />
          </div>
          
          {/* NEW: Status dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" defaultValue="healthy" className="w-full border rounded p-2">
              <option value="healthy">🟢 Healthy</option>
              <option value="degraded">🟡 Degraded</option>
              <option value="down"> Down</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Service</button>
          </div>
        </form>
      </div>
    </div>
  )
}