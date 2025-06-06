import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Spin, Alert, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../config/axiosClient';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onFinish = async (values) => {
        setLoading(true);
        setError('');
        try {
            // API backend của bạn mong muốn `passWord` không phải `password`
            const loginPayload = {
                email: values.email,
                passWord: values.password,
            };

            const response = await axiosClient.post('/access/login', loginPayload);

            if (response && response.data && response.data.token) {
                login(response.data.token); // Lưu token và thông tin user vào context
                navigate('/dashboard'); // Chuyển hướng đến trang dashboard
            } else {
                setError(response.message || 'Đăng nhập không thành công, vui lòng thử lại.');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin đăng nhập.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={2}>Đăng nhập hệ thống</Title>
            </div>
            <Form
                name="normal_login"
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập Email!',
                        },
                        {
                            type: 'email',
                            message: 'Email không đúng định dạng!',
                        },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập Mật khẩu!',
                        },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Mật khẩu"
                    />
                </Form.Item>

                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <Spin /> : 'Đăng nhập'}
                    </Button>
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>
            </Form>
        </Card>
    );
};

export default Login;