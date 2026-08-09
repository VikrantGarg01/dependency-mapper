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
      const result = await createDependency(formData)
      
      // Check if the action returned an error object
      if (result?.error) {
        toast.error(result.error)
        return
      }
      
      // If no error, it was successful!
      toast.success('Dependency created!')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Unexpected dependency creation error:', error)
      toast.error('An unexpected error occurred')
    }
  }

  // Replace the button section with this:
if (!isOpen) {
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="group px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
    >
      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Add Dependency
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