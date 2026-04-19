import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { CloudinaryService } from '@/utils/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifySession(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image');
    const kind = String(formData.get('kind') || 'branding');

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Image file is required' },
        { status: 400 }
      );
    }

    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Image size must be 5MB or less' },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;
    const publicId = `${kind}-${uuidv4()}`;

    const uploadResult = await CloudinaryService.uploadImage(
      base64Image,
      publicId,
      'emboditrust/branding'
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  } catch (error) {
    console.error('Admin image upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}