import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Input, Collapse, Select, Button, Modal, Form } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import ActivityList from "./ActivityList";
import ActionButton from "./ActionButton";
import MyNavBar from "./MyNavBar";
import Operators from "./Operators";
import ResultPopup from "./ResultPopup"; // Import ResultPopup component
import { BsRocketTakeoff } from "react-icons/bs";
import apiUrl from '../config';  // Import the API URL from config.js

const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

const App = () => {
  const [input, setInput] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [activities, setActivities] = useState({});
  const [checkedActivities, setCheckedActivities] = useState({});
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [message, setMessage] = useState("");
  const [resultPopupVisible, setResultPopupVisible] = useState(false); // State to control ResultPopup visibility
  const [tasks, setTasks] = useState({}); // State to hold the tasks replica
  const [allTaskFeatures, setAllTaskFeatures] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();
  const [actionType, setActionType] = useState("");
  const [config, setConfig] = useState(null); // Stato per memorizzare la configurazione caricata

  useEffect(() => {
    // Load the configuration from the server
    const loadConfig = async () => {
      try {
        const response = await fetch(`${apiUrl}/config`);  // Use the API URL from config.js
        const configData = await response.json();
        console.log(configData);
        setConfig(configData);
        const { maintenanceActivities, tasks } = configData;
        setSelectedField(Object.keys(maintenanceActivities)[0]);
        setActivities(maintenanceActivities[Object.keys(maintenanceActivities)[0]]);
        setTasks(tasks);

      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    loadConfig();
  }, []);

  const updateAllTaskFeatures = (activity, task, options) => {
    setAllTaskFeatures((prev) => {
      const newTaskFeatures = { ...prev };
      if (!newTaskFeatures[activity]) {
        newTaskFeatures[activity] = {};
      }
      if (options === "") {
        delete newTaskFeatures[activity][task];
        if (Object.keys(newTaskFeatures[activity]).length === 0) delete newTaskFeatures[activity];
      } else {
        newTaskFeatures[activity][task] = options;
      }
      return newTaskFeatures;
    });
  };

  const onOperatorsChange = (updatedOperators) => {
    console.log("Updated Operators:", updatedOperators);
  };

  const callMyFunction = async () => {
    console.log("checkedActivities...........");
    console.log(checkedActivities);
    console.log(allTaskFeatures);

    try {
      const response = await fetch(`${apiUrl}/myFunction`, {  // Use the API URL from config.js
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, allTaskFeatures, selectedOperators }),
      });
      const data = await response.json();
      setMessage(data.message);
      setResultPopupVisible(true); // Show the ResultPopup with the message
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const callYourFunction = async () => {
    try {
      const response = await fetch(`${apiUrl}/yourFunctionFromMyClass`);  // Use the API URL from config.js
      const data = await response.json();
      setMessage(data.message);
      setResultPopupVisible(true); // Show the ResultPopup with the message
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const runSimulation = async (values) => {
    try {
      const response = await fetch(`${apiUrl}/simulation`, {  // Use the API URL from config.js
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      console.log("Response Data:", data);

      if (data.message && Array.isArray(data.message)) {
        const msg = data.message
          .map((result) => {
            const resultMessage  = result.optimalOperatorsMessage;

            return `
              <div>
                ${resultMessage}
              </div>
            `;
          })
          .join("");

        setMessage(msg);
        setResultPopupVisible(true);
      } else {
        console.error("Unexpected response format:", data);
        setMessage(
          "Unexpected response format. Please check the server response."
        );
        setResultPopupVisible(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while processing your request.");
      setResultPopupVisible(true);
    }
  };

  const downloadSimulationResults = async (values) => {
    try {
      const response = await fetch(`${apiUrl}/download-simulation-results`, {  // Use the API URL from config.js
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'simulation_results.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const handleActivityChange = (category, activity, isChecked) => {
    setCheckedActivities((prev) => {
      const updatedCategory = prev[category] || [];
      if (isChecked) {
        return { ...prev, [category]: [...updatedCategory, activity] };
      } else {
        return {
          ...prev,
          [category]: updatedCategory.filter((item) => item !== activity),
        };
      }
    });
  };

  const handleFieldChange = (value) => {
    setSelectedField(value);
    setActivities(config.maintenanceActivities[value]);
    setCheckedActivities({});
    setAllTaskFeatures({});
  };

  const handleOperatorsChange = (selected) => {
    setSelectedOperators(selected);
  };

  const handleTaskFeatureChange = (task, feature, value) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [task]: {
        ...prevTasks[task],
        [feature]: value,
      },
    }));
  };

  const handleShowTaskFeatures = () => {
    alert(JSON.stringify(allTaskFeatures, null, 2));
  };

  const showModal = (action) => {
    setActionType(action);
    setModalVisible(true);
    form.setFieldsValue({
      numMaintenanceActivities: 2,
      numActivities: 2,
      numTasks: 2,
      numOperators: 2,
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (actionType === "simulation") {
        await runSimulation(values);
      } else if (actionType === "simulationResults") {
        await downloadSimulationResults(values);
      }
      setModalLoading(false);
      setModalVisible(false);
    } catch (error) {
      console.error("Validation failed:", error);
      setModalLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  if (!config) {
    return <div>Loading configuration...</div>;
  }

  return (
    <Layout>
      <MyNavBar/>
      <Content style={{ padding: "20px" }}>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your name"
          style={{ marginBottom: "10px" }}
        />
        <Row style={{ marginBottom: "10px" }}>
          <ActionButton
            onClick={callMyFunction}
            icon={<SaveOutlined />}
            text="Run Scenario"
          />
          <ActionButton
            onClick={() => showModal("simulation")}
            icon={<BsRocketTakeoff />}
            text="Simulation"
          />
          <Button
            onClick={() => showModal("simulationResults")}
            icon={<BsRocketTakeoff />}
            type="primary"
          >
            Simulation & Results
          </Button>
        </Row>
        <Row style={{ marginBottom: "10px" }}>
          <Col span={8}>
            <Select
              value={selectedField}
              onChange={handleFieldChange}
              style={{ width: "100%" }}
            >
              {Object.keys(config.maintenanceActivities).map((field) => (
                <Option key={field} value={field}>
                  {field}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Collapse defaultActiveKey={["1"]} style={{ marginBottom: "20px" }}>
          <Panel header="Activities" key="1">
            <Row gutter={[16, 16]}>
              {Object.keys(activities).map((task) => (
                <Col key={task} span={5}>
                  <ActivityList
                    title={task}
                    activities={activities[task]}
                    onActivityChange={handleActivityChange}
                    onTaskFeatureChange={handleTaskFeatureChange} // Pass the feature change handler
                    updateAllTaskFeatures={updateAllTaskFeatures}
                    allTaskFeatures={allTaskFeatures}
                    taskNameToKey={config.taskNameToKey}
                    featureMapping = {config.featureMapping}
                    tasks={config.tasks} // Pass the tasks state
                  />
                </Col>
              ))}
            </Row>
          </Panel>
        </Collapse>
        <Operators 
          onOperatorsChange={handleOperatorsChange} 
          operators={config.operators} // Pass operators as a prop
        />
        <ResultPopup
          visible={resultPopupVisible}
          onClose={() => setResultPopupVisible(false)}
          message={message}
        />
        <Modal
          title="Simulation Parameters"
          visible={modalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={modalLoading}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="numMaintenanceActivities"
              label="Number of Maintenance Activities"
              rules={[{ required: true, message: 'Please input the number of maintenance activities!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="numActivities"
              label="Number of Activities"
              rules={[{ required: true, message: 'Please input the number of activities!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="numTasks"
              label="Number of Tasks"
              rules={[{ required: true, message: 'Please input the number of tasks!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="numOperators"
              label="Number of Operators"
              rules={[{ required: true, message: 'Please input the number of operators!' }]}
            >
              <Input type="number" />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default App;
