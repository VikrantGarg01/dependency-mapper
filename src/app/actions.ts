'use server'

import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'Project name is required' }

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
    return { success: true }
  } catch (error) {
    console.error('Error creating project:', error)
    return { error: 'Failed to create project' }
  }
}

export async function createService(formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const projectId = formData.get('projectId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = (formData.get('status') as string) || 'healthy'

  if (!projectId || !name) {
    return { error: 'Missing required fields' }
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!dbUser) return { error: 'User not found' }

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: dbUser.id }
    })
    if (!project) return { error: 'Project not found' }

    await prisma.service.create({
      data: {
        name,
        description,
        projectId,
        status,
      },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Prisma create service error:', error)
    return { error: 'Failed to create service' }
  }
}

export async function createDependency(formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const projectId = formData.get('projectId') as string
  const sourceServiceId = formData.get('sourceServiceId') as string
  const targetServiceId = formData.get('targetServiceId') as string
  const dependencyType = (formData.get('dependencyType') as string) || 'hard'

  if (!projectId || !sourceServiceId || !targetServiceId) {
    return { error: 'Missing required fields' }
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!dbUser) return { error: 'User not found' }

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: dbUser.id }
    })
    if (!project) return { error: 'Project not found' }

    await prisma.dependency.create({
      data: {
        projectId,
        sourceServiceId,
        targetServiceId,
        dependencyType,
      }
    })
    
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Prisma create dependency error:', error)
    return { error: 'Failed to create dependency. It might already exist.' }
  }
}

export async function deleteService(serviceId: string, projectId: string) {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

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
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting service:', error)
    return { error: 'Failed to delete service' }
  }
}

export async function updateServiceStatus(serviceId: string, status: string, projectId: string) {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  try {
    await prisma.service.update({
      where: { id: serviceId },
      data: { status },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating service status:', error)
    return { error: 'Failed to update status' }
  }
}

export async function deleteDependency(edgeId: string, projectId: string) {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  try {
    await prisma.dependency.delete({
      where: { id: edgeId },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting dependency:', error)
    return { error: 'Failed to delete dependency' }
  }
}