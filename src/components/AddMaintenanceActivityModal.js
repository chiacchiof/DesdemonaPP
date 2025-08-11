import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Space, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import apiUrl from '../config';

const AddMaintenanceActivityModal = ({ visible, onCancel, onSuccess, user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [taskDefinitions, setTaskDefinitions] = useState({});
  const [activityTacom, setActivityTacom] = useState({});
  const [loadingDefinitions, setLoadingDefinitions] = useState(false);

  // Carica i task definitions e activity tacom dal server
  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        setLoadingDefinitions(true);
        
        // Carica task definitions
        const taskResponse = await fetch(`${apiUrl}/getTaskDefinitions`);
        if (!taskResponse.ok) {
          throw new Error('Failed to load task definitions');
        }
        const taskData = await taskResponse.json();
        setTaskDefinitions(taskData.data);

        // Carica activity tacom
        const tacomResponse = await fetch(`${apiUrl}/getActivityTacom`);
        if (!tacomResponse.ok) {
          throw new Error('Failed to load activity tacom');
        }
        const tacomData = await tacomResponse.json();
        setActivityTacom(tacomData.data);
      } catch (error) {
        console.error('Error loading definitions:', error);
        message.error('Failed to load definitions');
      } finally {
        setLoadingDefinitions(false);
      }
    };

    if (visible) {
      loadDefinitions();
    }
  }, [visible]);

  // Reset del componente quando la modale viene chiusa
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedTasks([]);
      setSelectedTaskType(null);
      setLoading(false);
    }
  }, [visible, form]);

  const handleAddTask = () => {
    if (!selectedTaskType) return;

    const count = selectedTasks.filter(task => task.startsWith(selectedTaskType)).length;
    const newTask = count === 0 ? selectedTaskType : `${selectedTaskType}_${count}`;
    
    setSelectedTasks([...selectedTasks, newTask]);
  };

  const handleRemoveTask = (taskToRemove) => {
    setSelectedTasks(selectedTasks.filter(task => task !== taskToRemove));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Valida il form
      const values = await form.validateFields();
      
      // Prepara i dati per la richiesta
      const requestData = {
        title: values.title,
        tacom: values.tacom,
        tasks: selectedTasks
      };

      // Verifica che tutti i campi richiesti siano presenti
      if (!requestData.title || !requestData.tacom || !requestData.tasks || requestData.tasks.length === 0) {
        message.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepara gli headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // Se l'utente è loggato, aggiungi il token
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Invia la richiesta
      console.log('Sending request to:', `${apiUrl}/addMaintenanceActivity`);
      const response = await fetch(`${apiUrl}/addMaintenanceActivity`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add activity');
      }

      if (data.success) {
        message.success('Activity added successfully');
        // Chiudi la modale
        onCancel();
        // Ricarica la pagina dopo un breve delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        message.error(data.message || 'Failed to add activity');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      message.error(error.message || 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedTasks([]);
    setSelectedTaskType(null);
    setLoading(false);
    onCancel();
  };

  return (
    <Modal
      title="Add New Maintenance Activity"
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Add Activity
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="title"
          label="Activity Title"
          rules={[
            {
              required: true,
              message: 'Please enter the activity title'
            }
          ]}
        >
          <Input placeholder="Enter activity title" />
        </Form.Item>

        <Form.Item
          name="tacom"
          label="Activity TACOM"
          rules={[
            {
              required: true,
              message: 'Please select the activity TACOM'
            }
          ]}
        >
          <Select
            placeholder="Select activity TACOM"
            loading={loadingDefinitions}
          >
            {Object.entries(activityTacom).map(([key, value]) => (
              <Select.Option key={key} value={key}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Select Task Type"
          required
        >
          <Space>
            <select
              value={selectedTaskType || ''}
              onChange={(e) => setSelectedTaskType(e.target.value)}
              style={{ width: '300px' }}
              disabled={loadingDefinitions}
            >
              <option value="">Select a task type</option>
              {Object.entries(taskDefinitions).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTask}
              disabled={!selectedTaskType || loadingDefinitions}
            >
              Add Task
            </Button>
          </Space>
        </Form.Item>

        <Form.Item
          label="Selected Tasks"
        >
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {selectedTasks.map((task, index) => {
              const baseTask = task.split('_')[0];
              const count = task.includes('_') ? task.split('_')[1] : '';
              return (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <Space>
                    <span>
                      {taskDefinitions[baseTask]}
                      {count && ` ${count}`}
                    </span>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveTask(task)}
                    />
                  </Space>
                </div>
              );
            })}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMaintenanceActivityModal; 