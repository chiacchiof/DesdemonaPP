import React from 'react';
import { FaTrash } from 'react-icons/fa';
import styled from 'styled-components';

const BinIcon = styled.div`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 48px;
    color: red;
    display: ${props => (props.isDragging ? 'block' : 'none')};
    z-index: 1000;
`;

const BinArea = styled.div`
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 150px;
    display: ${props => (props.isDragging ? 'block' : 'none')};
    z-index: 1000;
`;

const Bin = ({ isDragging }) => {
    return (
        <>
            <BinIcon isDragging={isDragging}>
                <FaTrash />
            </BinIcon>
            <BinArea id="bin-area" isDragging={isDragging} />
        </>
    );
};

export default Bin;
