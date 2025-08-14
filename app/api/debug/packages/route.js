import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.creditPackage.findMany({
      select: {
        id: true,
        name: true,
        credits: true,
        price: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        credits: 'asc'
      }
    })

    return NextResponse.json({ 
      success: true,
      count: packages.length,
      packages,
      message: packages.length === 0 ? 'No packages found. Run seed script to create packages.' : 'Packages retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to fetch packages',
      hint: 'Check if Prisma is properly configured for WSL'
    }, { status: 500 })
  }
}