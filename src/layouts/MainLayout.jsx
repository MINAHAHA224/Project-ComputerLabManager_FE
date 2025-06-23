// src/layouts/MainLayout.jsx

import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Menu,
    Button,
    Dropdown,
    Avatar,
    Space,
    Typography,
    Badge,
    Tooltip,
    Breadcrumb
} from 'antd';
import {
    BarChartOutlined,
    UserOutlined,
    LogoutOutlined,
    HomeOutlined,
    CalendarOutlined,
    DesktopOutlined,
    TeamOutlined,
    FileTextOutlined,
    BellOutlined,
    ToolOutlined,
    SolutionOutlined,
    FileDoneOutlined,
    FileAddOutlined,
    ScheduleOutlined,
    SettingOutlined,
    SearchOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import './MainLayout.css';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const mapDbRoleToCode = (dbRole) => {
    const mapping = {
        'Nhân viên phòng Giáo Vụ': 'GVU',
        'Nhân viên phòng Cơ sở vật chất': 'CSVC',
        'Giảng Viên': 'GV',
        'Trưởng khoa': 'TK'
    };
    return mapping[dbRole] || null;
}

const getRoleDisplayName = (dbRole) => {
    const mapping = {
        'Nhân viên phòng Giáo Vụ': 'Nhân viên Giáo Vụ',
        'Nhân viên phòng Cơ sở vật chất': 'Nhân viên CSVC',
        'Giảng Viên': 'Giảng viên',
        'Trưởng khoa': 'Trưởng khoa'
    };
    return mapping[dbRole] || dbRole;
}

const getPageTitle = (pathname) => {
    const titleMapping = {
        '/dashboard': 'Bảng điều khiển',
        '/calendar-management': 'Quản lý Lịch',
        '/credit-class-management': 'Quản lý Lớp tín chỉ',
        '/request-management': 'Quản lý Yêu cầu',
        '/calendar': 'Lịch Biểu',
        '/room-management': 'Quản lý Phòng máy',
        '/my-requests': 'Yêu cầu của tôi',
        '/notifications': 'Thông báo',
        '/my-teaching-schedule': 'Lịch Giảng Dạy',
        '/teaching-schedules': 'Lịch Giảng Dạy',
        '/reports/calendar': 'Báo cáo Lịch',
        '/reports/room': 'Báo cáo Phòng máy',
        '/profile': 'Hồ sơ cá nhân'
    };
    return titleMapping[pathname] || 'Trang chủ';
}

const roleMenus = {
    GVU: [
        { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
        { key: '/calendar-management', icon: <ToolOutlined />, label: <Link to="/calendar-management">Quản lý Lịch</Link> },
        { key: '/credit-class-management', icon: <SolutionOutlined />, label: <Link to="/credit-class-management">Quản lý Lớp tín chỉ</Link> },
        { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
        { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Xem Lịch Biểu</Link> },
        { key: '/reports/calendar', icon: <BarChartOutlined />, label: <Link to="/reports/calendar">Báo cáo Lịch</Link> },
        { key: '/teaching-schedules', icon: <ScheduleOutlined />, label: <Link to="/teaching-schedules">Lịch Giảng Dạy</Link> },
    ],
    CSVC: [
        { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
        { key: '/room-management', icon: <DesktopOutlined />, label: <Link to="/room-management">Quản lý Phòng máy</Link> },
        { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
        { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Xem Lịch Biểu</Link> },
        { key: '/reports/room', icon: <BarChartOutlined />, label: <Link to="/reports/room">Báo cáo Phòng máy</Link> },
    ],
    GV: [
        { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
        { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Lịch thực hành</Link> },
        { key: '/my-requests', icon: <FileAddOutlined />, label: <Link to="/my-requests">Yêu cầu của tôi</Link> },
        { key: '/notifications', icon: <BellOutlined />, label: <Link to="/notifications">Thông báo</Link> },
        { key: '/my-teaching-schedule', icon: <ScheduleOutlined />, label: <Link to="/my-teaching-schedule">Lịch Giảng Dạy Của Tôi</Link> },
    ],
    TK: [
        { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
        { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
        { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Xem Lịch Biểu</Link> },
        { key: '/reports/calendar', icon: <BarChartOutlined />, label: <Link to="/reports/calendar">Báo cáo Lịch</Link> },
        { key: '/teaching-schedules', icon: <ScheduleOutlined />, label: <Link to="/teaching-schedules">Lịch Giảng Dạy</Link> },
    ],
};

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const avatarUrl = user && user.avatar
        ? `http://localhost:8080/avatars/${user.avatar}`
        : null;

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/profile">Hồ sơ cá nhân</Link>
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
                Cài đặt
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    const userRole = user ? mapDbRoleToCode(user.role) : null;
    const menuItems = userRole ? roleMenus[userRole] : [];
    const pageTitle = getPageTitle(location.pathname);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={280}
                collapsedWidth={80}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div className="logo-vertical slide-in">
                    {collapsed ? 'P' : 'PTIT'}
                </div>
                <Menu
                    theme="dark"
                    selectedKeys={[location.pathname]}
                    mode="inline"
                    items={menuItems}
                    className="slide-in"
                    style={{ marginTop: '8px' }}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'margin-left 0.2s' }}>
                <Header className="main-header">
                    <div className="header-left">
                        <Title className="header-title">{pageTitle}</Title>
                        <Breadcrumb className="header-breadcrumb">
                            <Breadcrumb.Item>
                                <HomeOutlined />
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>{pageTitle}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    <div className="header-right">
                        <div className="quick-actions">
                            <Tooltip title="Tìm kiếm">
                                <Button className="quick-action-btn" icon={<SearchOutlined />} />
                            </Tooltip>
                            <Tooltip title="Thông báo">
                                <Badge dot className="notification-badge">
                                    <Button className="quick-action-btn" icon={<BellOutlined />} />
                                </Badge>
                            </Tooltip>
                            <Tooltip title="Thêm">
                                <Button className="quick-action-btn" icon={<MoreOutlined />} />
                            </Tooltip>
                        </div>

                        <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                            <div className="user-dropdown">
                                <Avatar
                                    className="user-avatar"
                                    icon={<UserOutlined />}
                                    src={avatarUrl}
                                    size={40}
                                />
                                <div className="user-info">
                                    <Text className="user-name">
                                        {user ? user.userName : 'User'}
                                    </Text>
                                    <Text className="user-role">
                                        {user ? getRoleDisplayName(user.role) : 'Chưa xác định'}
                                    </Text>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="main-content">
                    <div className="content-wrapper fade-in">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;