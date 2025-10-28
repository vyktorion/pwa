import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/hash';
import { createUser, getUserByEmail } from '@/services/user.service';
import { UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, password } = await request.json();

    // Validate input
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { message: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Parola trebuie să aibă cel puțin 6 caractere' },
        { status: 400 }
      );
    }

    if (!['Proprietar', 'Agent', 'Agenție', 'Dezvoltator'].includes(role)) {
      return NextResponse.json(
        { message: 'Rol invalid' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Un utilizator cu acest email există deja' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await createUser({
      name,
      email,
      role: role as UserRole,
      hashedPassword,
    });

    // Return success (don't include password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _hashedPassword, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Utilizator creat cu succes', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'A apărut o eroare la înregistrare' },
      { status: 500 }
    );
  }
}