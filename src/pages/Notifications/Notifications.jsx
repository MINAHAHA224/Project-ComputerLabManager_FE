// src/pages/Notifications/Notifications.jsx

import React, { useState, useEffect } from 'react';
import {
    List,
    Button,
    Modal,
    message,
    Card,
    Typography,
    Checkbox,
    Space,
    Spin,
    Tag,
    Popconfirm,
    Input,
    Select,
    Row,
    Col,
    Badge,
    Avatar,
    Tooltip,
    Divider,
    Empty,
    Statistic,
    DatePicker,
    Radio
} from 'antd';
import {
    EyeOutlined,
    DeleteOutlined,
    MailOutlined,
    MailFilled,
    SearchOutlined,
    FilterOutlined,
    BellOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    SettingOutlined,
    ClearOutlined
} from '@ant-design/icons';
import requestApi from '../../api/requestApi';
import TicketDetail from '../../components/specific/TicketDetail';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await requestApi.getNotifications();
            const sortedData = (response.data || []).sort((a, b) => {
                if (a.status === 'NOTSEEN' && b.status !== 'NOTSEEN') return -1;
                if (a.status !== 'NOTSEEN' && b.status === 'NOTSEEN') return 1;
                return new Date(b.dateNotification) - new Date(a.dateNotification);
            });
            setNotifications(sortedData);
            setFilteredNotifications(sortedData);
        } catch (error) {
            message.error("Lỗi khi tải danh sách thông báo!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Filter and search logic
    useEffect(() => {
        let filtered = notifications;

        // Search filter
        if (searchText) {
            filtered = filtered.filter(notification =>
                notification.nameNotification?.toLowerCase().includes(searchText.toLowerCase()) ||
                notification.contentNotification?.toLowerCase().includes(searchText.toLowerCase()) ||
                notification.userSent?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(notification => {
                if (statusFilter === 'unread') return notification.status === 'NOTSEEN';
                if (statusFilter === 'read') return notification.status === 'SEEN';
                return true;
            });
        }

        // Sort
        if (sortBy === 'date') {
            filtered.sort((a, b) => new Date(b.dateNotification) - new Date(a.dateNotification));
        } else if (sortBy === 'title') {
            filtered.sort((a, b) => a.nameNotification.localeCompare(b.nameNotification));
        } else if (sortBy === 'sender') {
            filtered.sort((a, b) => a.userSent.localeCompare(b.userSent));
        }

        setFilteredNotifications(filtered);
    }, [notifications, searchText, statusFilter, sortBy]);

    const handleViewDetail = async (item) => {
        try {
            const response = await requestApi.markNotificationAsRead(item.id);
            setSelectedNotification(response.data);
            setIsDetailModalVisible(true);
            fetchNotifications();
        } catch (error) {
            message.error("Lỗi khi xem chi tiết thông báo!");
        }
    };

    const handleDelete = async (ids) => {
        if (!ids || ids.length === 0) {
            message.warning("Vui lòng chọn thông báo để xóa.");
            return;
        }
        try {
            await requestApi.deleteNotification(ids.join(','));
            message.success("Xóa thông báo thành công!");
            setSelectedRowKeys([]);
            fetchNotifications();
        } catch (error) {
            message.error(error.message || "Xóa thông báo thất bại!");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications
                .filter(n => n.status === 'NOTSEEN')
                .map(n => n.id);

            if (unreadIds.length === 0) {
                message.info("Không có thông báo chưa đọc nào!");
                return;
            }

            for (const id of unreadIds) {
                await requestApi.markNotificationAsRead(id);
            }

            message.success("Đã đánh dấu tất cả thông báo là đã đọc!");
            fetchNotifications();
        } catch (error) {
            message.error("Lỗi khi đánh dấu thông báo!");
        }
    };

    const handleClearFilters = () => {
        setSearchText('');
        setStatusFilter('all');
        setSortBy('date');
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    // Statistics
    const getStatistics = () => {
        const total = notifications.length;
        const unread = notifications.filter(n => n.status === 'NOTSEEN').length;
        const read = notifications.filter(n => n.status === 'SEEN').length;
        const today = notifications.filter(n => {
            const notificationDate = new Date(n.dateNotification);
            const today = new Date();
            return notificationDate.toDateString() === today.toDateString();
        }).length;

        return { total, unread, read, today };
    };

    const stats = getStatistics();

    const getNotificationIcon = (item) => {
        if (item.status === 'NOTSEEN') {
            return <MailFilled style={{ color: '#dc2626', fontSize: '18px' }} />;
        }
        return <MailOutlined style={{ color: '#6b7280', fontSize: '18px' }} />;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Card className="welcome-card fade-in" style={{ marginBottom: '24px' }}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                                <BellOutlined style={{ color: '#dc2626', marginRight: '12px' }} />
                                Hộp thư thông báo
                            </Title>
                            <Text style={{ color: '#6b7280', fontSize: '16px' }}>
                                Quản lý và theo dõi tất cả thông báo của bạn
                            </Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<CheckCircleOutlined />}
                                onClick={handleMarkAllAsRead}
                                disabled={stats.unread === 0}
                            >
                                Đánh dấu tất cả đã đọc
                            </Button>
                            <Button
                                icon={<SettingOutlined />}
                                type="default"
                            >
                                Cài đặt thông báo
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Tổng thông báo"
                            value={stats.total}
                            prefix={<BellOutlined style={{ color: '#dc2626' }} />}
                            valueStyle={{ color: '#dc2626', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Chưa đọc"
                            value={stats.unread}
                            prefix={<MailFilled style={{ color: '#ea580c' }} />}
                            valueStyle={{ color: '#ea580c', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Đã đọc"
                            value={stats.read}
                            prefix={<CheckCircleOutlined style={{ color: '#059669' }} />}
                            valueStyle={{ color: '#059669', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Hôm nay"
                            value={stats.today}
                            prefix={<CalendarOutlined style={{ color: '#7c3aed' }} />}
                            valueStyle={{ color: '#7c3aed', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters and Search */}
            <Card className="hover-card fade-in" style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8}>
                        <Input
                            placeholder="Tìm kiếm thông báo..."
                            prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="large"
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="unread">Chưa đọc</Option>
                            <Option value="read">Đã đọc</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={4}>
                        <Select
                            placeholder="Sắp xếp"
                            value={sortBy}
                            onChange={setSortBy}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            <Option value="date">Ngày nhận</Option>
                            <Option value="title">Tiêu đề</Option>
                            <Option value="sender">Người gửi</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Space>
                            <Popconfirm
                                title="Xóa thông báo"
                                description={`Bạn có chắc muốn xóa ${selectedRowKeys.length} thông báo đã chọn?`}
                                onConfirm={() => handleDelete(selectedRowKeys)}
                                disabled={selectedRowKeys.length === 0}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="primary"
                                    danger
                                    disabled={selectedRowKeys.length === 0}
                                    icon={<DeleteOutlined />}
                                    size="large"
                                >
                                    Xóa đã chọn ({selectedRowKeys.length})
                                </Button>
                            </Popconfirm>
                            <Button
                                icon={<ClearOutlined />}
                                onClick={handleClearFilters}
                                size="large"
                            >
                                Xóa bộ lọc
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchNotifications}
                                loading={loading}
                                size="large"
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Notifications List */}
            <Card
                className="hover-card fade-in"
                title={
                    <Space>
                        <Text strong style={{ fontSize: '16px' }}>
                            Danh sách thông báo ({filteredNotifications.length})
                        </Text>
                        {stats.unread > 0 && (
                            <Badge
                                count={stats.unread}
                                style={{ backgroundColor: '#dc2626' }}
                            />
                        )}
                    </Space>
                }
            >
                {filteredNotifications.length === 0 && !loading ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có thông báo nào"
                    />
                ) : (
                    <List
                        loading={loading}
                        itemLayout="horizontal"
                        dataSource={filteredNotifications}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} thông báo`,
                        }}
                        renderItem={(item) => (
                            <List.Item
                                className={`notification-item ${item.status === 'NOTSEEN' ? 'unread' : 'read'}`}
                                actions={[
                                    <Tooltip title="Xem chi tiết">
                                        <Button
                                            type="text"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewDetail(item)}
                                            className="hover-card"
                                        >
                                            Xem
                                        </Button>
                                    </Tooltip>,
                                    <Popconfirm
                                        title="Xóa thông báo"
                                        description="Bạn có chắc muốn xóa thông báo này?"
                                        onConfirm={() => handleDelete([item.id])}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Tooltip title="Xóa thông báo">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                className="hover-card"
                                            />
                                        </Tooltip>
                                    </Popconfirm>
                                ]}
                                style={{
                                    padding: '16px',
                                    border: item.status === 'NOTSEEN' ? '1px solid #dc2626' : '1px solid transparent',
                                    borderRadius: '8px',
                                    margin: '8px 0',
                                    backgroundColor: item.status === 'NOTSEEN' ? '#fef2f2' : 'white',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Space>
                                            <Checkbox
                                                checked={selectedRowKeys.includes(item.id)}
                                                onChange={(e) => {
                                                    const newKeys = e.target.checked
                                                        ? [...selectedRowKeys, item.id]
                                                        : selectedRowKeys.filter(key => key !== item.id);
                                                    setSelectedRowKeys(newKeys);
                                                }}
                                            />
                                            <Avatar
                                                style={{
                                                    backgroundColor: item.status === 'NOTSEEN' ? '#dc2626' : '#6b7280',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                icon={getNotificationIcon(item)}
                                            />
                                        </Space>
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text
                                                strong={item.status === 'NOTSEEN'}
                                                style={{
                                                    fontSize: '16px',
                                                    color: item.status === 'NOTSEEN' ? '#1f2937' : '#6b7280'
                                                }}
                                            >
                                                {item.nameNotification}
                                            </Text>
                                            <Space>
                                                {item.status === 'NOTSEEN' && (
                                                    <Tag color="red" size="small">Mới</Tag>
                                                )}
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {formatDate(item.dateNotification)}
                                                </Text>
                                            </Space>
                                        </div>
                                    }
                                    description={
                                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                            <Space>
                                                <UserOutlined style={{ color: '#6b7280' }} />
                                                <Text type="secondary">
                                                    Từ: <Text strong>{item.userSent}</Text> ({item.department})
                                                </Text>
                                            </Space>
                                            <Paragraph
                                                ellipsis={{ rows: 2, expandable: false }}
                                                style={{
                                                    margin: 0,
                                                    color: '#6b7280',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {item.contentNotification}
                                            </Paragraph>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            {/* Detail Modal */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: '#dc2626' }} />
                        <Text strong>Chi tiết Thông báo</Text>
                    </Space>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)} size="large">
                        Đóng
                    </Button>
                ]}
                width={800}
                style={{ top: 20 }}
            >
                {selectedNotification && (
                    <Card>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <div>
                                <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>
                                    {selectedNotification.nameNotification}
                                </Text>
                            </div>

                            <Divider style={{ margin: 0 }} />

                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Space>
                                        <UserOutlined style={{ color: '#dc2626' }} />
                                        <Text strong>Người gửi:</Text>
                                        <Text>{selectedNotification.userSent}</Text>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space>
                                        <CalendarOutlined style={{ color: '#dc2626' }} />
                                        <Text strong>Thời gian:</Text>
                                        <Text>{selectedNotification.dateNotification}</Text>
                                    </Space>
                                </Col>
                            </Row>

                            <div>
                                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                    Nội dung:
                                </Text>
                                <Card size="small" style={{ backgroundColor: '#f8fafc' }}>
                                    <Paragraph style={{ margin: 0 }}>
                                        {selectedNotification.contentNotification}
                                    </Paragraph>
                                </Card>
                            </div>

                            {selectedNotification.requestTicketId && (
                                <div>
                                    <Text strong>ID yêu cầu liên quan: </Text>
                                    <Tag color="blue">#{selectedNotification.requestTicketId}</Tag>
                                </div>
                            )}
                        </Space>
                    </Card>
                )}
            </Modal>

            <style jsx>{`
                .notification-item.unread {
                    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1) !important;
                }
                .notification-item.read {
                    opacity: 0.8;
                }
                .notification-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default Notifications;