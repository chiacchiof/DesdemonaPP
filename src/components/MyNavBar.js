import React from 'react';
import { Layout } from 'antd';
import DesdemonaLogo from '../../assets/DesdemonaLogo.png';
import styled from 'styled-components';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  padding: 0 20px;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const AuthSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Navbar = ({ children, userInfo }) => {
    return (
        <StyledHeader style={{ background: 'rgb(39, 58, 70)', color: '#fff' }}>
            <LogoSection>
                <img 
                    src={DesdemonaLogo} 
                    alt="Desdemona Logo" 
                    style={{ height: '50px' }} 
                />
                {userInfo}
            </LogoSection>
            <AuthSection>
                {children}
            </AuthSection>
        </StyledHeader>
    );
};

export default Navbar;
