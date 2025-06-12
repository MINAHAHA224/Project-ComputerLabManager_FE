import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Modal, Spin, Typography, message, Result } from 'antd';
import Webcam from 'react-webcam';
import authApi from '../../api/authApi'; // Tạo file này
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const FaceLoginModal = ({ visible, onCancel }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('SCANNING'); // SCANNING -> PROCESSING -> SUCCESS/FAILED
  const [error, setError] = useState('');
  const webcamRef = useRef(null);

  // Tài khoản mặc định để mô phỏng
  const MOCK_USER_CODE = 'GVU001@ptithcm.edu.vn'; // Đăng nhập với vai trò Giáo vụ

  useEffect(() => {
    let timer;
    if (visible && status === 'SCANNING') {
      // Giả lập quá trình quét và xử lý
      timer = setTimeout(() => {
        setStatus('PROCESSING');
        handleLogin();
      }, 3000); // Sau 3 giây thì bắt đầu "xử lý"
    }
    return () => clearTimeout(timer); // Dọn dẹp timer khi component unmount
  }, [visible, status]);

  const handleLogin = async () => {
    try {
      const response = await authApi.faceLogin(MOCK_USER_CODE);
      if (response && response.data && response.data.token) {
        setStatus('SUCCESS');
        setTimeout(() => {
          login(response.data.token);
          navigate('/dashboard');
        }, 1500); // Chờ 1.5s để xem thông báo thành công rồi mới chuyển trang
      } else {
        throw new Error(response.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.message || "Không thể xác thực người dùng.");
      setStatus('FAILED');
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'PROCESSING':
        return <Spin tip="Đang xử lý..." size="large"><div style={{height: 200}} /></Spin>;
      case 'SUCCESS':
        return <Result status="success" title="Xác thực thành công!" subTitle={`Chào mừng trở lại! Đang chuyển hướng...`} />;
      case 'FAILED':
        return <Result status="error" title="Xác thực thất bại" subTitle={error} />;
      case 'SCANNING':
      default:
        return <Text>Vui lòng nhìn thẳng vào camera...</Text>;
    }
  };

  return (
    <Modal
      title="Đăng nhập bằng Khuôn mặt"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ width: 320, height: 240, margin: '0 auto 20px', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
          {status === 'SCANNING' && <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={320} height={240} />}
        </div>
        {getStatusContent()}
      </div>
    </Modal>
  );
};

export default FaceLoginModal;