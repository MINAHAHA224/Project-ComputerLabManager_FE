import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Modal, Form, Input, message, Spin, Row, Col } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import userApi from '../../api/userApi';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await userApi.getProfile();
            setProfile(response.data);
            form.setFieldsValue({
                ...response.data,
                // `resetPassword` không được điền sẵn
            });
        } catch (error) {
            message.error("Lỗi khi tải thông tin hồ sơ!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values) => {
        const payload = {
            id: profile.id, // Lấy ID từ state profile đã fetch
            ...values,
        };
        try {
            await userApi.updateProfile(payload);
            message.success("Cập nhật hồ sơ thành công!");
            setIsModalVisible(false);
            fetchProfile(); // Tải lại thông tin mới
        } catch (error) {
            message.error(error.message || "Cập nhật thất bại!");
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    if (!profile) {
        return <Card>Không thể tải thông tin hồ sơ.</Card>;
    }

    return (
        <Card
            title="Hồ sơ cá nhân"
            extra={<Button type="primary" icon={<EditOutlined />} onClick={showModal}>Chỉnh sửa</Button>}
        >
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã người dùng">{profile.userCode}</Descriptions.Item>
                <Descriptions.Item label="Họ và tên">{`${profile.firstName} ${profile.lastName}`}</Descriptions.Item>
                <Descriptions.Item label="Email trường">{profile.email}</Descriptions.Item>
                <Descriptions.Item label="Email cá nhân">{profile.emailPersonal}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{profile.gender === 'NAM' ? 'Nam' : 'Nữ'}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{profile.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label="Chuyên ngành">{profile.major}</Descriptions.Item>
                <Descriptions.Item label="CCCD/CMND">{profile.informationCode}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{profile.phone}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{authUser?.role}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                    {`${profile.address}, ${profile.ward}, ${profile.district}, ${profile.province}`}
                </Descriptions.Item>
            </Descriptions>

            <Modal
                title="Chỉnh sửa hồ sơ"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="emailPersonal" label="Email cá nhân" rules={[{ required: true, type: 'email' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="informationCode" label="CCCD/CMND" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="address" label="Số nhà, đường" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="province" label="Tỉnh/Thành phố" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="resetPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { pattern: /^\d{6,}$/, message: "Mật khẩu phải có ít nhất 6 chữ số" }
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu mới để thay đổi" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Profile;