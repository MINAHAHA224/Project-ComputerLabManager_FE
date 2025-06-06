import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import roomApi from '../../api/roomApi';

const { Title } = Typography;
const { Option } = Select;

// Dữ liệu cơ sở tạm thời, thay thế bằng API call nếu có
const facilitiesData = [
    { id: 1, name: 'Quận 1' },
    { id: 2, name: 'Quận 9' },
];

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form] = Form.useForm();

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await roomApi.getAllRooms();
            // Dữ liệu trả về nằm trong response.data
            setRooms(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách phòng máy!');
            console.error("Failed to fetch rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const showModal = (room = null) => {
        setEditingRoom(room);
        if (room) {
            // Dữ liệu từ API getRoomById có thể khác, ta cần chuẩn bị
            // Backend trả về `facility` là ID, nên ta set trực tiếp
            form.setFieldsValue({
                ...room,
                facility: room.facility, // Giả sử room object có `facility` là ID
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleEdit = async (id) => {
        try {
            const response = await roomApi.getRoomById(id);
            if (response.data) {
                showModal(response.data);
            } else {
                message.error('Không tìm thấy thông tin phòng!');
            }
        } catch (error) {
            message.error('Lỗi khi lấy thông tin phòng!');
        }
    }


    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRoom(null);
        form.resetFields();
    };

    const onFinish = async (values) => {
        const payload = { ...values };
        if (editingRoom) {
            payload.idRoom = editingRoom.idRoom;
        }

        try {
            if (editingRoom) {
                await roomApi.updateRoom(payload);
                message.success('Cập nhật phòng máy thành công!');
            } else {
                await roomApi.createRoom(payload);
                message.success('Thêm phòng máy thành công!');
            }
            setIsModalVisible(false);
            fetchRooms(); // Tải lại danh sách
        } catch (error) {
            console.error("Failed to save room:", error);
            message.error(error.message || 'Thao tác thất bại!');
        }
    };

    const handleDelete = async (id) => {
        try {
            await roomApi.deleteRoom(id);
            message.success('Xóa phòng máy thành công!');
            fetchRooms(); // Tải lại danh sách
        } catch (error) {
            console.error("Failed to delete room:", error);
            message.error(error.message || 'Xóa thất bại!');
        }
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (text, record, index) => index + 1,
            width: '5%',
        },
        {
            title: 'Tên phòng',
            dataIndex: 'nameRoom',
            key: 'nameRoom',
            sorter: (a, b) => a.nameRoom.localeCompare(b.nameRoom),
        },
        {
            title: 'Cơ sở',
            dataIndex: 'facility',
            key: 'facility',
            filters: facilitiesData.map(f => ({ text: f.name, value: f.name })),
            onFilter: (value, record) => record.facility.indexOf(value) === 0,
        },
        {
            title: 'Tổng số máy',
            dataIndex: 'numberOfComputers',
            key: 'numberOfComputers',
            sorter: (a, b) => a.numberOfComputers - b.numberOfComputers,
        },
        {
            title: 'Số máy hoạt động',
            dataIndex: 'numberOfComputerActive',
            key: 'numberOfComputerActive',
            sorter: (a, b) => a.numberOfComputerActive - b.numberOfComputerActive,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>Sửa</Button>
                    <Popconfirm
                        title="Xóa phòng máy"
                        description="Bạn có chắc muốn xóa phòng này không?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Title level={3}>Quản lý Phòng máy</Title>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                style={{ marginBottom: 16 }}
            >
                Thêm phòng máy
            </Button>
            <Table
                columns={columns}
                dataSource={rooms}
                loading={loading}
                rowKey="id"
                bordered
            />

            <Modal
                title={editingRoom ? 'Cập nhật Phòng máy' : 'Thêm mới Phòng máy'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null} // Tắt footer mặc định để dùng footer của Form
            >
                <Form form={form} layout="vertical" name="room_form" onFinish={onFinish}>
                    <Form.Item
                        name="nameRoom"
                        label="Tên phòng"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên phòng!' },
                            { pattern: /^[A-Z0-9]+$/, message: 'Tên phòng chỉ chứa chữ in hoa và số!' },
                            { min: 2, max: 10, message: 'Tên phòng từ 2-10 ký tự!'}
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="facility"
                        label="Cơ sở"
                        rules={[{ required: true, message: 'Vui lòng chọn cơ sở!' }]}
                    >
                        <Select placeholder="Chọn cơ sở">
                            {facilitiesData.map(facility => (
                                <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="numberOfComputer"
                        label="Tổng số máy"
                        rules={[{ required: true, message: 'Vui lòng nhập tổng số máy!' }]}
                    >
                        <InputNumber min={1} max={70} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="numberOfComputerActive"
                        label="Số máy hoạt động"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số máy hoạt động!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('numberOfComputer') >= value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Số máy hoạt động không thể lớn hơn tổng số máy!'));
                                },
                            }),
                        ]}
                    >
                        <InputNumber min={0} max={70} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default RoomManagement;