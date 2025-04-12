'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, Info, Database, Cross } from 'lucide-react';

const MonumentInfoPage = () => {
  const [monumentInfo, setMonumentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState({ connected: false, checked: false });
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the monument name from URL query parameters
  const monumentName = searchParams.get('name');
  console.log('Monument Name:', monumentName);

  // Check database connection
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const response = await axios.get('/api/mongodb-status');
        setDbStatus({ 
          connected: response.data.connected, 
          checked: true 
        });
      } catch (err) {
        setDbStatus({ 
          connected: false, 
          checked: true 
        });
        console.error('Failed to check database status:', err);
      }
    };

    checkDbConnection();
  }, []);

  useEffect(() => {
    // Redirect to home if no monument name was provided
    if (!monumentName) {
      router.push('/Explore/NewExplore');
      return;
    }

    const fetchMonumentInfo = async () => {
      try {
        setLoading(true);
        // Using the MongoDB API endpoint with monument name
        const response = await axios.get(`/api/monuments/${encodeURIComponent(monumentName)}/monumentDescription`);
        
        if (response.data && response.data.description) {
          setMonumentInfo(response.data.description);
        } else {
          setError(`No information found for this monument.`);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch monument information. Please try again later.');
        setLoading(false);
        console.error('Error fetching monument info:', err);
      }
    };

    fetchMonumentInfo();
  }, [monumentName, router]);

  const handleBackClick = () => {
    router.back();
  };

  const DatabaseStatus = () => (
    <div className="absolute top-2 right-2 flex items-center">
  
      {dbStatus.checked ? (
        dbStatus.connected ? (
          <div className="flex items-center text-green-500 text-sm">
            <Database className="w-4 h-4 mr-1" />
            <span>DB Connected</span>
          </div>
        ) : (
          <div className="flex items-center text-red-500 text-sm">
            <Cross className="w-4 h-4 mr-1" />
            <span>DB Disconnected</span>
          </div>
        )
      ) : (
        <div className="flex items-center text-gray-400 text-sm">
          <Database className="w-4 h-4 mr-1" />
          <span>Checking DB...</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8 relative">
        <DatabaseStatus />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-card rounded-lg border border-border relative">
        <DatabaseStatus />
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={handleBackClick}
          className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 py-2 px-4 rounded flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 mb-6">
      <button 
        onClick={handleBackClick}
        className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 py-2 px-4 rounded flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden relative">
        <DatabaseStatus />
        <div className="bg-muted/50 p-4 border-b border-border">
        </div>

        <div className="p-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2 text-primary" />
              {monumentName}
            </h2>
            <p className="text-muted-foreground">{monumentInfo}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonumentInfoPage;