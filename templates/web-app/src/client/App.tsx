import React, { useEffect, useState } from 'react';

export default function App() {
  const [status, setStatus] = useState<string>('checking...');

  useEffect(() => {
    fetch('/health')
      .then(r => r.json())
      .then(d => setStatus(d.status))
      .catch(() => setStatus('unreachable'));
  }, []);

  return (
    <div className="app">
      <h1>{{name}}</h1>
      <p>Scaffolded with <a href="https://github.com/forgekit/forgekit">ForgeKit</a></p>
      <p>API status: <strong>{status}</strong></p>
    </div>
  );
}
