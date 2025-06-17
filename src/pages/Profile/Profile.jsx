// src/pages/Profile/Profile.jsx

import React, { useState, useEffect } from 'react';
import {
    Card,
    Descriptions,
    Button,
    Modal,
    Form,
    Input,
    message,
    Spin,
    Row,
    Col,
    Avatar,
    Upload,
    Space,
    Popconfirm,
    Typography,
    App
} from 'antd';
import { EditOutlined, UserOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import userApi from '../../api/userApi';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

// Hàm helper để chuyển file sang base64 để xem trước
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });


const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // States cho Upload
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const { message } = App.useApp();
    const DURATION = 5;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await userApi.getProfile();
            setProfile(response.data);
            console.log("fetchProfile" , response.data)
            if (response.data && response.data.avatar) {
                setAvatarUrl(`http://localhost:8080/avatars/${response.data.avatar}`);
            } else {
                setAvatarUrl(''); // Reset nếu không có avatar
            }
            form.setFieldsValue({
                ...response.data,
                // `resetPassword` không được điền sẵn
            });
        } catch (error) {
            message.error("Lỗi khi tải thông tin hồ sơ!" ,DURATION);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const showModal = () => {
        setFileList([]);
        form.setFieldsValue({ ...profile, resetPassword: '' }); // Điền dữ liệu và reset password
        setIsModalVisible(true);
    };

    const handleCancel = () => setIsModalVisible(false);
    const handlePreviewCancel = () => setPreviewOpen(false);

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const handleAvatarUpload = async () => {
        if (fileList.length === 0 || !fileList[0].originFileObj) {
            message.warning("Vui lòng chọn một ảnh mới để tải lên." ,DURATION);
            return;
        }
        setUploading(true);
        try {
            await userApi.uploadAvatar(fileList[0].originFileObj);
            message.success("Cập nhật ảnh đại diện thành công!" ,DURATION);
            setFileList([]);
            fetchProfile();
        } catch (error) {
            message.error("Cập nhật ảnh đại diện thất bại!" ,DURATION);
        } finally {
            setUploading(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                id: profile.id,
                phone: values.phone,
                emailPersonal: values.emailPersonal,
                informationCode: values.informationCode,
                address: values.address,
                ward: values.ward,
                district: values.district,
                province: values.province,
                resetPassword: values.resetPassword || undefined,
            };

            // Lọc bỏ các giá trị undefined để không gửi lên server
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

            await userApi.updateProfile(payload);
            message.success("Cập nhật thông tin thành công!" , DURATION);
            setIsModalVisible(false);
            fetchProfile();
        } catch (error) {
            message.error(error.message || "Cập nhật thất bại!" , DURATION);
        } finally {
            setLoading(false);
        }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Chọn/Thay đổi</div>
        </div>
    );

    if (loading) { return <Spin size="large" />; }

    return (
        <Card title="Hồ sơ cá nhân" extra={<Button type="primary" icon={<EditOutlined />} onClick={showModal}>Chỉnh sửa</Button>}>
            <Row align="middle" gutter={32}>
                <Col><Avatar size={128} icon={<UserOutlined />} src={avatarUrl} /></Col>
                <Col flex={1}>


                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Mã người dùng">{profile.userCode}</Descriptions.Item>
                        <Descriptions.Item label="Họ và tên">{`${profile.firstName} ${profile.lastName}`}</Descriptions.Item>
                        <Descriptions.Item label="Email trường">{profile.email}</Descriptions.Item>
                        <Descriptions.Item label="Email cá nhân">{profile.emailPersonal}</Descriptions.Item>
                        <Descriptions.Item label="Giới tính">{profile.gender === 'NAM' ? 'Nam' : 'Nữ'}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">{profile.dateOfBirth}</Descriptions.Item>
                        <Descriptions.Item label="Chuyên ngành">{profile.major}</Descriptions.Item>
                      <Descriptions.Item label="Khoa">{profile.khoa}</Descriptions.Item>
                        <Descriptions.Item label="CCCD/CMND">{profile.informationCode}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{profile.phone}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">{authUser?.role}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>
                            {`${profile.address}, ${profile.ward}, ${profile.district}, ${profile.province}`}
                        </Descriptions.Item>
                    </Descriptions>

                </Col>
            </Row>

            <Modal title="Chỉnh sửa hồ sơ" open={isModalVisible} onCancel={handleCancel} footer={null} width={800} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Ảnh đại diện">
                        <Space align="start">
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={handlePreview}
                                onChange={handleChange}
                                onRemove={() => setFileList([])}
                                beforeUpload={() => false} // Luôn return false để upload thủ công
                                maxCount={1}
                            >
                                {uploadButton}
                            </Upload>
                            {fileList.length > 0 && (
                                <Button type="primary" onClick={handleAvatarUpload} loading={uploading}>Cập nhật ảnh</Button>
                            )}
                        </Space>
                    </Form.Item>
                    <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #f0f0f0'}} />
                    <Title level={5}>Cập nhật thông tin khác</Title>
                    <Form.Item name="resetPassword" label="Mật khẩu mới (Để trống nếu không muốn đổi)" rules={[{ pattern: /^\d{6,}$/, message: 'Mật khẩu phải có ít nhất 6 chữ số!' }]}>
                        <Input.Password placeholder="Nhập để thay đổi mật khẩu" />
                    </Form.Item>
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
                        {/*<Col span={24}>*/}
                        {/*    <Form.Item*/}
                        {/*        name="resetPassword"*/}
                        {/*        label="Mật khẩu mới"*/}
                        {/*        rules={[*/}
                        {/*            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },*/}
                        {/*            { pattern: /^\d{6,}$/, message: "Mật khẩu phải có ít nhất 6 chữ số" }*/}
                        {/*        ]}*/}
                        {/*    >*/}
                        {/*        <Input.Password placeholder="Nhập mật khẩu mới để thay đổi" />*/}
                        {/*    </Form.Item>*/}
                        {/*</Col>*/}
                    </Row>
                    <Form.Item style={{ textAlign: 'right' }}><Space><Button onClick={handleCancel}>Hủy</Button><Button type="primary" htmlType="submit">Lưu thông tin</Button></Space></Form.Item>
                </Form>
            </Modal>

            {/* Modal để xem trước ảnh */}
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handlePreviewCancel}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </Card>
    );
};

export default Profile;