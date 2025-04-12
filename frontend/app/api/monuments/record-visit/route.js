// File: app/api/monuments/record-visit/route.js (or .ts)
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/';

export async function POST(request) {
  try {
    const { monumentName } = await request.json();
    
    if (!monumentName) {
      return new Response(JSON.stringify({ success: false, message: 'Monument name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const db = client.db('Location-Description');
      const collection = db.collection('Monuments-visited');
      
      // Check if this monument has been visited before
      const existingVisit = await collection.findOne({ monumentName });
      
      // If it exists, return success but don't insert a duplicate
      if (existingVisit) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Monument already visited previously',
          isNewVisit: false
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // If it doesn't exist, insert the new visit
      const result = await collection.insertOne({
        monumentName,
        timestamp: new Date(),
        firstVisit: true
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Visit recorded successfully',
        insertedId: result.insertedId,
        isNewVisit: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error recording monument visit:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to record monument visit' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}