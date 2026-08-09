import { auth } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CreateServiceForm from '@/components/CreateServiceForm'
import CreateDependencyForm from '@/components/CreateDependencyForm'
import ExportButton from '@/components/ExportButton'
import ProjectGraphWrapper from '@/components/ProjectGraphWrapper'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {project.name}
            </h1>
            <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
          </div>
          <div className="flex gap-3 items-center">
            <ExportButton projectId={project.id} />
            <CreateDependencyForm projectId={project.id} services={project.services as any} />
            <CreateServiceForm projectId={project.id} />
            <SignOutButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <ProjectGraphWrapper
            services={project.services as any}
            dependencies={project.dependencies as any}
            projectId={project.id}
          />
        </div>  
      </main>
    </div>
  )
}