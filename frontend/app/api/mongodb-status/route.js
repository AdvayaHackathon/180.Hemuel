// app/api/mongodb-status/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
  // Mask password in logs for security
  const maskedUri = process.env.MONGODB_URI ? 
    process.env.MONGODB_URI.replace(/:([^@]+)@/, ':***@') : 
    'undefined';
  console.log('MongoDB URI (masked):', maskedUri);

  try {
    // Test the database connection
    const client = await clientPromise;
    await client.db().admin().ping();
    console.log('MongoDB connection successful');
    
    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return NextResponse.json({ connected: false });
  }
}