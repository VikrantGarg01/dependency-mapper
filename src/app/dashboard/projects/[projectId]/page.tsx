import { auth } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CreateServiceForm from '@/components/CreateServiceForm'
import CreateDependencyForm from '@/components/CreateDependencyForm'
import ExportButton from '@/components/ExportButton'
import ProjectGraphWrapper from '@/components/ProjectGraphWrapper'
import { ThemeToggle } from '@/components/ThemeToggle' // <-- Added ThemeToggle

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

  // Calculate stats
  const serviceCount = project.services.length
  const dependencyCount = project.dependencies.length
  const hardDeps = project.dependencies.filter(d => d.dependencyType === 'hard').length
  const softDeps = project.dependencies.filter(d => d.dependencyType === 'soft').length

  return (
    // Added dark mode gradient background
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex flex-col transition-colors duration-300">
      
      {/* Modern Header with dark mode support */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Project Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{project.description || 'No description provided'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle /> {/* <-- Added Theme Toggle Button */}
              
              <button className="group px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <ExportButton projectId={project.id} />
              </button>
              
              <CreateDependencyForm projectId={project.id} services={project.services as any} />
              <CreateServiceForm projectId={project.id} />
              
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-2 hidden sm:block"></div>
              
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards with dark mode support */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Total Services */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{serviceCount}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Services</p>
          </div>

          {/* Dependencies */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{dependencyCount}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Dependencies</p>
          </div>

          {/* Hard Dependencies */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{hardDeps}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Hard Dependencies</p>
          </div>

          {/* Soft Dependencies */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{softDeps}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Soft Dependencies</p>
          </div>

        </div>
      </div>

      {/* Graph Container with dark mode support */}
      <main className="flex-1 px-6 pb-6">
        <div className="max-w-7xl mx-auto h-full">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-[calc(100vh-350px)] min-h-[500px]">
            <div className="h-full p-6">
              <ProjectGraphWrapper
                services={project.services as any}
                dependencies={project.dependencies as any}
                projectId={project.id}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}