import React from 'react';
import { Layout, Input, Avatar } from 'antd';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import DesdemonaLogo from '../../assets/DesdemonaLogo.png'; // Make sure this path is correct

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
    return (
        <Header style={{ display: 'flex', alignItems: 'center', background: 'rgb(39, 58, 70)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={DesdemonaLogo} alt="Desdemona Logo" style={{ height: '50px', marginRight: '20px' }} />
            </div>
            <Search
                placeholder="Search"
                style={{ maxWidth: '400px', marginRight: 'auto' }}
            />
            <SettingOutlined style={{ fontSize: '24px', color: '#fff', marginRight: '20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ marginRight: '10px', color: '#fff' }}>Ferdinando Chiacchio</span>
                <Avatar style={{ backgroundColor: '#87d068' }}>FC</Avatar>
            </div>
        </Header>
    );
};

export default Navbar;
