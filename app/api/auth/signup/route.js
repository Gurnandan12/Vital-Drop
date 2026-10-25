import { NextResponse } from 'next/server';
import { getDB, saveDB, findUserByEmail } from '@/lib/db';
import { encrypt, setSessionCookie } from '@/lib/jwt';
import bcrypt from 'bcryptjs';
export async function POST(request) {
    try {
        const { name, email, password } = await request.json();
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        if (findUserByEmail(email)) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = {
            id: crypto.randomUUID(),
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        const users = getDB();
        users.push(newUser);
        saveDB(users);
        // Create session
        const token = await encrypt({ id: newUser.id, email: newUser.email, name: newUser.name });
        await setSessionCookie(token);
        return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    }
    catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
