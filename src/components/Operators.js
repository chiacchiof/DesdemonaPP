import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Collapse, Checkbox, Tooltip, Button, Slider, Modal, notification } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import apiUrl from '../config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import AddOperatorModal from './AddOperatorModal';

const { Panel } = Collapse;

const Operators = ({ onOperatorsChange, operators: initialOperators, user, setConfig }) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [localFeatures, setLocalFeatures] = useState({});
    const [operators, setOperators] = useState(initialOperators); // Usa il prop passato
    const [selectedOperators, setSelectedOperators] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const { confirm } = Modal;

    useEffect(() => {
        onOperatorsChange(selectedOperators); // Notify parent component
    }, [selectedOperators, onOperatorsChange]);

    const handleCardClick = (operator) => {
        setSelectedOperator(operator);
        setLocalFeatures(operator.features);
        setPopupVisible(true);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
        setSelectedOperator(null);
    };

    const handleFeatureChange = (feature, value) => {
        setLocalFeatures((prevFeatures) => ({
            ...prevFeatures,
            [feature]: value,
        }));
    };

    const handleSave = async () => {
        if (selectedOperator) {
            setIsUpdating(true);
            try {
                const featureUpdates = Object.entries(localFeatures).map(([featureName, newValue]) => ({
                    featureName,
                    newValue: parseFloat(newValue)
                }));

                let updatedOperator;

                if (user) {
                    // Se l'utente è autenticato, aggiorna su Firebase
                    const docRef = doc(db, 'userConfigs', user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const currentConfig = userData.config;
                        
                        // Aggiorna l'operatore nella configurazione
                        const updatedOperators = currentConfig.operators.map(op => {
                            if (op.name === selectedOperator.name) {
                                return {
                                    ...op,
                                    features: localFeatures
                                };
                            }
                            return op;
                        });
                        
                        // Aggiorna la configurazione completa
                        const newConfig = {
                            ...currentConfig,
                            operators: updatedOperators
                        };
                        
                        // Salva su Firebase
                        await updateDoc(docRef, {
                            config: newConfig,
                            updatedAt: new Date().toISOString()
                        });

                        // Aggiorna lo stato locale
                        setConfig(newConfig);
                        updatedOperator = {
                            ...selectedOperator,
                            features: localFeatures
                        };
                    }
                } else {
                    // Se l'utente non è autenticato, usa l'API del server
                    const response = await fetch(`${apiUrl}/modifyOperatorFeatures/bulk`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            operatorName: selectedOperator.name,
                            features: featureUpdates
                        })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        throw new Error(data.error || 'Failed to update operator features');
                    }
                    updatedOperator = data.updatedOperator;
                }

                // Aggiorna gli stati locali
                const updatedOperators = operators.map((operator) => {
                    if (operator.name === selectedOperator.name) {
                        return updatedOperator;
                    }
                    return operator;
                });
                setOperators(updatedOperators);

                const updatedSelectedOperators = selectedOperators.map((operator) => {
                    if (operator.name === selectedOperator.name) {
                        return updatedOperator;
                    }
                    return operator;
                });
                setSelectedOperators(updatedSelectedOperators);

                notification.success({
                    message: 'Features Updated Successfully',
                    description: user ? 
                        'Operator features updated in your configuration' : 
                        'Operator features updated in server configuration',
                    placement: 'topRight',
                    duration: 3
                });

            } catch (error) {
                notification.error({
                    message: 'Update Failed',
                    description: error.message || 'Failed to update operator features',
                    placement: 'topRight',
                    duration: 4
                });
            } finally {
                setIsUpdating(false);
                setPopupVisible(false);
            }
        }
    };

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            setSelectedOperators(operators);
        } else {
            setSelectedOperators([]);
        }
    };

    const handleOperatorChange = (operator, checked) => {
        setSelectedOperators((prevSelected) => {
            if (checked) {
                return [...prevSelected, operator];
            } else {
                return prevSelected.filter((op) => op.name !== operator.name);
            }
        });
    };

    const calculateAverage = (features) => {
        const total = Object.values(features).reduce((acc, value) => acc + parseFloat(value), 0);
        return (total / Object.values(features).length).toFixed(2);
    };

    const handlePanelClick = (event) => {
        event.stopPropagation();
    };

    const handleAddOperator = async (newOperator) => {
        try {
            if (user) {
                // Se l'utente è autenticato, la logica è già gestita in AddOperatorModal
                // Aggiorniamo solo lo stato locale
                setOperators(prev => [...prev, newOperator]);
                setIsAddModalVisible(false);
            } else {
                // Per utenti non autenticati, aggiorniamo lo stato locale dopo che l'API ha avuto successo
                setOperators(prev => [...prev, newOperator]);
                setIsAddModalVisible(false);
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to add operator',
                placement: 'topRight',
                duration: 4
            });
        }
    };

    const showDeleteConfirm = (operator) => {
        confirm({
            title: `Are you sure you want to delete ${operator.name}?`,
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes, delete',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                return handleDeleteOperator(operator);
            },
        });
    };

    const handleDeleteOperator = async (operator) => {
        try {
            if (user) {
                // Utente loggato: Usa Firebase direttamente
                const userDocRef = doc(db, 'userConfigs', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    
                    // Filtra l'operatore da eliminare
                    const updatedOperators = userData.config.operators.filter(
                        op => op.name !== operator.name
                    );
                    
                    // Aggiorna la configurazione
                    const updatedConfig = {
                        ...userData.config,
                        operators: updatedOperators
                    };
                    
                    // Salva su Firebase
                    await updateDoc(userDocRef, {
                        config: updatedConfig,
                        updatedAt: new Date().toISOString()
                    });
                    
                    // Aggiorna lo stato locale
                    setOperators(updatedOperators);
                    
                    notification.success({
                        message: 'Operator Deleted',
                        description: `Operator "${operator.name}" has been removed from your configuration.`
                    });
                }
            } else {
                // Utente non loggato: Usa l'API
                const response = await fetch(`${apiUrl}/deleteOperator`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ operatorName: operator.name })
                });
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Failed to delete operator');
                }
                
                // Aggiorna lo stato locale
                setOperators(operators.filter(op => op.name !== operator.name));
                
                notification.success({
                    message: 'Operator Deleted',
                    description: data.message || `Operator "${operator.name}" has been deleted successfully.`
                });
            }
        } catch (error) {
            console.error('Error deleting operator:', error);
            notification.error({
                message: 'Failed to Delete',
                description: error.message || 'An error occurred while deleting the operator.'
            });
        }
    };

    return (
        <>
            <Collapse defaultActiveKey={['1']} style={{ marginBottom: '20px' }}>
                <Panel
                    header={
                        <div onClick={handlePanelClick}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Checkbox
                                    onChange={handleSelectAllChange}
                                    checked={selectedOperators.length === operators.length}
                                >
                                    Select All Operators
                                </Checkbox>
                                <Tooltip title="Add new operator">
                                    <Button 
                                        type="primary" 
                                        shape="circle" 
                                        icon={<PlusOutlined />} 
                                        size="small" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAddModalVisible(true);
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    }
                    key="1"
                >
                    <Row gutter={[16, 16]}>
                        {operators.map((operator, index) => (
                            <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Tooltip title={`${operator.name} - Avg: ${calculateAverage(operator.features)}`}>
                                    <Card
                                        bordered={true}
                                        style={{
                                            height: '150px',
                                            fontSize: '14px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div style={{ padding: '10px 0' }}>
                                                <Checkbox
                                                    onChange={(e) => {
                                                        handleOperatorChange(operator, e.target.checked);
                                                        e.stopPropagation();
                                                    }}
                                                    checked={selectedOperators.some((op) => op.name === operator.name)}
                                                >
                                                    {operator.name}
                                                </Checkbox>
                                            </div>
                                            <div
                                                style={{
                                                    flexGrow: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                                onClick={() => handleCardClick(operator)}
                                            >
                                                <span
                                                    style={{
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    Avg: {calculateAverage(operator.features)}
                                                </span>
                                            </div>
                                            <Tooltip title="Edit Features">
                                                <Button 
                                                    icon={<EditOutlined />} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCardClick(operator);
                                                    }}
                                                    size="small"
                                                    type="text"
                                                    style={{ 
                                                        position: 'absolute', 
                                                        top: '10px', 
                                                        right: '10px',
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Delete Operator">
                                                <Button 
                                                    icon={<DeleteOutlined />} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showDeleteConfirm(operator);
                                                    }}
                                                    size="small"
                                                    type="text"
                                                    style={{ 
                                                        position: 'absolute', 
                                                        top: '10px', 
                                                        right: '40px',
                                                        color: '#ff4d4f' // Solo l'icona sarà rossa, non il bordo
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    </Card>
                                </Tooltip>
                            </Col>
                        ))}
                    </Row>
                </Panel>
            </Collapse>
            {selectedOperator && (
                <Modal
                    open={popupVisible}
                    maskClosable={false}  // Prevent closing the modal by clicking outside of it
                    onCancel={handleClosePopup}
                    footer={[
                        <Button key="cancel" onClick={handleClosePopup} disabled={isUpdating}>
                            Cancel
                        </Button>,
                        <Button 
                            key="save" 
                            type="primary" 
                            onClick={handleSave}
                            loading={isUpdating}
                        >
                            Save
                        </Button>,
                    ]}
                    centered
                >
                    <h2>{selectedOperator.name}</h2>
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
            )}
            <AddOperatorModal 
                visible={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                onSave={handleAddOperator}
                features={operators[0]?.features ? Object.keys(operators[0].features) : []}
                user={user}
            />
        </>
    );
};

export default Operators;
