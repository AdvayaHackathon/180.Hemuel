'use client';
import React from 'react';



const Plan = () => {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Our Plans</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Plan Cards can be added here */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Basic Plan</h2>
                        <p className="text-gray-600 mb-4">Perfect for getting started</p>
                        <ul className="space-y-2 mb-6">
                            <li>✓ Feature 1</li>
                            <li>✓ Feature 2</li>
                            <li>✓ Feature 3</li>
                        </ul>
                        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            Select Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Plan;