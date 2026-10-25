import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db';
import { encrypt, setSessionCookie } from '@/lib/jwt';
import bcrypt from 'bcryptjs';
export async function POST(request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }
        const user = findUserByEmail(email);
        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        // Create session
        const token = await encrypt({ id: user.id, email: user.email, name: user.name });
        await setSessionCookie(token);
        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    }
    catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
