// import React, { useState } from 'react';
// import { Outlet, Link, useNavigate } from 'react-router-dom';
// import { Layout, Menu, Button, Dropdown, Avatar, Space, theme } from 'antd';
// import {
//     UserOutlined,
//     LogoutOutlined,
//     HomeOutlined,
//     CalendarOutlined,
//     DesktopOutlined,
//     TeamOutlined,
//     FileTextOutlined,
//     BellOutlined,
//     ToolOutlined,
//     SolutionOutlined,
//     FileDoneOutlined,
//     FileAddOutlined,
// } from '@ant-design/icons';
// import { useAuth } from '../hooks/useAuth';
// import './MainLayout.css';
//
// const { Header, Content, Sider } = Layout;
//
// // Hàm để map vai trò từ DB sang vai trò code
// const mapDbRoleToCode = (dbRole) => {
//     const mapping = {
//         'Nhân viên phòng Giáo Vụ': 'GVU',
//         'Nhân viên phòng Cơ sở vật chất': 'CSVC',
//         'Giảng Viên': 'GV',
//         'Trưởng khoa': 'TK'
//     };
//     return mapping[dbRole] || null;
// }
//
// // Định nghĩa menu cho từng vai trò
// const roleMenus = {
//     GVU: [
//         { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
//         { key: '/calendar-management', icon: <CalendarOutlined />, label: <Link to="/calendar-management">Quản lý Lịch</Link> },
//         { key: '/credit-class-management', icon: <SolutionOutlined />, label: <Link to="/credit-class-management">Quản lý Lớp tín chỉ</Link> },
//         { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
//         // { key: '/user-management', icon: <TeamOutlined />, label: <Link to="/user-management">Quản lý Người dùng</Link> },
//     ],
//     CSVC: [
//         { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
//         { key: '/room-management', icon: <DesktopOutlined />, label: <Link to="/room-management">Quản lý Phòng máy</Link> },
//         { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
//         { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Xem Lịch</Link> },
//     ],
//     GV: [
//         { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
//         { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Lịch thực hành</Link> },
//         { key: '/my-requests', icon: <FileAddOutlined />, label: <Link to="/my-requests">Yêu cầu của tôi</Link> },
//         { key: '/notifications', icon: <BellOutlined />, label: <Link to="/notifications">Thông báo</Link> },
//     ],
//     TK: [
//         { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
//         { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
//         { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Xem Lịch</Link> },
//     ],
// };
//
//
// const MainLayout = () => {
//     const {
//         token: { colorBgContainer, borderRadiusLG },
//     } = theme.useToken();
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();
//     const [collapsed, setCollapsed] = useState(false);
//
//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };
//
//     const userMenu = (
//         <Menu>
//             <Menu.Item key="profile" icon={<UserOutlined />}>
//                 <Link to="/profile">Hồ sơ</Link>
//             </Menu.Item>
//             <Menu.Divider />
//             <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
//                 Đăng xuất
//             </Menu.Item>
//         </Menu>
//     );
//
//     const userRole = user ? mapDbRoleToCode(user.role) : null;
//     const menuItems = userRole ? roleMenus[userRole] : [];
//
//     return (
//         <Layout style={{ minHeight: '100vh' }}>
//             <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
//                 <div className="logo-vertical">
//                     {collapsed ? 'P' : 'PTIT'}
//                 </div>
//                 <Menu theme="dark" defaultSelectedKeys={['/dashboard']} mode="inline" items={menuItems} />
//             </Sider>
//             <Layout>
//                 <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
//                     <Dropdown overlay={userMenu} trigger={['click']}>
//                         <a onClick={(e) => e.preventDefault()}>
//                             <Space>
//                                 <Avatar icon={<UserOutlined />} />
//                                 <span>{user ? user.userName : 'User'}</span>
//                             </Space>
//                         </a>
//                     </Dropdown>
//                 </Header>
//                 <Content style={{ margin: '16px' }}>
//                     <div
//                         style={{
//                             padding: 24,
//                             minHeight: 360,
//                             background: colorBgContainer,
//                             borderRadius: borderRadiusLG,
//                         }}
//                     >
//                         <Outlet />
//                     </div>
//                 </Content>
//             </Layout>
//         </Layout>
//     );
// };
// export default MainLayout;




import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space, theme } from 'antd';
import { BarChartOutlined } from '@ant-design/icons'; // Thêm icon báo cáo

import {
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
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import './MainLayout.css';

const { Header, Content, Sider } = Layout;

const mapDbRoleToCode = (dbRole) => {
    const mapping = {
        'Nhân viên phòng Giáo Vụ': 'GVU',
        'Nhân viên phòng Cơ sở vật chất': 'CSVC',
        'Giảng Viên': 'GV',
        'Trưởng khoa': 'TK'
    };
    return mapping[dbRole] || null;
}

// =======================================================
//     CẬP NHẬT CHÍNH Ở ĐÂY
// =======================================================
const roleMenus = {
    GVU: [
        { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
        { key: '/calendar-management', icon: <ToolOutlined />, label: <Link to="/calendar-management">Quản lý Lịch</Link> },
        { key: '/credit-class-management', icon: <SolutionOutlined />, label: <Link to="/credit-class-management">Quản lý Lớp tín chỉ</Link> },
        { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
        { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Xem Lịch Biểu</Link> }, // <<<--- THÊM VÀO
        // { key: '/user-management', icon: <TeamOutlined />, label: <Link to="/user-management">Quản lý Người dùng</Link> },
        { key: '/reports/calendar', icon: <BarChartOutlined />, label: <Link to="/reports/calendar">Báo cáo Lịch</Link> },
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
    ],
    TK: [
        { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Bảng điều khiển</Link> },
        { key: '/request-management', icon: <FileDoneOutlined />, label: <Link to="/request-management">Quản lý Yêu cầu</Link> },
        { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Xem Lịch Biểu</Link> },
        { key: '/reports/calendar', icon: <BarChartOutlined />, label: <Link to="/reports/calendar">Báo cáo Lịch</Link> },
    ],
};


const MainLayout = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Thêm hook này để lấy path hiện tại
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/profile">Hồ sơ</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    const userRole = user ? mapDbRoleToCode(user.role) : null;
    const menuItems = userRole ? roleMenus[userRole] : [];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="logo-vertical">
                    {collapsed ? 'P' : 'PTIT'}
                </div>
                {/* Thêm selectedKeys để menu item được highlight đúng */}
                <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" items={menuItems} />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Dropdown overlay={userMenu} trigger={['click']}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                <Avatar icon={<UserOutlined />} />
                                <span>{user ? user.userName : 'User'}</span>
                            </Space>
                        </a>
                    </Dropdown>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};
export default MainLayout;