import { NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { findUserByEmail } from '@/lib/db';
export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.email) {
            return NextResponse.json({ user: null }, { status: 200 });
        }
        const dbUser = findUserByEmail(session.email);
        const user = {
            id: session.id || dbUser?.id || '',
            name: session.name || dbUser?.name || 'Investor',
            email: session.email,
            createdAt: dbUser?.createdAt,
        };
        return NextResponse.json({ user });
    }
    catch (error) {
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
