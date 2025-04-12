// File: app/api/monuments/visited/route.js (or .ts)
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/';

export async function GET() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('Location-Description');
    const collection = db.collection('Monuments-visited');
    
    // Get all visits, sort by timestamp in descending order (newest first)
    const visits = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(20) // Limit to 20 most recent visits
      .toArray();
    
    return new Response(JSON.stringify({ 
      success: true, 
      visits 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching monument visits:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to fetch visited monuments',
      visits: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await client.close();
  }
}