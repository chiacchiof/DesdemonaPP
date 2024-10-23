import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Collapse, Checkbox, Tooltip, Button, Slider, Modal } from 'antd';
import { EditOutlined } from '@ant-design/icons';
// Rimuovi l'importazione locale di config
// import { operators as initialOperators } from '../config';

const { Panel } = Collapse;

const Operators = ({ onOperatorsChange, operators: initialOperators }) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [localFeatures, setLocalFeatures] = useState({});
    const [operators, setOperators] = useState(initialOperators); // Usa il prop passato
    const [selectedOperators, setSelectedOperators] = useState([]);

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

    const handleSave = () => {
        if (selectedOperator) {
            const updatedOperators = operators.map((operator) => {
                if (operator.name === selectedOperator.name) {
                    return {
                        ...operator,
                        features: localFeatures,
                    };
                }
                return operator;
            });
            setOperators(updatedOperators);

            // Update the selected operators with the updated features
            const updatedSelectedOperators = selectedOperators.map((operator) => {
                if (operator.name === selectedOperator.name) {
                    return {
                        ...operator,
                        features: localFeatures,
                    };
                }
                return operator;
            });
            setSelectedOperators(updatedSelectedOperators);

            // Recalculate selectedOperator with updated features
            setSelectedOperator((prevOperator) => ({
                ...prevOperator,
                features: localFeatures,
            }));
        }
        setPopupVisible(false);
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

    return (
        <>
            <Collapse defaultActiveKey={['1']} style={{ marginBottom: '20px' }}>
                <Panel
                    header={
                        <div onClick={handlePanelClick}>
                            <Checkbox
                                onChange={handleSelectAllChange}
                                checked={selectedOperators.length === operators.length}
                            >
                                Select All Operators
                            </Checkbox>
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
                                            <EditOutlined
                                                onClick={() => handleCardClick(operator)}
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: '10px', 
                                                    right: '10px', 
                                                    fontSize: '16px' 
                                                }}
                                            />
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
                        <Button key="cancel" onClick={handleClosePopup}>
                            Cancel
                        </Button>,
                        <Button key="save" type="primary" onClick={handleSave}>
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
                                    max={10}
                                    step={0.05}
                                    value={parseFloat(localFeatures[feature])}
                                    onChange={(value) => handleFeatureChange(feature, value.toFixed(2))}
                                />
                            </Col>
                        </Row>
                    ))}
                </Modal>
            )}
        </>
    );
};

export default Operators;
