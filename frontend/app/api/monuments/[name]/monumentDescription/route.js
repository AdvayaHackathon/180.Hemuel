// app/api/monuments/[name]/monumentDescription/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    const name = params.name;
    
    if (!name) {
      return NextResponse.json({ error: 'Monument name is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("Location-Description");
    
    // Updated field name to match the database schema
    const monument = await db.collection("Description of monuments").findOne({ monumentName: name });
    
    if (!monument) {
      return NextResponse.json({ error: 'Monument not found' }, { status: 404 });
    }
    
    // Updated to return monumentDescription field instead of description
    return NextResponse.json({ description: monument.monumentDescription });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch monument description' }, { status: 500 });
  }
}