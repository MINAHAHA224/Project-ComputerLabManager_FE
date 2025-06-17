// src/RootApp.jsx

import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes'; // Chúng ta sẽ tạo file này ở phần sau
import { Spin } from 'antd'; // Thêm Spin cho đẹp hơn
function RootApp() {
    const { loading } = useAuth();

    // Trong khi chờ xác thực token, có thể hiển thị một spinner toàn màn hình
    if (loading) {
                return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        // Component AppRoutes sẽ chứa toàn bộ logic routing
        <AppRoutes />
    );
}

export default RootApp;

