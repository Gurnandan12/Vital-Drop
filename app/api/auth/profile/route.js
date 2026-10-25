import { NextResponse } from 'next/server';
import { getSession, encrypt, setSessionCookie } from '@/lib/jwt';
import { findUserByEmail, findUserById, updateUser, getDB } from '@/lib/db';
export async function PUT(request) {
    try {
        const session = await getSession();
        if (!session || (!session.id && !session.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const name = body.name?.trim();
        const email = body.email?.trim().toLowerCase();
        if (!name) {
            return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
        }
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
        }
        // Find current user in DB
        let user = session.id ? findUserById(session.id) : null;
        if (!user && session.email) {
            user = findUserByEmail(session.email);
        }
        if (!user) {
            // If user session exists but not in DB (e.g. demo session), update session directly
            const updatedUser = {
                id: session.id || 'demo-user',
                name,
                email,
            };
            const newToken = await encrypt(updatedUser);
            await setSessionCookie(newToken);
            return NextResponse.json({ success: true, user: updatedUser });
        }
        // Check if new email is already taken by a different user
        if (email !== user.email.toLowerCase()) {
            const allUsers = getDB();
            const emailConflict = allUsers.find((u) => u.id !== user.id && u.email.toLowerCase() === email);
            if (emailConflict) {
                return NextResponse.json({ error: 'This email address is already in use' }, { status: 400 });
            }
        }
        // Update in DB
        const updated = updateUser(user.id, { name, email });
        if (!updated) {
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }
        // Refresh JWT session cookie with new details
        const newToken = await encrypt({
            id: updated.id,
            name: updated.name,
            email: updated.email,
        });
        await setSessionCookie(newToken);
        return NextResponse.json({
            success: true,
            user: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
            },
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
