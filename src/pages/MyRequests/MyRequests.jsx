import React, { useState, useEffect } from 'react';
import {Table, Button, Space, Modal, message, Popconfirm, Card, Typography, Tag, App} from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import requestApi from '../../api/requestApi';
import TicketDetail from '../../components/specific/TicketDetail'; // Component xem chi tiết

const { Title } = Typography;

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const { message } = App.useApp();
    const DURATION = 5;
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await requestApi.getMyRequests();
            setRequests(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách yêu cầu!' , DURATION);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const showDetailModal = async (id) => {
        try {
            const response = await requestApi.getMyRequestById(id);
            console.log("showDetailModal " ,response.data )
            setSelectedTicket(response.data);
            setIsDetailVisible(true);
        } catch (error) {
            message.error("Lỗi khi lấy chi tiết yêu cầu!" ,DURATION);
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestApi.deleteMyRequest(id);
            message.success('Hủy yêu cầu thành công!');
            fetchRequests();
        } catch (error) {
            message.error(error.message || 'Hủy yêu cầu thất bại!' ,DURATION);
        }
    };

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

    const columns = [
        { title: 'ID', dataIndex: 'requestTicketId', key: 'requestTicketId' },
        { title: 'Loại yêu cầu', dataIndex: 'typeRequest', key: 'typeRequest' },
        { title: 'Ngày gửi', dataIndex: 'dateSent', key: 'dateSent' },
        { title: 'Trạng thái', dataIndex: 'statusOverall', key: 'statusOverall', render: getStatusTag },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => showDetailModal(record.requestTicketId)}>Xem</Button>
                    {record.statusOverall?.includes('WAITING') && (
                        <Popconfirm
                            title="Hủy yêu cầu"
                            description="Bạn có chắc muốn hủy yêu cầu này?"
                            onConfirm={() => handleDelete(record.requestTicketId)}
                            okText="Đồng ý"
                            cancelText="Không"
                        >
                            <Button icon={<DeleteOutlined />} danger>Hủy</Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Title level={3}>Yêu cầu của tôi</Title>
            <Table columns={columns} dataSource={requests} loading={loading} rowKey="requestTicketId" bordered />

            <Modal
                title="Chi tiết Yêu cầu"
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[<Button key="back" onClick={() => setIsDetailVisible(false)}>Đóng</Button>]}
                width={800}
            >
                {selectedTicket && <TicketDetail ticket={selectedTicket} />}
            </Modal>
        </Card>
    );
};

export default MyRequests;