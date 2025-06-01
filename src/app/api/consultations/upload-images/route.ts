import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

// Handle multipart/form-data for image uploads
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');
    
    if (!images || images.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No images provided'
      }, { status: 400 });
    }
    
    // Ensure the uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    
    const imageUrls: string[] = [];
    
    // Process each uploaded image
    for (const image of images) {
      if (image instanceof File) {
        const fileExtension = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadsDir, fileName);
        
        // Convert the file to an array buffer
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Write the file to the uploads directory
        await writeFile(filePath, buffer);
        
        // Create a public URL for the image
        const imageUrl = `/uploads/${fileName}`;
        imageUrls.push(imageUrl);
      }
    }
    
    return NextResponse.json({
      status: 'success',
      imageUrls,
      message: `${imageUrls.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to upload images',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 