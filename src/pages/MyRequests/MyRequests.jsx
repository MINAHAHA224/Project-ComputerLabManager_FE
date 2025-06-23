// src/pages/MyRequests/MyRequests.jsx

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    message,
    Popconfirm,
    Card,
    Typography,
    Tag,
    App,
    Input,
    Select,
    Row,
    Col,
    DatePicker,
    Statistic,
    Empty,
    Badge,
    Tooltip,
    Divider
} from 'antd';
import {
    EyeOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined,
    PlusOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import requestApi from '../../api/requestApi';
import TicketDetail from '../../components/specific/TicketDetail';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const { message } = App.useApp();
    const DURATION = 5;

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await requestApi.getMyRequests();
            const requestsData = response.data || [];
            setRequests(requestsData);
            setFilteredRequests(requestsData);
        } catch (error) {
            message.error('Lỗi khi tải danh sách yêu cầu!', DURATION);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Filter and search logic
    useEffect(() => {
        let filtered = requests;

        // Search filter
        if (searchText) {
            filtered = filtered.filter(request =>
                request.typeRequest?.toLowerCase().includes(searchText.toLowerCase()) ||
                request.requestTicketId?.toString().includes(searchText)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(request => request.statusOverall === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(request => request.typeRequest === typeFilter);
        }

        setFilteredRequests(filtered);
    }, [requests, searchText, statusFilter, typeFilter]);

    const showDetailModal = async (id) => {
        try {
            const response = await requestApi.getMyRequestById(id);
            setSelectedTicket(response.data);
            setIsDetailVisible(true);
        } catch (error) {
            message.error("Lỗi khi lấy chi tiết yêu cầu!", DURATION);
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestApi.deleteMyRequest(id);
            message.success('Hủy yêu cầu thành công!');
            fetchRequests();
        } catch (error) {
            message.error(error.message || 'Hủy yêu cầu thất bại!', DURATION);
        }
    };

    const STATUS_MAP = {
        WAITING_DEAN_APPROVAL: { label: "Chờ Trưởng Khoa duyệt", color: "warning", icon: <ClockCircleOutlined /> },
        WAITING_REGISTRAR_PROCESSING: { label: "Chờ Giáo Vụ xử lý", color: "processing", icon: <ClockCircleOutlined /> },
        WAITING_FACILITIES_APPROVAL: { label: "Chờ CSVC duyệt", color: "warning", icon: <ClockCircleOutlined /> },
        PROCESSED_SUCCESSFULLY: { label: "Đã xử lý thành công", color: "success", icon: <CheckCircleOutlined /> },
        NOT_REQUIRED: { label: "Không yêu cầu duyệt", color: "default", icon: <ExclamationCircleOutlined /> },
        PENDING_APPROVAL: { label: "Chờ duyệt", color: "warning", icon: <ClockCircleOutlined /> },
        APPROVED: { label: "Đã duyệt", color: "success", icon: <CheckCircleOutlined /> },
        REJECTED: { label: "Từ chối", color: "error", icon: <ExclamationCircleOutlined /> },
    };

    const getStatusTag = (status) => {
        const statusInfo = STATUS_MAP[status];
        if (statusInfo) {
            return (
                <Tag color={statusInfo.color} icon={statusInfo.icon}>
                    {statusInfo.label}
                </Tag>
            );
        }
        return <Tag color="geekblue">{status}</Tag>;
    };

    // Statistics
    const getStatistics = () => {
        const total = requests.length;
        const pending = requests.filter(r => r.statusOverall?.includes('WAITING')).length;
        const approved = requests.filter(r => r.statusOverall === 'APPROVED' || r.statusOverall === 'PROCESSED_SUCCESSFULLY').length;
        const rejected = requests.filter(r => r.statusOverall === 'REJECTED').length;

        return { total, pending, approved, rejected };
    };

    const stats = getStatistics();

    // Get unique types for filter
    const getUniqueTypes = () => {
        return [...new Set(requests.map(r => r.typeRequest).filter(Boolean))];
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'requestTicketId',
            key: 'requestTicketId',
            width: 80,
            render: (id) => (
                <Text code style={{ color: '#dc2626', fontWeight: 600 }}>
                    #{id}
                </Text>
            )
        },
        {
            title: 'Loại yêu cầu',
            dataIndex: 'typeRequest',
            key: 'typeRequest',
            render: (type) => (
                <Space>
                    <FileTextOutlined style={{ color: '#dc2626' }} />
                    <Text strong>{type}</Text>
                </Space>
            )
        },
        {
            title: 'Ngày gửi',
            dataIndex: 'dateSent',
            key: 'dateSent',
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{ color: '#6b7280' }} />
                    <Text>{date}</Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusOverall',
            key: 'statusOverall',
            render: getStatusTag,
            filters: Object.entries(STATUS_MAP).map(([key, value]) => ({
                text: value.label,
                value: key
            })),
            onFilter: (value, record) => record.statusOverall === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => showDetailModal(record.requestTicketId)}
                            className="hover-card"
                        >
                            Xem
                        </Button>
                    </Tooltip>
                    {record.statusOverall?.includes('WAITING') && (
                        <Popconfirm
                            title="Hủy yêu cầu"
                            description="Bạn có chắc muốn hủy yêu cầu này?"
                            onConfirm={() => handleDelete(record.requestTicketId)}
                            okText="Đồng ý"
                            cancelText="Không"
                        >
                            <Tooltip title="Hủy yêu cầu">
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    className="hover-card"
                                >
                                    Hủy
                                </Button>
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header with Stats */}
            <Card className="welcome-card fade-in" style={{ marginBottom: '24px' }}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                                <FileTextOutlined style={{ color: '#dc2626', marginRight: '12px' }} />
                                Yêu cầu của tôi
                            </Title>
                            <Text style={{ color: '#6b7280', fontSize: '16px' }}>
                                Quản lý và theo dõi tất cả yêu cầu của bạn
                            </Text>
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            style={{ height: '48px' }}
                        >
                            Tạo yêu cầu mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Tổng yêu cầu"
                            value={stats.total}
                            prefix={<FileTextOutlined style={{ color: '#dc2626' }} />}
                            valueStyle={{ color: '#dc2626', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Đang chờ xử lý"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined style={{ color: '#ea580c' }} />}
                            valueStyle={{ color: '#ea580c', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Đã duyệt"
                            value={stats.approved}
                            prefix={<CheckCircleOutlined style={{ color: '#059669' }} />}
                            valueStyle={{ color: '#059669', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="stat-card hover-card">
                        <Statistic
                            title="Từ chối"
                            value={stats.rejected}
                            prefix={<ExclamationCircleOutlined style={{ color: '#ef4444' }} />}
                            valueStyle={{ color: '#ef4444', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters and Search */}
            <Card className="hover-card fade-in" style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8}>
                        <Input
                            placeholder="Tìm kiếm theo ID hoặc loại yêu cầu..."
                            prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="large"
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={5}>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            {Object.entries(STATUS_MAP).map(([key, value]) => (
                                <Option key={key} value={key}>
                                    {value.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={5}>
                        <Select
                            placeholder="Lọc theo loại"
                            value={typeFilter}
                            onChange={setTypeFilter}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả loại</Option>
                            {getUniqueTypes().map(type => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Space>
                            <Button
                                icon={<FilterOutlined />}
                                size="large"
                            >
                                Bộ lọc nâng cao
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchRequests}
                                loading={loading}
                                size="large"
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Requests Table */}
            <Card className="hover-card fade-in" title={
                <Space>
                    <Text strong style={{ fontSize: '16px' }}>
                        Danh sách yêu cầu ({filteredRequests.length})
                    </Text>
                    <Badge
                        count={stats.pending}
                        style={{ backgroundColor: '#ea580c' }}
                    />
                </Space>
            }>
                {filteredRequests.length === 0 && !loading ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Space direction="vertical">
                                <Text>Không có yêu cầu nào</Text>
                                <Button type="primary" icon={<PlusOutlined />}>
                                    Tạo yêu cầu đầu tiên
                                </Button>
                            </Space>
                        }
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredRequests}
                        loading={loading}
                        rowKey="requestTicketId"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} yêu cầu`,
                        }}
                        scroll={{ x: 800 }}
                        className="fade-in"
                        rowClassName={(record) => {
                            if (record.statusOverall?.includes('WAITING')) return 'row-pending';
                            if (record.statusOverall === 'APPROVED') return 'row-approved';
                            if (record.statusOverall === 'REJECTED') return 'row-rejected';
                            return '';
                        }}
                    />
                )}
            </Card>

            {/* Detail Modal */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: '#dc2626' }} />
                        <Text strong>Chi tiết Yêu cầu</Text>
                    </Space>
                }
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsDetailVisible(false)} size="large">
                        Đóng
                    </Button>
                ]}
                width={900}
                style={{ top: 20 }}
            >
                {selectedTicket && <TicketDetail ticket={selectedTicket} />}
            </Modal>

            <style jsx>{`
                .row-pending {
                    background-color: #fffbeb !important;
                }
                .row-approved {
                    background-color: #f0fdf4 !important;
                }
                .row-rejected {
                    background-color: #fef2f2 !important;
                }
            `}</style>
        </div>
    );
};

export default MyRequests;