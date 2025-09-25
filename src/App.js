import React, { useState, useEffect } from 'react';
import apiUrl from './config';

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/config`);
        if (!response.ok) {
          throw new Error('Failed to load configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading configuration:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfiguration();
  }, []); // Empty dependency array means this runs once when component mounts

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  if (error) {
    return <div>Error loading configuration: {error}</div>;
  }

  if (!config) {
    return <div>No configuration loaded</div>;
  }

  return (
    <div>
      {/* Your existing app content here, passing config as props */}
      <YourMainComponent 
        tasks={config.tasks}
        operators={config.operators}
        maintenanceActivities={config.maintenanceActivities}
        features={config.features}
        taskNameToKey={config.taskNameToKey}
        featureMapping={config.featureMapping}
      />
    </div>
  );
}

export default App; 