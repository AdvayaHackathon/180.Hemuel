'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, Info, Database, Cross, Clock } from 'lucide-react';

const MonumentInfoPage = () => {
  const [monumentInfo, setMonumentInfo] = useState(null);
  interface Visit {
    monumentName: string;
    timestamp: string;
  }
  const [visitedMonuments, setVisitedMonuments] = useState<Visit[]>([]);
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

  // Record the monument visit
  useEffect(() => {
    if (!monumentName || !dbStatus.connected) return;

    const recordVisit = async () => {
      try {
        await axios.post('/api/monuments/record-visit', { 
          monumentName 
        });
        console.log('Visit recorded successfully');
      } catch (err) {
        console.error('Error recording visit:', err);
      }
    };

    recordVisit();
  }, [monumentName, dbStatus.connected]);

  // Fetch monument information and visited monuments
  useEffect(() => {
    // Redirect to home if no monument name was provided
    if (!monumentName) {
      router.push('/Explore/NewExplore');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Parallel requests for better performance
        const [infoResponse, visitsResponse] = await Promise.all([
          // Get monument description
          axios.get(`/api/monuments/${encodeURIComponent(monumentName)}/monumentDescription`),
          // Get visited monuments history
          axios.get('/api/monuments/visited')
        ]);
        
        if (infoResponse.data && infoResponse.data.description) {
          setMonumentInfo(infoResponse.data.description);
        } else {
          setError(`No information found for this monument.`);
        }
        
        if (visitsResponse.data && visitsResponse.data.visits) {
          setVisitedMonuments(visitsResponse.data.visits);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch monument information. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [monumentName, router]);

  const handleBackClick = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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


      {/* Visited Monuments Section */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Visit History</h2>
        </div>
        
        <div className="p-4">
          {visitedMonuments.length > 0 ? (
            <div className="space-y-3">
              {visitedMonuments.map((visit, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded border border-border">
                  <div className="flex items-center mb-1">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(visit.timestamp)}
                    </span>
                  </div>
                  <p className="font-medium">{visit.monumentName}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No visit history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonumentInfoPage;