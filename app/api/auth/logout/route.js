import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/jwt';
export async function POST() {
    await deleteSessionCookie();
    return NextResponse.json({ success: true });
}
