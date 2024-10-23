import React, { useState, useEffect } from "react";
import { Row, Col, Tooltip, Checkbox, Modal, Slider, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const Task = ({ task, onTaskChange, onTaskFeatureChange, updateAllTaskFeatures, allTaskFeatures, featureMapping }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [taskFeatures, setTaskFeatures] = useState(task.features);
  const [originalTaskFeatures, setOriginalTaskFeatures] = useState(task.features); // Backup of original task features
  const [selectedOptions, setSelectedOptions] = useState(task.features); // Initialize selectedOptions with task.features
  const [isChecked, setIsChecked] = useState(false); // State for checkbox status

  const handleCheckboxChange = (task, isChecked, option) => {
    setIsChecked(isChecked);
    onTaskChange(task.name, isChecked);

    const newSelectedOption = isChecked ? option : '';
    setSelectedOptions(newSelectedOption);

    updateAllTaskFeatures(task.field, task.name, newSelectedOption);
  };

  const handleFeatureChange = (feature, value) => {
    const newFeatures = {
      ...taskFeatures,
      [feature]: value,
    };
    setTaskFeatures(newFeatures);
  };

  const showPopup = () => {
    setOriginalTaskFeatures(taskFeatures); // Backup the current features when the modal is opened
    setPopupVisible(true);
  };

  const closePopup = () => {
    setTaskFeatures(originalTaskFeatures); // Restore the original features if the modal is closed without saving
    setPopupVisible(false);
  };

  const saveChanges = () => {
    // Update task features and selected options
    Object.keys(taskFeatures).forEach(feature => {
      onTaskFeatureChange(task.name, feature, taskFeatures[feature]);
    });

    // Update the selected options based on checkbox state
    const newSelectedOption = isChecked ? taskFeatures : '';
    setSelectedOptions(newSelectedOption);

    // Update all task features without changing the checkbox status
    updateAllTaskFeatures(task.field, task.name, newSelectedOption);

    setPopupVisible(false); // Close the modal
  };

  useEffect(() => {
    setTaskFeatures(task.features);
    setSelectedOptions(task.features);
    setIsChecked(task.isChecked); // Set initial checkbox state if task has isChecked property
  }, [task.features, task.isChecked]);

  return (
    <>
      <Row key={task.name} gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Tooltip title={task.name}>
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Checkbox
                onChange={(e) => handleCheckboxChange(task, e.target.checked, taskFeatures)}
                style={{ flex: 1 }}
                checked={isChecked}
              >
                <div style={{ cursor: "pointer" }}>
                  <span
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                    }}
                  >
                    {task.name}
                  </span>
                  {/*<span>
                    {JSON.stringify(taskFeatures)}
                  </span>
                  */}
                </div>
              </Checkbox>
              <EditOutlined
                onClick={showPopup}
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              />
            </div>
          </Tooltip>
        </Col>
      </Row>

      <Modal
        open={popupVisible}
        onCancel={closePopup}
        footer={[
          <Button key="cancel" onClick={closePopup}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={saveChanges}>
            Save
          </Button>,
        ]}
        centered
        maskClosable={false}  // Prevent closing the modal by clicking outside of it
      >
        <h1>{task.field}</h1>
        <h2>{task.name}</h2>
        <p>Checkbox is {isChecked ? "checked" : "unchecked"}</p> {/* Display checkbox status */}
        {Object.keys(taskFeatures).map((feature) => (
          <Row key={feature} style={{ marginBottom: '10px' }}>
            <Col span={16}>
              <span>{featureMapping[feature]}: {taskFeatures[feature]}</span>
            </Col>
            <Col span={8}>
              <Slider
                min={0}
                max={10}
                step={0.05}
                value={parseFloat(taskFeatures[feature])}
                onChange={(value) => handleFeatureChange(feature, value)}
              />
            </Col>
          </Row>
        ))}
      </Modal>
    </>
  );
};

export default Task;
