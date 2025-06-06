import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes'; // Chúng ta sẽ tạo file này ở phần sau

function App() {
    const { loading } = useAuth();

    // Trong khi chờ xác thực token, có thể hiển thị một spinner toàn màn hình
    if (loading) {
        return <div>Loading Application...</div>; // TODO: Thay bằng component Spinner đẹp hơn
    }

    return (
        // Component AppRoutes sẽ chứa toàn bộ logic routing
        <AppRoutes />
    );
}

export default App;