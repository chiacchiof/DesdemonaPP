import React, { useState } from "react";
import { Tooltip, notification, Checkbox } from "antd";
import { StyledCard, StyledCollapse } from "./ActivityList.styles";
import Activity from "./Activity";
import apiUrl from '../config';

const { Panel } = StyledCollapse;

// Add this object for TACOM styling
const tacomStyles = {
  'VERY LOW': {
    backgroundColor: '#4CAF50', // green
    color: 'white'
  },
  'LOW': {
    backgroundColor: '#8BC34A', // light green
    color: 'black'
  },
  'MEDIUM': {
    backgroundColor: '#FFEB3B', // yellow
    color: 'black'
  },
  'HIGH': {
    backgroundColor: '#FF9800', // orange
    color: 'black'
  },
  'VERY HIGH': {
    backgroundColor: '#F44336', // red
    color: 'white'
  },
  'NOT DEFINED': {
    backgroundColor: '#9E9E9E', // grey
    color: 'black'
  }
};


const ActivityList = ({ title, activities, onActivityChange, tasks, taskNameToKey, onTaskFeatureChange, updateAllTaskFeatures, allTaskFeatures, featureMapping, activityTitle, config, user, setConfig }) => {
  const [selectAll, setSelectAll] = useState(false);

  const handleTaskChange = (activityName, task, isChecked) => {
    onActivityChange(title, activityName, task, isChecked);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);

    // Per ogni task in activities, simula il click del checkbox
    activities.forEach(taskName => {
      const taskKey = taskNameToKey[taskName];
      if (taskKey && tasks[taskKey]) {
        handleTaskChange(taskName, taskName, isChecked);
        if (isChecked) {
          updateAllTaskFeatures(title, taskName, tasks[taskKey]);
        } else {
          updateAllTaskFeatures(title, taskName, '');
        }
      }
    });
  };


  const handleSaveTask = async (taskKey, updatedFeatures) => {
    // Se l'utente è autenticato, non dovremmo usare questa funzione
    if (user) {
      return;
    }

    try {
        const response = await fetch(`${apiUrl}/modifyTaskFeatures`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                taskKey,
                features: updatedFeatures
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to update task features');
        }

        notification.success({
            message: 'Task Features Updated',
            description: data.featuresMessage,
            placement: 'topRight',
            duration: 3
        });

    } catch (error) {
        notification.error({
            message: 'Update Failed',
            description: error.message || 'Failed to update task features',
            placement: 'topRight',
            duration: 4
        });
    }
  };
  const subActivityTitle = config?.ACTIVITY_DEFINITIONS[title] || title;
  const tacomValue = config?.ACTIVITY_TACOM[title] || 'NOT DEFINED';
  const tacomStyle = tacomStyles[tacomValue] || tacomStyles['NOT DEFINED'];

  return (
    <StyledCard
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tooltip title={subActivityTitle}>
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "600px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {`${subActivityTitle}`}
                </span>
            </Tooltip>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.9em',
                ...tacomStyle
              }}
            >
              {tacomValue}
            </span>
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAll}
              >
              Select All
           </Checkbox>
          </div>
        </div>
      }
      bordered={true}
    >
      <StyledCollapse bordered={false}>
        <Panel header="Tasks Associated" key="1">
          <Activity
            activity={{
              name: title,
              tasks: activities,
            }}
            onTaskChange={handleTaskChange}
            tasks={tasks}
            onTaskFeatureChange={onTaskFeatureChange}
            updateAllTaskFeatures={updateAllTaskFeatures}
            allTaskFeatures={allTaskFeatures}
            taskNameToKey={taskNameToKey}
            featureMapping={featureMapping}
            onSaveTask={user ? null : handleSaveTask}
            selectAll={selectAll}
            user={user}
            setConfig={setConfig}
            config={config}
          />
        </Panel>
      </StyledCollapse>
    </StyledCard>
  );
};

export default ActivityList;
