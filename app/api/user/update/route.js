import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/db';
import { getSession } from '@/lib/jwt';
export async function POST(request) {
    try {
        const session = await getSession();
        if (!session || !session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const updates = await request.json();
        // Safety lock: Only allow updating fearScore or simulations
        const safeUpdates = {};
        if (updates.fearScore)
            safeUpdates.fearScore = updates.fearScore;
        if (updates.simulations)
            safeUpdates.simulations = updates.simulations;
        const user = updateUser(session.id, safeUpdates);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Update DB Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
