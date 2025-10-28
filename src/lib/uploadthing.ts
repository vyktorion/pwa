import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  // Avatar uploader for user profiles
  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      // Check if user is authenticated
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized - user not authenticated');
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update user avatar in database
      try {
        const { updateUser } = await import('@/services/user.service');
        await updateUser(metadata.userId, { avatar: file.url });

        console.log('Avatar upload complete for userId:', metadata.userId);
        console.log('Avatar URL:', file.url);

        return { uploadedBy: metadata.userId, url: file.url };
      } catch (error) {
        console.error('Failed to update user avatar:', error);
        throw new UploadThingError('Failed to save avatar');
      }
    }),

  // Property images uploader
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
      console.log('Property image upload complete for userId:', metadata.userId);
      console.log('Image URL:', file.url);

      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // General image uploader (legacy - can be removed if not needed)
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async () => {
      return { userId: 'anonymous' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;