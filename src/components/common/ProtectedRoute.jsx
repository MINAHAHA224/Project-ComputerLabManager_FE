import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component để bảo vệ route
 * @param {{ allowedRoles: string[] }} props - Mảng các chuỗi vai trò được phép truy cập. Ví dụ: ['GVU', 'CSVC']
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        return <Navigate to="/login" replace />;
    }

    // user.role sẽ có dạng "Nhân viên phòng Giáo Vụ"
    // chúng ta cần map nó về dạng "GVU", "CSVC"...
    const userRoleMapping = {
        'Nhân viên phòng Giáo Vụ': 'GVU',
        'Nhân viên phòng Cơ sở vật chất': 'CSVC',
        'Giảng Viên': 'GV',
        'Trưởng khoa': 'TK'
    };

    const currentUserRole = user ? userRoleMapping[user.role] : null;

    // Kiểm tra xem vai trò của người dùng có nằm trong danh sách được phép không
    const isAllowed = allowedRoles.includes(currentUserRole);

    if (!isAllowed) {
        // Nếu đã đăng nhập nhưng không có quyền, có thể hiển thị trang "Forbidden" hoặc chuyển hướng về dashboard
        console.warn(`Access denied. User role: ${currentUserRole}, Allowed roles: ${allowedRoles}`);
        return <Navigate to="/dashboard" replace />; // Hoặc tới trang /forbidden
    }

    // Nếu đã đăng nhập và có quyền, hiển thị nội dung của route
    return <Outlet />;
};

export default ProtectedRoute;