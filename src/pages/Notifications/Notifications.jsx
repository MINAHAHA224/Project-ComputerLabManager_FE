import React, { useState, useEffect } from 'react';
import { List, Button, Modal, message, Card, Typography, Checkbox, Space, Spin, Tag, Popconfirm } from 'antd';
import { EyeOutlined, DeleteOutlined, MailOutlined, MailFilled } from '@ant-design/icons';
import requestApi from '../../api/requestApi';
import TicketDetail from '../../components/specific/TicketDetail';

const { Title, Text } = Typography;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await requestApi.getNotifications();
            // Sắp xếp để thông báo chưa đọc lên đầu
            const sortedData = (response.data || []).sort((a, b) => {
                if (a.status === 'NOTSEEN' && b.status !== 'NOTSEEN') return -1;
                if (a.status !== 'NOTSEEN' && b.status === 'NOTSEEN') return 1;
                return 0;
            });
            setNotifications(sortedData);
        } catch (error) {
            message.error("Lỗi khi tải danh sách thông báo!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleViewDetail = async (item) => {
        try {
            // Dù đã đọc hay chưa, gọi API để đánh dấu là đã đọc và lấy chi tiết
            const response = await requestApi.markNotificationAsRead(item.id);
            setSelectedNotification(response.data);
            setIsDetailModalVisible(true);
            // Cập nhật lại danh sách trên UI để thay đổi trạng thái icon
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
            setSelectedRowKeys([]); // Reset lựa chọn
            fetchNotifications(); // Tải lại danh sách
        } catch (error) {
            message.error(error.message || "Xóa thông báo thất bại!");
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <Card>
            <Title level={3}>Hộp thư thông báo</Title>
            <Space style={{ marginBottom: 16 }}>
                <Popconfirm
                    title="Xóa thông báo"
                    description={`Bạn có chắc muốn xóa ${selectedRowKeys.length} thông báo đã chọn?`}
                    onConfirm={() => handleDelete(selectedRowKeys)}
                    disabled={selectedRowKeys.length === 0}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button type="primary" danger disabled={selectedRowKeys.length === 0}>
                        Xóa mục đã chọn
                    </Button>
                </Popconfirm>
            </Space>

            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(item)}>Xem</Button>,
                            <Popconfirm
                                title="Xóa thông báo"
                                description="Bạn có chắc muốn xóa thông báo này?"
                                onConfirm={() => handleDelete([item.id])}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ]}
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
                                    {item.status === 'NOTSEEN' ? <MailFilled style={{color: '#1890ff'}} /> : <MailOutlined />}
                                </Space>
                            }
                            title={<Text strong={item.status === 'NOTSEEN'}>{item.nameNotification}</Text>}
                            description={`Nhận lúc: ${item.dateNotification}`}
                        />
                    </List.Item>
                )}
            />

            <Modal
                title="Chi tiết Thông báo"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>]}
                width={800}
            >
                {selectedNotification ? (
                    <Card>
                        <p><strong>Người gửi:</strong> {selectedNotification.userSent} ({selectedNotification.department})</p>
                        <p><strong>Nội dung:</strong> {selectedNotification.contentNotification}</p>
                        <hr/>
                        <Title level={5}>Chi tiết yêu cầu liên quan</Title>
                        {/* Chúng ta cần API để lấy chi tiết Ticket từ ID trong thông báo */}
                        {/* Hiện tại, chúng ta chưa có API đó, nên phần này sẽ cần bổ sung */}
                        <p>ID yêu cầu liên quan: {selectedNotification.requestTicketId}</p>
                    </Card>
                ) : <Spin />}
            </Modal>
        </Card>
    );
};

export default Notifications;