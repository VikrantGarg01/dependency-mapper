import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import CreateProjectForm from '@/components/CreateProjectForm'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  // First find the database user by their Clerk ID
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      projects: {
        orderBy: { createdAt: 'desc' },
      }
    }
  })

  const projects = dbUser?.projects || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dependency Mapper</h1>
            <p className="text-gray-600 mt-1">Visualize your microservice architecture</p>
          </div>
          <CreateProjectForm />
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-gray-500">Create your first dependency map to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer">
                  <h3 className="text-lg font-bold mb-2">{project.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{project.description || 'No description'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}