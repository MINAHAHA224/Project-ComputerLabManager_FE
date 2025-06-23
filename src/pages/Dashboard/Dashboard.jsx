// src/pages/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    Avatar,
    Space,
    Tag,
    Button,
    Calendar,
    Badge,
    List,
    Timeline,
    Divider,
    Alert
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DesktopOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    TrophyOutlined,
    TeamOutlined,
    BarChartOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    EyeOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Mock data cho demo
    const statsData = {
        totalRooms: 25,
        activeRooms: 18,
        pendingRequests: 12,
        completedTasks: 145,
        monthlyUsage: 85,
        successRate: 96
    };

    const recentActivities = [
        {
            title: 'Yêu cầu sử dụng phòng Lab-301',
            description: 'Được phê duyệt',
            time: '2 phút trước',
            type: 'success',
            icon: <CheckCircleOutlined />
        },
        {
            title: 'Lập lịch thực hành môn Mạng máy tính',
            description: 'Đang chờ xử lý',
            time: '15 phút trước',
            type: 'processing',
            icon: <ClockCircleOutlined />
        },
        {
            title: 'Báo cáo sự cố phòng Lab-205',
            description: 'Cần xem xét',
            time: '1 giờ trước',
            type: 'warning',
            icon: <ExclamationCircleOutlined />
        },
        {
            title: 'Cập nhật thông tin lớp học',
            description: 'Hoàn thành',
            time: '2 giờ trước',
            type: 'success',
            icon: <CheckCircleOutlined />
        }
    ];

    const upcomingEvents = [
        {
            time: '09:00',
            title: 'Thực hành Lập trình Web',
            room: 'Lab-301',
            students: 35
        },
        {
            time: '14:00',
            title: 'Thực hành Cơ sở dữ liệu',
            room: 'Lab-302',
            students: 28
        },
        {
            time: '16:00',
            title: 'Thực hành Mạng máy tính',
            room: 'Lab-205',
            students: 32
        }
    ];

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const roleBasedContent = () => {
        switch (user?.role) {
            case 'Giảng Viên':
                return (
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Lớp học hôm nay"
                                    value={3}
                                    prefix={<CalendarOutlined style={{ color: '#dc2626' }} />}
                                    valueStyle={{ color: '#dc2626', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Sinh viên"
                                    value={95}
                                    prefix={<TeamOutlined style={{ color: '#059669' }} />}
                                    valueStyle={{ color: '#059669', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Yêu cầu đang chờ"
                                    value={2}
                                    prefix={<ClockCircleOutlined style={{ color: '#ea580c' }} />}
                                    valueStyle={{ color: '#ea580c', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Hoàn thành"
                                    value={28}
                                    prefix={<TrophyOutlined style={{ color: '#7c3aed' }} />}
                                    valueStyle={{ color: '#7c3aed', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                    </Row>
                );
            default:
                return (
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Tổng phòng máy"
                                    value={statsData.totalRooms}
                                    prefix={<DesktopOutlined style={{ color: '#dc2626' }} />}
                                    valueStyle={{ color: '#dc2626', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Đang hoạt động"
                                    value={statsData.activeRooms}
                                    prefix={<CheckCircleOutlined style={{ color: '#059669' }} />}
                                    valueStyle={{ color: '#059669', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Yêu cầu chờ duyệt"
                                    value={statsData.pendingRequests}
                                    prefix={<ClockCircleOutlined style={{ color: '#ea580c' }} />}
                                    valueStyle={{ color: '#ea580c', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="stat-card hover-card">
                                <Statistic
                                    title="Hoàn thành"
                                    value={statsData.completedTasks}
                                    prefix={<TrophyOutlined style={{ color: '#7c3aed' }} />}
                                    valueStyle={{ color: '#7c3aed', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                    </Row>
                );
        }
    };

    return (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Welcome Section */}
            <Card
                className="welcome-card fade-in"
                style={{
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    border: 'none',
                    color: 'white'
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Title level={2} style={{ color: 'white', margin: 0 }}>
                                {getGreeting()}, {user?.userName || 'User'}! 👋
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                                Vai trò: <strong>{user?.role || 'Chưa xác định'}</strong>
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                {currentTime.toLocaleDateString('vi-VN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })} - {currentTime.toLocaleTimeString('vi-VN')}
                            </Text>
                        </Space>
                    </Col>
                    <Col>
                        <Avatar
                            size={80}
                            icon={<UserOutlined />}
                            style={{
                                border: '4px solid rgba(255,255,255,0.3)',
                                backgroundColor: 'rgba(255,255,255,0.2)'
                            }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Stats Cards */}
            {roleBasedContent()}

            {/* Main Content */}
            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                {/* Performance Overview */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <BarChartOutlined style={{ color: '#dc2626' }} />
                                Hiệu suất tổng quan
                            </Space>
                        }
                        className="hover-card fade-in"
                        extra={<Button icon={<EyeOutlined />} type="link">Xem chi tiết</Button>}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title="Sử dụng hàng tháng"
                                        value={statsData.monthlyUsage}
                                        suffix="%"
                                        valueStyle={{ color: '#059669' }}
                                    />
                                    <Progress
                                        percent={statsData.monthlyUsage}
                                        strokeColor="#059669"
                                        showInfo={false}
                                        size="small"
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title="Tỷ lệ thành công"
                                        value={statsData.successRate}
                                        suffix="%"
                                        valueStyle={{ color: '#dc2626' }}
                                    />
                                    <Progress
                                        percent={statsData.successRate}
                                        strokeColor="#dc2626"
                                        showInfo={false}
                                        size="small"
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider />

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text>Tuần này</Text>
                                <Space>
                                    <ArrowUpOutlined style={{ color: '#059669' }} />
                                    <Text style={{ color: '#059669', fontWeight: 600 }}>+12%</Text>
                                </Space>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text>Tháng trước</Text>
                                <Space>
                                    <ArrowDownOutlined style={{ color: '#ef4444' }} />
                                    <Text style={{ color: '#ef4444', fontWeight: 600 }}>-3%</Text>
                                </Space>
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* Recent Activities */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined style={{ color: '#dc2626' }} />
                                Hoạt động gần đây
                            </Space>
                        }
                        className="hover-card fade-in"
                        extra={<Button icon={<EyeOutlined />} type="link">Xem tất cả</Button>}
                    >
                        <Timeline>
                            {recentActivities.map((activity, index) => (
                                <Timeline.Item
                                    key={index}
                                    dot={activity.icon}
                                    color={activity.type === 'success' ? '#059669' :
                                        activity.type === 'warning' ? '#ea580c' : '#dc2626'}
                                >
                                    <div>
                                        <Text strong>{activity.title}</Text>
                                        <br />
                                        <Text type="secondary">{activity.description}</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {activity.time}
                                        </Text>
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Card>
                </Col>

                {/* Today's Schedule */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <CalendarOutlined style={{ color: '#dc2626' }} />
                                Lịch hôm nay
                            </Space>
                        }
                        className="hover-card fade-in"
                        extra={<Button icon={<SettingOutlined />} type="link">Cài đặt</Button>}
                    >
                        <List
                            dataSource={upcomingEvents}
                            renderItem={(event) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                style={{ backgroundColor: '#dc2626' }}
                                            >
                                                {event.time}
                                            </Avatar>
                                        }
                                        title={event.title}
                                        description={
                                            <Space>
                                                <Tag color="blue">{event.room}</Tag>
                                                <Text type="secondary">
                                                    {event.students} sinh viên
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Quick Actions */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <SettingOutlined style={{ color: '#dc2626' }} />
                                Thao tác nhanh
                            </Space>
                        }
                        className="hover-card fade-in"
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<FileTextOutlined />}
                                    style={{ height: '60px' }}
                                >
                                    Tạo yêu cầu mới
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    size="large"
                                    block
                                    icon={<CalendarOutlined />}
                                    style={{ height: '60px' }}
                                >
                                    Xem lịch biểu
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    size="large"
                                    block
                                    icon={<DesktopOutlined />}
                                    style={{ height: '60px' }}
                                >
                                    Quản lý phòng
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    size="large"
                                    block
                                    icon={<BarChartOutlined />}
                                    style={{ height: '60px' }}
                                >
                                    Xem báo cáo
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* System Status */}
            <Card
                title="Trạng thái hệ thống"
                className="hover-card fade-in"
                style={{ marginTop: '24px' }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Alert
                            message="Hệ thống hoạt động bình thường"
                            description="Tất cả các dịch vụ đang chạy ổn định"
                            type="success"
                            showIcon
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Alert
                            message="Bảo trì định kỳ"
                            description="Dự kiến vào Chủ nhật, 2:00 AM"
                            type="info"
                            showIcon
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Alert
                            message="Cập nhật mới"
                            description="Phiên bản 2.1.0 đã có sẵn"
                            type="warning"
                            showIcon
                        />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Dashboard;