'use client';

import { seedData } from './actions';
import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState('Idle');

  const runSeed = async () => {
    setStatus('Running...');
    const res = await seedData();
    if (res.success) {
      setStatus('Done!');
      console.log(res.logs);
      alert(res.logs?.join('\n'));
    } else {
      setStatus('Error: ' + res.error);
      if (res.logs) alert(res.logs.join('\n'));
    }
  };

  return (
    <div className="p-10">
      <h1 className="mb-4 text-2xl font-bold">Seed Data</h1>
      <button onClick={runSeed} className="rounded bg-blue-500 px-4 py-2 text-white">
        Run Seed
      </button>
      <p className="mt-4">{status}</p>
    </div>
  );
}
