import React, { useState, useEffect } from "react";
import { Row, Col, Tooltip, Checkbox, Modal, Slider, Button, notification } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import apiUrl from '../config';

const Task = ({ task, onTaskChange, onTaskFeatureChange, updateAllTaskFeatures, allTaskFeatures, featureMapping, onSaveTask, taskKey, selectAll, user, setConfig, config }) => {
  console.log('Task component detailed props:', {
    task: task,
    user: user,
    onSaveTask: onSaveTask,
    taskKey: taskKey,
    config: config?.maintenanceActivities ? 'config present' : 'config missing',
    featureMapping: featureMapping,
    allTaskFeatures: allTaskFeatures
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [taskFeatures, setTaskFeatures] = useState(task.features);
  const [originalTaskFeatures, setOriginalTaskFeatures] = useState(task.features);
  const [selectedOptions, setSelectedOptions] = useState(task.features);
  const [isChecked, setIsChecked] = useState(false);

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
    setOriginalTaskFeatures(taskFeatures);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setTaskFeatures(originalTaskFeatures);
    setPopupVisible(false);
  };

  const saveChanges = async () => {
    try {
      console.log('SaveChanges started');
      console.log('User:', user);
      console.log('Task:', task);
      console.log('TaskKey:', taskKey);
      console.log('TaskFeatures:', taskFeatures);
      
      if (user) {
        console.log('Entering Firebase update path');
        const docRef = doc(db, 'userConfigs', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log('Firebase doc exists, updating...');
          const userData = docSnap.data();
          const currentConfig = userData.config;
          
          console.log('Config structure:', currentConfig);

          let updatedConfig = {...currentConfig};
          let taskUpdated = false;

          // Verifica se il task esiste direttamente in tasks
          if (currentConfig.tasks[taskKey]) {
            console.log('Found task in tasks collection:', taskKey);
            updatedConfig.tasks[taskKey] = {
              ...currentConfig.tasks[taskKey],
              ...taskFeatures  // Spread diretto delle features invece di metterle in un oggetto features
            };
            taskUpdated = true;
          }

          if (!taskUpdated) {
            console.error('Task search details:', {
              searchedName: task.name,
              searchedKey: taskKey,
              availableTaskKeys: Object.keys(currentConfig.tasks)
            });
            throw new Error(`Task "${task.name}" (key: ${taskKey}) not found in configuration`);
          }

          try {
            // Salva su Firebase
            await updateDoc(docRef, {
              config: updatedConfig,
              updatedAt: new Date().toISOString()
            });
            console.log('Firebase update successful');

            // Aggiorna lo stato locale
            setConfig(updatedConfig);

            notification.success({
              message: 'Features Updated Successfully',
              description: 'Task features updated in your configuration',
              placement: 'topRight',
              duration: 3
            });
          } catch (updateError) {
            console.error('Firebase update error:', updateError);
            throw new Error(`Failed to update Firebase: ${updateError.message}`);
          }
        } else {
          console.error('Firebase doc does not exist');
          throw new Error('User configuration not found in Firebase');
        }
      } else if (typeof onSaveTask === 'function') {
        console.log('Entering server API path');
        await onSaveTask(taskKey, taskFeatures);
      } else {
        console.log('No valid save path found!');
        console.log('User status:', !!user);
        console.log('onSaveTask available:', typeof onSaveTask);
        throw new Error('No valid save method available');
      }

      // Update task features and selected options
      Object.keys(taskFeatures).forEach(feature => {
        onTaskFeatureChange(task.name, feature, taskFeatures[feature]);
      });

      // Update the selected options based on checkbox state
      const newSelectedOption = isChecked ? taskFeatures : '';
      setSelectedOptions(newSelectedOption);

      // Update all task features without changing the checkbox status
      updateAllTaskFeatures(task.field, task.name, newSelectedOption);

      setPopupVisible(false);

    } catch (error) {
      console.error('SaveChanges error:', error);
      console.error('Error details:', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      notification.error({
        message: 'Update Failed',
        description: error.message || 'Failed to update task features',
        placement: 'topRight',
        duration: 4
      });
      return;
    }
  };

// Gestiamo il Select All separatamente
useEffect(() => {
  if (selectAll !== undefined) {
    setIsChecked(selectAll);
    if (selectAll) {
      setSelectedOptions(taskFeatures);
      updateAllTaskFeatures(task.field, task.name, taskFeatures);
    } else {
      setSelectedOptions('');
      updateAllTaskFeatures(task.field, task.name, '');
    }
    onTaskChange(task.name, selectAll);
  }
}, [selectAll]);


  useEffect(() => {
    setTaskFeatures(task.features);
    setSelectedOptions(task.features);
    setIsChecked(task.isChecked);
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
        maskClosable={false}
      >
        <h1>{task.field}</h1>
        <h2>{task.name}</h2>
        <p>Checkbox is {isChecked ? "checked" : "unchecked"}</p>
        {Object.keys(taskFeatures).map((feature) => (
          <Row key={feature} style={{ marginBottom: '10px' }}>
            <Col span={16}>
              <span>{featureMapping[feature]}: {taskFeatures[feature]}</span>
            </Col>
            <Col span={8}>
              <Slider
                min={0}
                max={5}
                step={0.005}
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
