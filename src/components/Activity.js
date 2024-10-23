import React from 'react';
import Task from './Task';

const Activity = ({ activity, onTaskChange, onTaskFeatureChange, updateAllTaskFeatures, allTaskFeatures, taskNameToKey, tasks, featureMapping }) => {
  if (!activity || !Array.isArray(activity.tasks)) {
    return null; // Return null if activity or tasks are not properly passed
  }
  return (
    <div>
      {activity.tasks.map((task, taskIndex) => {
        const taskKey = taskNameToKey[task];
        const features = tasks[taskKey];
        console.log(activity.name);
        return (
          <Task
            key={taskIndex}
            task={{ field: activity.name, name: task, features: features }}
            onTaskChange={onTaskChange}
            onTaskFeatureChange={onTaskFeatureChange}
            updateAllTaskFeatures={updateAllTaskFeatures}
            allTaskFeatures={allTaskFeatures}
            featureMapping = {featureMapping}
          />
        );
      })}
    </div>
  );
};

export default Activity;
