import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export class CloudinaryService {
  // Upload QR code image to Cloudinary
  static async uploadQRCode(
    imageData: string, // Base64 image
    publicId: string,
    folder: string = 'emboditrust/qr-codes'
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(imageData, {
        public_id: publicId,
        folder,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto:best' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload QR code to Cloudinary');
    }
  }

  // Upload batch of QR codes
  static async uploadQRCodeBatch(
    images: Array<{ data: string; publicId: string }>,
    folder: string = 'emboditrust/qr-codes'
  ): Promise<Array<{ url: string; publicId: string; originalId: string }>> {
    try {
      const uploadPromises = images.map(async (image) => {
        const result = await this.uploadQRCode(image.data, image.publicId, folder);
        return {
          url: result.url,
          publicId: result.publicId,
          originalId: image.publicId,
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Batch upload error:', error);
      throw new Error('Failed to upload QR code batch');
    }
  }

  // Delete QR code from Cloudinary
  static async deleteQRCode(publicId: string): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  // Generate QR code with Cloudinary transformations
  static generateQRCodeUrl(
    text: string,
    options: {
      width?: number;
      height?: number;
      color?: string;
      backgroundColor?: string;
    } = {}
  ): string {
    const {
      width = 300,
      height = 300,
      color = '000000',
      backgroundColor = 'ffffff'
    } = options;

    // Encode text for URL
    const encodedText = encodeURIComponent(text);

    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodedText}&size=${width}x${height}&color=${color}&bgcolor=${backgroundColor}&format=png`;
  }
}