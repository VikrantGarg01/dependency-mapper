import { auth } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'  // <-- Add this import
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CreateServiceForm from '@/components/CreateServiceForm'
import CreateDependencyForm from '@/components/CreateDependencyForm'
import ProjectGraph from '@/components/ProjectGraph'
import ExportButton from '@/components/ExportButton'

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth()
  if (!userId) return null

  const { projectId } = await params

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) notFound()

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId, 
      userId: dbUser.id
    },
    include: {
      services: true,
      dependencies: {
        include: {
          sourceService: true,
          targetService: true,
        }
      }
    }
  })

  if (!project) notFound()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.description}</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Sign Out Button */}
          <SignOutButton>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition">
              Sign Out
            </button>
          </SignOutButton>
          
          <ExportButton projectId={project.id} />
          <CreateDependencyForm projectId={project.id} services={project.services} />
          <CreateServiceForm projectId={project.id} />
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="bg-white border rounded-lg overflow-hidden">
          <ProjectGraph 
            services={project.services} 
            dependencies={project.dependencies}
            projectId={project.id}
          />
        </div>
      </main>
    </div>
  )
}