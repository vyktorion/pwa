import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const saleFileRouter = {
  // Property images uploader for sale
  propertyImageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async () => {
      // Check if user is authenticated
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized - user not authenticated');
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Sale property image upload complete for userId:', metadata.userId);
      console.log('Image URL:', file.url);

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type SaleFileRouter = typeof saleFileRouter;