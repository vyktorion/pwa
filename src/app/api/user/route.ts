import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getUserById, updateUser, updatePassword, deleteUser } from '@/services/user.service';
import { hashPassword, verifyPassword } from '@/lib/auth/hash';
import { User } from '@/types';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Don't return hashed password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, role, avatar, currentPassword, newPassword } = await request.json();

    // Handle password change
    if (currentPassword !== undefined && newPassword !== undefined) {
      // Get current user to verify password
      const currentUser = await getUserById(session.user.id);
      if (!currentUser || !currentUser.hashedPassword) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, currentUser.hashedPassword);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      const user = await updatePassword(session.user.id, hashedNewPassword);
      if (!user) {
        return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
      }

      // Don't return hashed password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword: _hashedPassword, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    }

    // Handle profile update
    // Validate role if provided
    if (role && !['Proprietar', 'Agent', 'Agenție', 'Dezvoltator'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const updateData: Partial<Pick<User, 'name' | 'phone' | 'role' | 'avatar'>> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await updateUser(session.user.id, updateData);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Don't return hashed password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _hashedPassword, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const success = await deleteUser(session.user.id);
    if (!success) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}