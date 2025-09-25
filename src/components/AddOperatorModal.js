import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Slider, Row, Col, Button, notification } from 'antd';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import apiUrl from '../config';

const AddOperatorModal = ({ visible, onCancel, onSave, features, user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [localFeatures, setLocalFeatures] = useState({});

  useEffect(() => {
    if (visible) {
      // Imposta i valori di default per le features (2.5)
      const defaultValues = {};
      features.forEach(feature => {
        defaultValues[feature] = 2.5;
      });
      
      setLocalFeatures(defaultValues);
    }
  }, [visible, features]);

  const handleFeatureChange = (feature, value) => {
    setLocalFeatures((prevFeatures) => ({
      ...prevFeatures,
      [feature]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Verifica che il nome dell'operatore sia stato inserito
      const operatorName = document.getElementById('new-operator-name').value;
      if (!operatorName || operatorName.trim() === '') {
        throw new Error('Please enter an operator name');
      }

      const newOperator = {
        name: operatorName,
        features: Object.entries(localFeatures).reduce((obj, [key, value]) => {
          obj[key] = parseFloat(value) || 0;
          return obj;
        }, {})
      };

      // GESTIONE DIVERSA BASATA SULLO STATO DI LOGIN
      if (user) {
        // UTENTE LOGGATO: Usa direttamente Firebase
        try {
          // Ottieni il documento dell'utente
          const userDocRef = doc(db, 'userConfigs', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // Verifica se il config e gli operators esistono
            if (!userData.config) userData.config = {};
            if (!Array.isArray(userData.config.operators)) userData.config.operators = [];
            
            // Verifica se esiste già un operatore con lo stesso nome
            const operatorExists = userData.config.operators.some(op => op.name === operatorName);
            if (operatorExists) {
              throw new Error(`An operator with name "${operatorName}" already exists in your configuration`);
            }
            
            // Aggiorna la configurazione con il nuovo operatore
            const updatedConfig = {
              ...userData.config,
              operators: [...userData.config.operators, newOperator]
            };
            
            // Aggiorna Firestore
            await updateDoc(userDocRef, {
              config: updatedConfig,
              updatedAt: new Date().toISOString()
            });
            
            // Notifica il successo
            notification.success({
              message: 'Operator Added',
              description: `Operator "${operatorName}" has been added to your personal configuration.`,
            });
            
            // Chiama onSave per aggiornare l'interfaccia
            onSave(newOperator);
            onCancel();
          } else {
            throw new Error('User configuration not found. Please reload the page.');
          }
        } catch (error) {
          console.error('Firebase error:', error);
          throw error;
        }
      } else {
        // UTENTE NON LOGGATO: Usa l'API del server
        const response = await fetch(`${apiUrl}/addOperator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operator: newOperator })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to add operator');
        }
        
        notification.success({
          message: 'Operator Added',
          description: data.message || `Operator "${operatorName}" has been added successfully.`,
        });
        
        onSave(newOperator);
        onCancel();
      }
    } catch (error) {
      console.error('Error adding operator:', error);
      notification.error({
        message: 'Failed to Add Operator',
        description: error.message || 'An error occurred while adding the operator.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Operator"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={handleSave}
          loading={loading}
        >
          Save
        </Button>
      ]}
      centered
    >
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>Operator Name</h2>
        <Input 
          id="new-operator-name" 
          placeholder="Enter operator name" 
          style={{ width: '100%' }}
        />
      </div>
      
      <h2>Features</h2>
      {Object.keys(localFeatures).map((feature) => (
        <Row key={feature} style={{ marginBottom: '10px' }}>
          <Col span={16}>
            <span>{feature}: {localFeatures[feature]}</span>
          </Col>
          <Col span={8}>
            <Slider
              min={0}
              max={5}
              step={0.005}
              value={parseFloat(localFeatures[feature])}
              onChange={(value) => handleFeatureChange(feature, value.toFixed(3))}
            />
          </Col>
        </Row>
      ))}
    </Modal>
  );
};

export default AddOperatorModal; 