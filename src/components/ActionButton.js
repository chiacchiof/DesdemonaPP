import React from 'react';
import { Button } from 'antd';

const ActionButton = ({ icon, onClick, text }) => {
    return (
        <Button onClick={onClick} type="primary" icon={icon} style={{ marginRight: '10px' }}>
            {text}
        </Button>
    );
};

export default ActionButton;
