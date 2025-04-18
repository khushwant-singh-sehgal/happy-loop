'use client';

import { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    console.log('Test page loaded');
  }, []);

  return (
    <div className="p-8 bg-white m-4 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>If you can see this page, routing to the login folder works.</p>
    </div>
  );
} 