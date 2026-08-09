'use client'

import { toPng } from 'html-to-image'

export default function ExportButton({ projectId }: { projectId: string }) {
  const handleExport = async () => {
    try {
      // Find the React Flow canvas
      const graphElement = document.querySelector('.react-flow__renderer') as HTMLElement
      
      if (!graphElement) {
        alert('Could not find graph to export')
        return
      }

      // Show loading state
      const button = document.getElementById('export-btn')
      if (button) {
        button.textContent = 'Generating...'
      }

      // Generate the image
      const dataUrl = await toPng(graphElement, {
        backgroundColor: '#f9fafb', // Light gray background
        quality: 1.0,
        pixelRatio: 2, // High resolution
        cacheBust: true,
      })

      // Create download link
      const link = document.createElement('a')
      link.download = `dependency-map-${projectId}-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()

      // Reset button
      if (button) {
        button.textContent = '📥 Export as PNG'
      }

    } catch (error) {
      console.error('Error exporting graph:', error)
      alert('Failed to export graph. Please try again.')
    }
  }

  return (
    <button
      id="export-btn"
      onClick={handleExport}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-md"
      title="Download graph as PNG image"
    >
      <span>📥</span>
      <span>Export as PNG</span>
    </button>
  )
}