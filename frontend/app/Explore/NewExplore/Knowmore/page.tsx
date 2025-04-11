
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';

/*const page = () => {
  const [monumentInfo, setMonumentInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get the monument ID and name from URL query parameters
  const monumentId = searchParams.get('id');
  const monumentName = searchParams.get('name');

  useEffect(() => {
    // Redirect to home if no monument ID was provided
    if (!monumentId) {
      navigate('/');
      return;
    }

    const fetchMonumentInfo = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint that fetches by ID
        const response = await axios.get(`/api/monuments/${monumentId}/description`);
        
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
  }, [monumentId, navigate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-card rounded-lg border border-border">
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

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border">
          <h1 className="text-xl font-bold">{monumentName || "Monument Information"}</h1>
        </div>

        <div className="p-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2 text-primary" />
              About this Monument
            </h2>
            <p className="text-muted-foreground">{monumentInfo}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;*/


const page = () => {
    return (
        <div className="w-full max-w-2xl mx-auto mt-6 mb-6">
            <button 
                className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 py-2 px-4 rounded flex items-center"
            >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                <div className="bg-muted/50 p-4 border-b border-border">
                    <h1 className="text-xl font-bold">Monument Information</h1>
                </div>

                <div className="p-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-primary" />
                            About this Monument
                        </h2>
                        <p className="text-muted-foreground">
                            Monument description goes here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;