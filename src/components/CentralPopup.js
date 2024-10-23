import React from 'react';
import { Modal } from 'antd';

const CentralPopup = ({ visible, onClose, children }) => {
    return (
        <Modal
            visible={visible}
            onCancel={onClose}
            footer={null}
            centered
        >
            {children}
        </Modal>
    );
};

export default CentralPopup;
