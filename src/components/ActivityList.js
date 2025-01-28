import React, { useState } from "react";
import { Tooltip, notification } from "antd";
import { StyledCard, StyledCollapse } from "./ActivityList.styles";
import Activity from "./Activity";
import apiUrl from '../config';

const { Panel } = StyledCollapse;

const ActivityList = ({ title, activities, onActivityChange, tasks, taskNameToKey, onTaskFeatureChange, updateAllTaskFeatures, allTaskFeatures, featureMapping }) => {
  const handleTaskChange = (activityName, task, isChecked) => {
    onActivityChange(title, activityName, task, isChecked);
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

  return (
    <StyledCard
      title={
        <Tooltip title={title}>
          <span
            style={{
              display: "inline-block",
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
        </Tooltip>
      }
      bordered={true}
    >
      <StyledCollapse bordered={false}>
        <Panel header="Activities" key="1">
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
            onSaveTask={handleSaveTask}
          />
        </Panel>
      </StyledCollapse>
    </StyledCard>
  );
};

export default ActivityList;
