import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';
import { extname } from 'path';
import { validateFile, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/utils/fileValidation';
import { extractScriptContent } from '@/lib/utils/scriptExtractor';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Use the constants from fileValidation

export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return new NextResponse(validation.error, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse('File too large (max 10MB)', { status: 400 });
    }

    // Process the file and extract content
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { content: fileContent, title, metadata } = await extractScriptContent(
      fileBuffer,
      file.name,
      file.type
    );
    
    // If we couldn't extract a title, use the filename without extension
    const scriptTitle = title || file.name.replace(/\.[^/.]+$/, '');

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExt = extname(file.name).toLowerCase();
    const fileName = `${session.user.id}_${timestamp}${fileExt}`;
    const filePath = `uploads/${session.user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('scripts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new NextResponse('Failed to upload file', { status: 500 });
    }

    // Create a record in the database
    const { data: script, error: dbError } = await supabaseAdmin
      .from('scripts')
      .insert({
        user_id: session.user.id,
        title: scriptTitle,
        content: fileContent,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        metadata: {
          format: metadata.format,
          pages: metadata.pages,
          scenes: metadata.scenes,
          characters: metadata.characters,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up the uploaded file
      await supabaseAdmin.storage.from('scripts').remove([filePath]);
      return new NextResponse('Failed to save script data', { status: 500 });
    }

    return NextResponse.json({
      id: script.id,
      title: script.title,
      content: fileContent,
      wordCount: fileContent.split(/\s+/).length,
      fileType: file.type,
      fileSize: file.size,
      createdAt: script.created_at,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse(
      error.message || 'Internal Server Error',
      { status: 500 }
    );
  }
}

// Add CORS headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
