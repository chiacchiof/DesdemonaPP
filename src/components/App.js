import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Input, Collapse, Select, Button, Modal, Form } from "antd";
import { message as antMessage } from 'antd';
import { SaveOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import styled from 'styled-components';  // Aggiungi questo import
import ActivityList from "./ActivityList";
import ActionButton from "./ActionButton";
import MyNavBar from "./MyNavBar";
import Operators from "./Operators";
import ResultPopup from "./ResultPopup"; // Import ResultPopup component
import { BsRocketTakeoff } from "react-icons/bs";
import apiUrl from '../config';  // Import the API URL from config.js
import { auth, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

// Aggiungi questi componenti styled
const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
`;

const UserBadge = styled.span`
  background-color:rgba(24, 255, 124, 0.73);
  color: white;
  padding: 0;
  border-radius: 50%;
  margin-left: 8px;
  font-size: 12px;
  font-weight: bold;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
`;

const App = () => {
  const [input, setInput] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [activities, setActivities] = useState({});
  const [checkedActivities, setCheckedActivities] = useState({});
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [resultMessage, setResultMessage] = useState("");
  const [resultPopupVisible, setResultPopupVisible] = useState(false); // State to control ResultPopup visibility
  const [tasks, setTasks] = useState({}); // State to hold the tasks replica
  const [allTaskFeatures, setAllTaskFeatures] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();
  const [actionType, setActionType] = useState("");
  const [config, setConfig] = useState(null); // Stato per memorizzare la configurazione caricata
  const [user, setUser] = useState(null);
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [authForm] = Form.useForm();
  const [fileInput] = useState(React.createRef());
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Listener per l'autenticazione
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      loadConfig(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (config) {
      // Forza un reset completo degli stati quando cambia la configurazione
      const firstField = Object.keys(config.maintenanceActivities)[0];
      
      // Reset completo di tutti gli stati in un'unica volta
      Promise.all([
        setSelectedField(firstField),
        setActivities(config.maintenanceActivities[firstField]),
        setTasks(config.tasks),
        setCheckedActivities({}),
        setAllTaskFeatures({}),
        setSelectedOperators([])
      ]).then(() => {
        // Forza un re-render
        setActivities(prev => ({...prev}));
      });
    }
  }, [config]);

  const loadConfig = async (user) => {
    try {
      if (user) {
        // Se l'utente è autenticato, carica la configurazione da Firebase
        const docRef = doc(db, 'userConfigs', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setConfig(userData.config);
          return;
        }
        
        // Se l'utente è nuovo e non ha una configurazione in Firebase,
        // carica quella di default dal server e salvala in Firebase
        const response = await fetch(`${apiUrl}/config`);
        if (!response.ok) throw new Error('Failed to fetch config from server');
        const defaultConfig = await response.json();
        
        await setDoc(doc(db, 'userConfigs', user.uid), {
          config: defaultConfig,
          email: user.email,
          createdAt: new Date().toISOString()
        });
        
        setConfig(defaultConfig);
        return;
      }
      
      // Se l'utente non è autenticato, carica la configurazione dal server
      const response = await fetch(`${apiUrl}/config`);
      if (!response.ok) throw new Error('Failed to fetch config from server');
      const configData = await response.json();
      setConfig(configData);
    } catch (error) {
      console.error("Error loading config:", error);
      antMessage.error("Error loading configuration");
      
      // Fallback con configurazione minima in caso di errore
      const minimalConfig = {
        maintenanceActivities: {},
        tasks: {},
        ACTIVITY_DEFINITIONS: {},
        taskNameToKey: {},
        featureMapping: {},
        operators: []
      };
      setConfig(minimalConfig);
    }
  };

  const handleSignUp = async (values) => {
    try {
      const { email, password } = values;
      // Creiamo l'utente
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Ottieni il token ID
      const token = await userCredential.user.getIdToken();
      console.log('Auth Token:', token); // Per debug

      // Otteniamo la configurazione di default dal server
      const response = await fetch(`${apiUrl}/config`);
      const defaultConfig = await response.json();
      
      // Creiamo il documento dell'utente nel Firestore
      await setDoc(doc(db, 'userConfigs', userCredential.user.uid), {
        config: defaultConfig,
        email: email,
        createdAt: new Date().toISOString()
      });

      setIsSignUpModalVisible(false);
      authForm.resetFields();
      antMessage.success('Account created successfully!');
      
      // Impostiamo la configurazione
      setConfig(defaultConfig);
    } catch (error) {
      console.error("SignUp error:", error);
      antMessage.error(error.message || 'Error during sign up');
      
      // Se c'è stato un errore dopo la creazione dell'utente, proviamo a ripulire
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteError) {
          console.error("Error cleaning up after failed signup:", deleteError);
        }
      }
      // Ottieni il token ID
    const token = await userCredential.user.getIdToken();
    console.log('Auth Token:', token); // Per debug
    }
  };

  const handleSignIn = async (values) => {
    try {
      const { email, password } = values;
      await signInWithEmailAndPassword(auth, email, password);
      // Ottieni il token ID
      const token = await auth.currentUser.getIdToken();
      console.log('Auth Token:', token); // Per debug
    
      

      // Dopo il login, carichiamo la configurazione da Firebase
      const docRef = doc(db, 'userConfigs', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Aggiorniamo lo stato in modo sincrono
        setConfig(userData.config);
        setSelectedField(Object.keys(userData.config.maintenanceActivities)[0]);
        setActivities(userData.config.maintenanceActivities[Object.keys(userData.config.maintenanceActivities)[0]]);
        setTasks(userData.config.tasks);
        setCheckedActivities({});
        setAllTaskFeatures({});
        setSelectedOperators([]);
        
        // Forza il re-render dell'intero componente
        setRenderKey(prev => prev + 1);
      }
      
      setIsSignInModalVisible(false);
      authForm.resetFields();
      antMessage.success('Signed in successfully');
    } catch (error) {
      antMessage.error(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      
      // Pulisci eventuali token salvati localmente
      localStorage.removeItem('authToken');
      // Dopo il logout, carichiamo la configurazione dal server
      const response = await fetch(`${apiUrl}/config`);
      if (!response.ok) throw new Error('Failed to fetch config from server');
      const serverConfig = await response.json();
      
      // Aggiorniamo lo stato in modo sincrono
      setConfig(serverConfig);
      setSelectedField(Object.keys(serverConfig.maintenanceActivities)[0]);
      setActivities(serverConfig.maintenanceActivities[Object.keys(serverConfig.maintenanceActivities)[0]]);
      setTasks(serverConfig.tasks);
      setCheckedActivities({});
      setAllTaskFeatures({});
      setSelectedOperators([]);
      
      // Forza il re-render dell'intero componente
      setRenderKey(prev => prev + 1);
      
      antMessage.success('Signed out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
      antMessage.error(error.message);
    }
  };

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


  const rankOperatorSelectionFacchini = async () => {
    try {
      const response = await fetch(`${apiUrl}/rankOperatorSelectionFacchini`, {  // Use the API URL from config.js
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, allTaskFeatures, selectedOperators }),
      });
      const data = await response.json();
      setResultMessage(data.message);
      setResultPopupVisible(true); // Show the ResultPopup with the message
    } catch (error) {
      console.error("Error:", error);
    }

  };

  const rankOperatorSelection = async () => {
    console.log("checkedActivities...........");
    console.log(checkedActivities);
    console.log(allTaskFeatures);

    try {
      const response = await fetch(`${apiUrl}/rankOperatorSelection`, {  // Use the API URL from config.js
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, allTaskFeatures, selectedOperators }),
      });
      const data = await response.json();
      setResultMessage(data.message);
      setResultPopupVisible(true); // Show the ResultPopup with the message
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const callYourFunction = async () => {
    try {
      const response = await fetch(`${apiUrl}/yourFunctionFromMyClass`);  // Use the API URL from config.js
      const data = await response.json();
      setResultMessage(data.message);
      setResultPopupVisible(true); // Show the ResultPopup with the message
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const runSimulation = async (values) => {
    try {
      const response = await fetch(`${apiUrl}/simulation`, {
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
          .map((result) => result.optimalOperatorsMessage)
          .join("\n\n");

        setResultMessage(msg);
        setResultPopupVisible(true);
      } else {
        console.error("Unexpected response format:", data);
        setResultMessage(
          "Unexpected response format. Please check the server response."
        );
        setResultPopupVisible(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setResultMessage("An error occurred while processing your request.");
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
    if (config && config.maintenanceActivities) {
      setSelectedField(value);
      // Forza l'aggiornamento delle attività
      const newActivities = config.maintenanceActivities[value];
      setActivities(newActivities);
      // Reset degli stati correlati
      setCheckedActivities({});
      setAllTaskFeatures({});
    }
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

  const handleConfigUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) {
      antMessage.error('Please login first and select a file');
      event.target.value = '';
      return;
    }

    try {
      const fileContent = await file.text();
      let newConfig;

      try {
        newConfig = JSON.parse(fileContent);
        
        if (!newConfig.maintenanceActivities || 
            !newConfig.tasks || 
            !newConfig.ACTIVITY_DEFINITIONS || 
            !newConfig.operators) {
          throw new Error('Invalid config structure');
        }
      } catch (parseError) {
        antMessage.error('Invalid config file format');
        event.target.value = '';
        return;
      }

      // Aggiorniamo Firebase
      await setDoc(doc(db, 'userConfigs', user.uid), {
        config: newConfig,
        email: user.email,
        updatedAt: new Date().toISOString()
      });

      // Aggiorniamo lo stato in modo sincrono
      setConfig(newConfig);
      setSelectedField(Object.keys(newConfig.maintenanceActivities)[0]);
      setActivities(newConfig.maintenanceActivities[Object.keys(newConfig.maintenanceActivities)[0]]);
      setTasks(newConfig.tasks);
      setCheckedActivities({});
      setAllTaskFeatures({});
      setSelectedOperators([]);
      
      // Forza il re-render dell'intero componente
      setRenderKey(prev => prev + 1);

      antMessage.success('Configuration updated successfully');
      
    } catch (error) {
      console.error('Error uploading config:', error);
      antMessage.error('Failed to update configuration');
    }

    event.target.value = '';
  };

  const handleDownloadConfig = async () => {
    try {
      let configToDownload;

      if (user) {
        // Se l'utente è autenticato, prendi la configurazione da Firebase
        const docRef = doc(db, 'userConfigs', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          configToDownload = docSnap.data().config;
        } else {
          throw new Error('User configuration not found');
        }
      } else {
        // Se l'utente non è autenticato, prendi la configurazione dal server
        const response = await fetch(`${apiUrl}/config`);
        if (!response.ok) throw new Error('Failed to fetch config from server');
        configToDownload = await response.json();
      }

      // Crea e scarica il file
      const blob = new Blob([JSON.stringify(configToDownload, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = user ? `config_${user.email}.json` : 'config.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      antMessage.success('Configuration downloaded successfully');
    } catch (error) {
      console.error('Error downloading configuration:', error);
      antMessage.error('Failed to download configuration');
    }
  };

  if (!config) {
    return <div>Loading configuration...</div>;
  }

  return (
    <Layout key={renderKey}>
      <MyNavBar
        userInfo={user && (
          <UserSection>
            <span style={{ color: 'white' }}>{user.email}</span>
            <UserBadge>
              {user.email.substring(0, 2).toUpperCase()}
            </UserBadge>
          </UserSection>
        )}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user ? (
            <>
              <input
                type="file"
                ref={fileInput}
                onChange={handleConfigUpload}
                accept=".json"
                style={{ display: 'none' }}
                id="config-upload"
              />
              <Button onClick={handleSignOut}>Sign Out</Button>
              <Button 
                icon={<UploadOutlined />}
                onClick={() => document.getElementById('config-upload').click()}
              >
                Upload Config
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsSignInModalVisible(true)}>Sign In</Button>
              <Button type="primary" onClick={() => setIsSignUpModalVisible(true)}>Sign Up</Button>
            </>
          )}
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleDownloadConfig}
          >
            Download Config
          </Button>  
        </div>
      </MyNavBar>

      {/* Modali di autenticazione */}
      <Modal
        title="Sign Up"
        open={isSignUpModalVisible}
        onCancel={() => setIsSignUpModalVisible(false)}
        footer={null}
      >
        <Form form={authForm} onFinish={handleSignUp}>
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Sign In"
        open={isSignInModalVisible}
        onCancel={() => setIsSignInModalVisible(false)}
        footer={null}
      >
        <Form form={authForm} onFinish={handleSignIn}>
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      

      <Content style={{ padding: "20px" }}>
        <Row style={{ marginBottom: "10px" }}>
        <ActionButton
            onClick={rankOperatorSelectionFacchini}
            icon={<SaveOutlined />}
            text="Run Facchini"
          />
          <ActionButton
            onClick={rankOperatorSelection}
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
          <Col span={12}>
            <Select
              value={selectedField}
              onChange={handleFieldChange}
              style={{ width: "100%" }}
            >
              {Object.keys(config.maintenanceActivities).map((field) => (
                <Option key={field} value={field}>
                {config.ACTIVITY_DEFINITIONS[field] || field}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Collapse defaultActiveKey={["1"]} style={{ marginBottom: "20px" }}>
          <Panel header={config.ACTIVITY_DEFINITIONS[selectedField] || selectedField} key="1">
            <Row gutter={[16, 16]}>
              {Object.keys(activities).map((task) => (
                <Col key={task} span={17}>
                  <ActivityList
                    title={task}
                    activities={activities[task]}
                    onActivityChange={handleActivityChange}
                    onTaskFeatureChange={handleTaskFeatureChange}
                    updateAllTaskFeatures={updateAllTaskFeatures}
                    allTaskFeatures={allTaskFeatures}
                    taskNameToKey={config.taskNameToKey}
                    featureMapping={config.featureMapping}
                    tasks={config.tasks}
                    activityTitle={config.ACTIVITY_DEFINITIONS[selectedField] || selectedField}
                    config={config}
                    user={user}
                    setConfig={setConfig}
                  />
                </Col>
              ))}
            </Row>
          </Panel>
        </Collapse>
        <Operators 
          onOperatorsChange={handleOperatorsChange} 
          operators={config.operators}
          user={user}  // Passa l'utente come prop
          setConfig={setConfig}  // Passa la funzione per aggiornare la configurazione
        />
        <ResultPopup
          visible={resultPopupVisible}
          onClose={() => setResultPopupVisible(false)}
          message={resultMessage}
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