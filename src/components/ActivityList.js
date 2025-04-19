import React, { useState } from "react";
import { Tooltip, notification, Checkbox } from "antd";
import { StyledCard, StyledCollapse } from "./ActivityList.styles";
import Activity from "./Activity";
import apiUrl from '../config';

const { Panel } = StyledCollapse;

const ActivityList = ({ title, activities, onActivityChange, tasks, taskNameToKey, onTaskFeatureChange, updateAllTaskFeatures, allTaskFeatures, featureMapping, activityTitle, config }) => {
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

        // Show success notification
        notification.success({
            message: 'Task Features Updated',
            description: data.featuresMessage,
            placement: 'topRight',
            duration: 3
        });

    } catch (error) {
        // Show error notification
        notification.error({
            message: 'Update Failed',
            description: error.message || 'Failed to update task features',
            placement: 'topRight',
            duration: 4
        });
    }
  };
  const subActivityTitle = config?.ACTIVITY_DEFINITIONS[title] || title;
  return (
    <StyledCard
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tooltip title={subActivityTitle}>
            <span
              style={{
                display: "inline-block",
                maxWidth: "500px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {`${subActivityTitle}`}
              </span>
          </Tooltip>
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
          >
            Select All
          </Checkbox>
        </div>
      }
      bordered={true}
    >
      <StyledCollapse bordered={false}>
        <Panel header="Tasks Associated" key="1">
          <Activity
            activity={{
              name:  title,  // Usiamo il codice della sotto attività
              tasks: activities,
            }}
            onTaskChange={handleTaskChange}
            tasks={tasks}
            onTaskFeatureChange={onTaskFeatureChange}
            updateAllTaskFeatures={updateAllTaskFeatures}
            allTaskFeatures={allTaskFeatures}
            taskNameToKey={taskNameToKey}
            featureMapping={featureMapping}
            onSaveTask={handleSaveTask}
            selectAll={selectAll}
          />
        </Panel>
      </StyledCollapse>
    </StyledCard>
  );
};

export default ActivityList;
