import styled from 'styled-components';
import { Card, Collapse } from 'antd';

export const StyledCard = styled(Card)`
    margin-bottom: 20px;
`;

export const StyledCollapse = styled(Collapse)`
    .ant-collapse-header {
        padding: 0 16px;
    }
    
    .checkbox-container {
        display: flex;
        align-items: center;
        width: 100%;
        padding-right: 10px;
    }

    .checkbox-label {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        word-wrap: break-word;
        width: calc(100% - 10px); /* Adjust padding or margin as needed */
    }
`;
