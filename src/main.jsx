  // src/main.jsx


  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import RootApp from './RootApp.jsx'; // Đảm bảo bạn đã đổi tên file App.jsx
  import './index.css';
  import { AuthProvider } from './contexts/AuthContext.jsx';
  import { BrowserRouter } from 'react-router-dom';
  import { App as AntApp, ConfigProvider } from 'antd'; // <<<--- Import thêm ConfigProvider

  ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
          <BrowserRouter>
              <AuthProvider>
                  {/* Bọc ứng dụng trong ConfigProvider để tùy chỉnh toàn cục */}
                  <ConfigProvider
                      theme={{
                          // Bạn có thể tùy chỉnh theme ở đây nếu muốn
                      }}
                      message={{
                          maxCount: 3, // Số lượng toast tối đa hiển thị cùng lúc
                      }}
                  >
                      <AntApp>
                          <RootApp />
                      </AntApp>
                  </ConfigProvider>
              </AuthProvider>
          </BrowserRouter>
      </React.StrictMode>,
  );