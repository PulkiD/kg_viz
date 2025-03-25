import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Get allowed origins from environment variable
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = request.headers.get('origin');

  // Check if the request origin is allowed
  if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Add other CORS headers
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/api/:path*',  // Apply to all API routes
    '/results/:path*',  // Apply to results pages
  ],
}; 