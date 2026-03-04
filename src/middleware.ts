import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protection logic
    const path = request.nextUrl.pathname;
    const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');
    const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/portal') || path.startsWith('/dashboard');

    // 1. If user is logged in
    if (user) {
        // If not accessing an auth or protected route, we don't need the role to navigate
        if (!isAuthRoute && !isProtectedRoute) {
            return response;
        }

        // Fetch role from profile only for routes that require routing decisions
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role;

        // If trying to access login/signup while logged in, redirect to correct portal
        if (isAuthRoute) {
            if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
            if (role === 'agent' || role === 'loan_officer') return NextResponse.redirect(new URL('/portal', request.url));
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Role-based route protection
        if (path.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (path.startsWith('/portal') && !['admin', 'agent', 'loan_officer'].includes(role || '')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else {
        // 2. If user is NOT logged in and tries to access protected routes
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
