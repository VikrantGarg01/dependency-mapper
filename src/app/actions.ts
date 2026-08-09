'use server'

import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  try {
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`
    const userName = user?.firstName || user?.username || null

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          name: userName,
        },
      })
    }

    await prisma.project.create({
      data: {
        name,
        description,
        userId: dbUser.id,
      },
    })

    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export async function createService(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const projectId = formData.get('projectId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string || 'healthy'

  await prisma.service.create({
    data: {
      name,
      description,
      projectId,
      status,
    },
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function createDependency(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const projectId = formData.get('projectId') as string
  const sourceServiceId = formData.get('sourceServiceId') as string
  const targetServiceId = formData.get('targetServiceId') as string
  const dependencyType = formData.get('dependencyType') as string || 'hard'

  await prisma.dependency.create({
    data: {
      projectId,
      sourceServiceId,
      targetServiceId,
      dependencyType,
    },
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteService(serviceId: string, projectId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    await prisma.dependency.deleteMany({
      where: {
        OR: [
          { sourceServiceId: serviceId },
          { targetServiceId: serviceId }
        ]
      }
    })

    await prisma.service.delete({
      where: { id: serviceId }
    }).catch(() => {
      console.log('Service already deleted')
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
  } catch (error) {
    console.error('Error deleting service:', error)
    throw error
  }
}
export async function updateServiceStatus(serviceId: string, status: string, projectId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  await prisma.service.update({
    where: { id: serviceId },
    data: { status },
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteDependency(edgeId: string, projectId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  await prisma.dependency.delete({
    where: { id: edgeId },
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}