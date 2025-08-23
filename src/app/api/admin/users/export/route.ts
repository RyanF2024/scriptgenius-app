import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { Parser } from 'json2csv';

// Helper to check if user is admin
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  if (session.user.role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  return null;
}

// GET /api/admin/users/export - Export users to CSV
export async function GET(request: Request) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const search = searchParams.get('search') || '';
    const roles = searchParams.get('roles')?.split(',') as UserRole[] | undefined;
    const statuses = searchParams.get('statuses')?.split(',') as string[] | undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
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
    
    // Get all users matching the filters
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Format data for CSV
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Role', value: 'role' },
      { label: 'Status', value: 'status' },
      { 
        label: 'Email Verified', 
        value: (row: any) => row.emailVerified ? 'Yes' : 'No' 
      },
      { 
        label: 'Created At', 
        value: (row: any) => new Date(row.createdAt).toISOString() 
      },
      { 
        label: 'Last Updated', 
        value: (row: any) => new Date(row.updatedAt).toISOString() 
      },
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(users);
    
    // Create response with CSV data
    const response = new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=users-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
    
    return response;
    
  } catch (error) {
    console.error('Error exporting users:', error);
    return new NextResponse('Failed to export users', { status: 500 });
  }
}

// POST /api/admin/users/import - Import users from CSV
export async function POST(request: Request) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Read and parse the file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Empty or invalid CSV file' },
        { status: 400 }
      );
    }
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };
    
    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const values = row.split(',').map(v => v.trim());
      const userData: Record<string, string> = {};
      
      // Map values to headers
      headers.forEach((header, index) => {
        userData[header.toLowerCase()] = values[index] || '';
      });
      
      try {
        // Validate required fields
        if (!userData.email || !userData.name || !userData.role) {
          throw new Error('Missing required fields');
        }
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });
        
        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: userData.name,
              role: userData.role as UserRole,
              status: userData.status as any || 'ACTIVE',
            },
          });
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              name: userData.name,
              email: userData.email,
              role: userData.role as UserRole,
              status: userData.status as any || 'ACTIVE',
              // In a real app, you'd generate a random password and send a reset email
              password: 'temporary-password-needs-reset',
            },
          });
        }
        
        results.success++;
        
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 2, // +2 for 1-based index and header row
          error: error.message || 'Unknown error',
        });
      }
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error importing users:', error);
    return NextResponse.json(
      { error: 'Failed to import users' },
      { status: 500 }
    );
  }
}
