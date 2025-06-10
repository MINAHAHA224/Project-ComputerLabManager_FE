import React, { useState, useEffect } from 'react';
import {Table, Button, Space, Modal, Form, Input, Select, message, Card, Typography, Tag , App} from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import requestApi from '../../api/requestApi';
import { useAuth } from '../../hooks/useAuth';
import TicketDetail from '../../components/specific/TicketDetail';

const { Title } = Typography;
const { Option } = Select;

const RequestManagement = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [isApprovalVisible, setIsApprovalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const DURATION = 5;

    const STATUS_MAP = {
        WAITING_DEAN_APPROVAL: { label: "Chờ Trưởng Khoa duyệt", color: "warning" },
        WAITING_REGISTRAR_PROCESSING: { label: "Chờ Giáo Vụ xử lý", color: "warning" },
        WAITING_FACILITIES_APPROVAL: { label: "Chờ CSVC duyệt", color: "warning" },
        PROCESSED_SUCCESSFULLY: { label: "Đã xử lý thành công", color: "success" },
        NOT_REQUIRED: { label: "Không yêu cầu duyệt", color: "default" },
        PENDING_APPROVAL: { label: "Chờ duyệt", color: "warning" },
        APPROVED: { label: "Đã duyệt", color: "success" },
        REJECTED: { label: "Từ chối", color: "error" },
    };

    const getStatusTag = (status) => {
        const statusInfo = STATUS_MAP[status];
        if (statusInfo) {
            return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
        }
        return <Tag color="geekblue">{status}</Tag>;
    };


    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await requestApi.getRequestsForManager();
            setRequests(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách yêu cầu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const showDetailModal = async (record) => {
        try {
            const response = await requestApi.getRequestByIdForManager(record.requestId);
            console.log("showDetailModal" ,response.data )
            setSelectedTicketDetail(response.data);
            setIsDetailVisible(true);
        } catch (error) {
            message.error("Lỗi khi lấy chi tiết yêu cầu!" , DURATION);
        }
    };

    const showApprovalModal = (record) => {
        setSelectedTicket(record);
        form.resetFields();
        setIsApprovalVisible(true);
    };

    const handleApprovalSubmit = async (values) => {
        const payload = {
            ticketId: selectedTicket.requestId,
            ...values
        };

        // Map role để gọi đúng API
        const userRoleMapping = {
            'Nhân viên phòng Giáo Vụ': 'GVU',
            'Nhân viên phòng Cơ sở vật chất': 'CSVC',
            'Trưởng khoa': 'TK'
        };
        const currentUserRole = user ? userRoleMapping[user.role] : null;

        try {
            if (currentUserRole === 'TK') {
                await requestApi.processChangeCalendar(payload);
            } else if (currentUserRole === 'GVU') {
                // Backend có 2 API cho GVU: mượn phòng và ...
                // Cần xác định loại yêu cầu để gọi đúng API
                if(selectedTicket.typeRequestName.includes('Mượn phòng')) {
                    await requestApi.processRentRoom(payload);
                } else {
                    // Xử lý các loại yêu cầu khác của GVU nếu có
                }
            } else if (currentUserRole === 'CSVC') {
                await requestApi.processChangeRoom(payload);
            }
            message.success('Xử lý yêu cầu thành công!');
            setIsApprovalVisible(false);
            fetchRequests(); // Tải lại danh sách
        } catch (error) {
            message.error(error.message || "Xử lý yêu cầu thất bại!" , DURATION);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'requestId', key: 'requestId' },
        { title: 'Loại yêu cầu', dataIndex: 'typeRequestName', key: 'typeRequestName' },
        { title: 'Người gửi', dataIndex: 'userRequest', key: 'userRequest' },
        { title: 'Ngày gửi', dataIndex: 'dateRequest', key: 'dateRequest' },
        { title: 'Trạng thái', dataIndex: 'statusName', render: getStatusTag  },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => showDetailModal(record)}>Xem chi tiết</Button>
                    <Button type="primary" onClick={() => showApprovalModal(record)}>Xử lý</Button>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Title level={3}>Quản lý Yêu cầu</Title>
            <Table columns={columns} dataSource={requests} loading={loading} rowKey="requestId" bordered />

            <Modal title="Chi tiết Yêu cầu" open={isDetailVisible} onCancel={() => setIsDetailVisible(false)} footer={null} width={800}>
                {selectedTicketDetail && <TicketDetail ticket={selectedTicketDetail} />}
            </Modal>

            <Modal title="Xử lý Yêu cầu" open={isApprovalVisible} onCancel={() => setIsApprovalVisible(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleApprovalSubmit}>
                    <Form.Item name="approvalStatus" label="Hành động" rules={[{ required: true }]}>
                        <Select placeholder="Chọn hành động">
                            <Option value="AGREE">Đồng ý</Option>
                            <Option value="NOT_AGREE">Không đồng ý (Từ chối)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="approverNote" label="Ghi chú (bắt buộc nếu từ chối)">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsApprovalVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Xác nhận</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default RequestManagement;