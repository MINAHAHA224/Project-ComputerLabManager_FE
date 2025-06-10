import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Spin, Alert, App } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axiosClient from '../../config/axiosClient';

const { Title, Paragraph } = Typography;

const ForgotPassword = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onFinish = async (values) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // API của bạn dùng @RequestParam, nên ta phải thêm email vào URL params
            const response = await axiosClient.post(`/access/forgotPassword?email=${values.email}`);

            // Dựa vào logic backend, bạn trả về ResponseSuccess hoặc ResponseFailure
            // Cả hai đều có thể có status 200, nên ta dựa vào message
            if (response && response.status === 200) {
                setSuccess(response.message || 'Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn.');
            } else {
                setError(response.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }

        } catch (err) {
            setError(err.message || 'Email không tồn tại hoặc có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={2}>Quên mật khẩu</Title>
                <Paragraph>
                    Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
                </Paragraph>
            </div>

            {success ? (
                <Alert message={success} type="success" showIcon />
            ) : (
                <Form onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                            Gửi yêu cầu
                        </Button>
                    </Form.Item>
                </Form>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Link to="/login">
                    <ArrowLeftOutlined /> Quay lại Đăng nhập
                </Link>
            </div>
        </Card>
    );
};

export default ForgotPassword;