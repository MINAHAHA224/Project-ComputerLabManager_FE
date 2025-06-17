// src/pages/Dashboard/Dashboard.jsx

import React from 'react';
import { Typography, Card } from 'antd';
import { useAuth } from '../../hooks/useAuth';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
    const { user } = useAuth();
    return (
        <Card>
            <Title level={2}>Chào mừng trở lại, {user?.userName || 'User'}!</Title>
            <Paragraph>
                Bạn đã đăng nhập với vai trò: <strong>{user?.role || 'Chưa xác định'}</strong>.
            </Paragraph>
            <Paragraph>
                Đây là trang Bảng điều khiển. Các chức năng chính của bạn nằm ở menu bên trái.
            </Paragraph>
        </Card>
    );
};

export default Dashboard;