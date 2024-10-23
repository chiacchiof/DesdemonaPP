import React, { useState } from "react";
import { Tooltip } from "antd";
import { StyledCard, StyledCollapse } from "./ActivityList.styles";
import Activity from "./Activity";

const { Panel } = StyledCollapse;

const ActivityList = ({ title, activities, onActivityChange, tasks, taskNameToKey, onTaskFeatureChange, updateAllTaskFeatures, allTaskFeatures, featureMapping }) => {
  const handleTaskChange = (activityName, task, isChecked) => {
    onActivityChange(title, activityName, task, isChecked);
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
            tasks={tasks} // Pass the tasks state
            onTaskFeatureChange={onTaskFeatureChange} // Pass the feature change handler
            updateAllTaskFeatures={updateAllTaskFeatures}
            allTaskFeatures={allTaskFeatures}
            taskNameToKey={taskNameToKey}
            featureMapping = {featureMapping}
          />
        </Panel>
      </StyledCollapse>
    </StyledCard>
  );
};

export default ActivityList;
