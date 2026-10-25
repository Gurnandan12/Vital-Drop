import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const secretKey = process.env.JWT_SECRET || 'super_secret_hackathon_key_do_not_use_in_prod';
const key = new TextEncoder().encode(secretKey);
export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(key);
}
export async function decrypt(input) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    }
    catch {
        return null;
    }
}
export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('auth_session')?.value;
    if (!session)
        return null;
    return await decrypt(session);
}
export async function setSessionCookie(jwt) {
    const cookieStore = await cookies();
    cookieStore.set('auth_session', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600 * 24 // 1 day
    });
}
export async function deleteSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_session');
}
