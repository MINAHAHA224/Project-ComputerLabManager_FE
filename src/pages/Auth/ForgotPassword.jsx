// src/pages/Auth/ForgotPassword.jsx

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Spin, Alert, App, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
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

    if (success) {
        return (
            <Result
                icon={<CheckCircleOutlined style={{ color: '#dc2626' }} />}
                title="Email đã được gửi!"
                subTitle={success}
                extra={[
                    <Link to="/login" key="back">
                        <Button type="primary" size="large">
                            <ArrowLeftOutlined /> Quay lại Đăng nhập
                        </Button>
                    </Link>
                ]}
            />
        );
    }

    return (
        <>
            <div className="auth-form-header">
                <Title className="auth-form-title">Quên mật khẩu</Title>
                <Paragraph className="auth-form-subtitle">
                    Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
                    Chúng tôi sẽ gửi cho bạn một liên kết để tạo mật khẩu mới.
                </Paragraph>
            </div>

            <Form
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập Email!' },
                        { type: 'email', message: 'Email không đúng định dạng!' },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined style={{ color: '#dc2626' }} />}
                        placeholder="Nhập địa chỉ email của bạn"
                    />
                </Form.Item>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: '24px' }}
                    />
                )}

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ width: '100%' }}
                        loading={loading}
                    >
                        {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đặt lại mật khẩu'}
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link
                        to="/login"
                        style={{
                            color: '#dc2626',
                            fontWeight: 500,
                            textDecoration: 'none'
                        }}
                    >
                        <ArrowLeftOutlined style={{ marginRight: '8px' }} />
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </Form>
        </>
    );
};

export default ForgotPassword;