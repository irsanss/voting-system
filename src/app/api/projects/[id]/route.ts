import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.votingProject.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      isActive: project.isActive,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      candidateCount: project._count.candidates,
      voteCount: project._count.votes,
    })
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // Check if project exists
    const existingProject = await db.votingProject.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description
    }
    if (validatedData.startDate !== undefined) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = new Date(validatedData.endDate)
    }
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive
    }

    // Update the project
    const updatedProject = await db.votingProject.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        action: validatedData.isActive !== undefined ? 
          (validatedData.isActive ? 'PROJECT_ACTIVATE' : 'PROJECT_DEACTIVATE') : 
          'PROJECT_UPDATE',
        details: JSON.stringify({ 
          projectId: params.id, 
          title: updatedProject.title,
          changes: validatedData 
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Log security event if activating
    if (validatedData.isActive === true) {
      await db.securityLog.create({
        data: {
          type: 'PROJECT_ACTIVATION',
          details: JSON.stringify({ 
            projectId: params.id, 
            title: updatedProject.title,
            activatedAt: new Date().toISOString()
          }),
          severity: 'MEDIUM',
          ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })
    }

    return NextResponse.json({
      id: updatedProject.id,
      title: updatedProject.title,
      description: updatedProject.description,
      startDate: updatedProject.startDate.toISOString(),
      endDate: updatedProject.endDate.toISOString(),
      isActive: updatedProject.isActive,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
      candidateCount: updatedProject._count.candidates,
      voteCount: updatedProject._count.votes,
    })
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if project exists
    const existingProject = await db.votingProject.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if votes already cast
    if (existingProject._count.votes > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing votes' },
        { status: 400 }
      )
    }

    // Delete the project
    await db.votingProject.delete({
      where: { id: params.id }
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        action: 'PROJECT_DELETE',
        details: JSON.stringify({ 
          projectId: params.id, 
          title: existingProject.title 
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Log security event
    await db.securityLog.create({
      data: {
        type: 'PROJECT_DELETION',
        details: JSON.stringify({ 
          projectId: params.id, 
          title: existingProject.title,
          deletedAt: new Date().toISOString()
        }),
        severity: 'HIGH',
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}