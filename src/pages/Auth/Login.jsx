// src/pages/Auth/Login.jsx

import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Spin, Alert, Divider } from 'antd';
import { MailOutlined, LockOutlined, CameraOutlined } from "@ant-design/icons";
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../config/axiosClient';
import authApi from '../../api/authApi'; // Sửa lại để dùng authApi

import { useAuth } from '../../hooks/useAuth';
import FaceLoginModal from '../../components/specific/FaceLoginModal'; // Import modal mới

const { Title, Paragraph } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFaceLoginVisible, setIsFaceLoginVisible] = useState(false); // State cho modal

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      // API backend của bạn mong muốn `passWord` không phải `password`
      const loginPayload = {
        email: values.email,
        passWord: values.password,
      };

      // const response = await axiosClient.post('/access/login', loginPayload);
      const response = await authApi.login(loginPayload);
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
    <>
      <div className="auth-form-header">
        <Title className="auth-form-title">Đăng nhập hệ thống</Title>
        <Paragraph className="auth-form-subtitle">
          Vui lòng nhập thông tin đăng nhập để truy cập hệ thống
        </Paragraph>
      </div>

      <Form
        name="normal_login"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="Email"
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
          <Input
            prefix={<MailOutlined style={{ color: '#dc2626' }} />}
            placeholder="Nhập địa chỉ email của bạn"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập Mật khẩu!',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#dc2626' }} />}
            placeholder="Nhập mật khẩu của bạn"
          />
        </Form.Item>

        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link
            to="/forgot-password"
            style={{
              float: 'right',
              color: '#dc2626',
              fontWeight: 500
            }}
          >
            Quên mật khẩu?
          </Link>
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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </Form.Item>

        <Divider>Hoặc</Divider>

        <Button
          type="default"
          icon={<CameraOutlined />}
          style={{ width: '100%' }}
          onClick={() => setIsFaceLoginVisible(true)}
        >
          Đăng nhập bằng khuôn mặt
        </Button>
      </Form>

      <FaceLoginModal
        visible={isFaceLoginVisible}
        onCancel={() => setIsFaceLoginVisible(false)}
      />
    </>
  );
};

export default Login;