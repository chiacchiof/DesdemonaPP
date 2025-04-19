// src/components/Popup.js
import React from 'react';
import { Modal } from 'antd';

const ResultPopup = ({ visible, onClose, message }) => {
    return (
        <Modal
            title="Operator Ranking"
            open={visible}
            onOk={onClose}
            onCancel={onClose}
            footer={null}
        >
            <p>{message}</p>
        </Modal>
    );
};

export default ResultPopup;
