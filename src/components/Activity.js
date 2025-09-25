import React from 'react';
import Task from './Task';

const Activity = ({ 
    activity, 
    onTaskChange, 
    onTaskFeatureChange, 
    updateAllTaskFeatures, 
    allTaskFeatures, 
    taskNameToKey, 
    tasks, 
    featureMapping,
    onSaveTask,
    selectAll,
    user,
    setConfig,
    config
}) => {
    if (!activity || !Array.isArray(activity.tasks)) {
        return null;
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
                        featureMapping={featureMapping}
                        onSaveTask={onSaveTask}
                        taskKey={taskKey}
                        selectAll={selectAll}
                        user={user}
                        setConfig={setConfig}
                        config={config}
                    />
                );
            })}
        </div>
    );
};

export default Activity;
