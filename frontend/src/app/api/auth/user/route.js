import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      // Verify the token (this should match your backend verification logic)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Return the user info from the token
      return NextResponse.json({
        user: {
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (err) {
      // Token is invalid
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error retrieving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 