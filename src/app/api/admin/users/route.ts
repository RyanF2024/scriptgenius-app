import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Helper to check if user is admin
async function requireAdmin(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  return null;
}

// GET /api/admin/users - List users with pagination and filters
export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search') || '';
    const roles = searchParams.get('roles')?.split(',') as UserRole[] | undefined;
    const statuses = searchParams.get('statuses')?.split(',') as string[] | undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (roles?.length) {
      where.role = { in: roles };
    }
    
    if (statuses?.length) {
      where.status = { in: statuses };
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    // Get total count
    const total = await prisma.user.count({ where });
    
    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json({
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.name || !data.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create user (in a real app, you'd hash the password here)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || 'ACTIVE',
        // In a real app, you'd use a proper password hashing library
        // and handle email verification
        password: data.password ? `hashed_${data.password}` : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    
    // In a real app, you might want to send a welcome/verification email here
    
    return NextResponse.json(user, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Bulk update users
export async function PATCH(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;
  
  try {
    const { ids, ...data } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No user IDs provided' },
        { status: 400 }
      );
    }
    
    // Validate that only allowed fields are being updated
    const allowedFields = ['role', 'status'];
    const invalidFields = Object.keys(data).filter(
      (field) => !allowedFields.includes(field)
    );
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Update users
    await prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data,
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating users:', error);
    return NextResponse.json(
      { error: 'Failed to update users' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Bulk delete users
export async function DELETE(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;
  
  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No user IDs provided' },
        { status: 400 }
      );
    }
    
    // Prevent deleting the last admin
    const adminUsers = await prisma.user.count({
      where: { role: 'ADMIN' },
    });
    
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, role: true },
    });
    
    const adminDeletionCount = usersToDelete.filter(
      (user) => user.role === 'ADMIN'
    ).length;
    
    if (adminDeletionCount > 0 && adminUsers - adminDeletionCount <= 0) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin user' },
        { status: 400 }
      );
    }
    
    // Delete users
    await prisma.user.deleteMany({
      where: {
        id: { in: ids },
      },
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting users:', error);
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    );
  }
}
