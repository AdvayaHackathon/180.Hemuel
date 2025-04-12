// writeToMongo.js

import { MongoClient } from 'mongodb';
import { getMonumentName } from './monumentProvider.js'; // Importing value from another function

const uri = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/'; // Replace with your URI

async function writeMonumentName() {
  const monumentName = getMonumentName();

  if (!monumentName) {
    console.error("No monument name received.");
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('Location-Description');
    const collection = db.collection('monuments');

    const result = await collection.insertOne({
      monumentName,
      timestamp: new Date(),
    });

    console.log(`Inserted document with _id: ${result.insertedId}`);
  } catch (err) {
    console.error('Error writing to MongoDB:', err);
  } finally {
    await client.close();
  }
}

writeMonumentName();
