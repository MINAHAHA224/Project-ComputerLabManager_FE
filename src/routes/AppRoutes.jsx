import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Common Components
import ProtectedRoute from '../components/common/ProtectedRoute';

// Pages
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import NotFound from '../pages/NotFound/NotFound';
import RoomManagement from '../pages/RoomManagement/RoomManagement'; // <<<--- THÊM DÒNG NÀY
import CreditClassManagement from '../pages/CreditClassManagement/CreditClassManagement'; // <<<--- THÊM DÒNG NÀY
import CalendarManagement from '../pages/CalendarManagement/CalendarManagement'; // <<<--- THÊM DÒNG NÀY
import RequestManagement from '../pages/RequestManagement/RequestManagement';
import CalendarView from '../pages/CalendarView/CalendarView';
import MyRequests from '../pages/MyRequests/MyRequests';
import Notifications from '../pages/Notifications/Notifications';
import Profile from '../pages/Profile/Profile';
import CalendarReport from '../pages/Reports/CalendarReport';
import RoomReport from '../pages/Reports/RoomReport';
import TeachingSchedule from '../pages/TeachingSchedule/TeachingSchedule';
import ForgotPassword from "../pages/Auth/ForgotPassword.jsx";
// Role-specific page placeholders (sẽ xây dựng chi tiết sau)

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Routes không cần xác thực */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                 <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Routes cần xác thực */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                {/* Routes dùng chung cho tất cả các vai trò đã đăng nhập */}
                <Route element={<ProtectedRoute allowedRoles={['GVU', 'CSVC', 'GV', 'TK']} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/calendar" element={<CalendarView />} />

                </Route>

                {/* Routes cho GVU */}
                <Route element={<ProtectedRoute allowedRoles={['GVU']} />}>
                    <Route path="/calendar-management" element={<CalendarManagement />} />
                    <Route path="/credit-class-management" element={<CreditClassManagement />} />
                </Route>

                {/* Routes cho CSVC */}
                <Route element={<ProtectedRoute allowedRoles={['CSVC']} />}>
                    <Route path="/room-management" element={<RoomManagement />} />
                    <Route path="/reports/room" element={<RoomReport />} />
                </Route>
                {/* Routes cho Báo cáo */}
                <Route element={<ProtectedRoute allowedRoles={['GVU', 'TK']} />}>
                    <Route path="/reports/calendar" element={<CalendarReport />} />
                    <Route path="/teaching-schedules" element={<TeachingSchedule />} />
                </Route>
                {/* Routes cho GV */}
                <Route element={<ProtectedRoute allowedRoles={['GV']} />}>
                    <Route path="/my-requests" element={<MyRequests />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/my-teaching-schedule" element={<TeachingSchedule />} />
                </Route>

                {/* Routes dùng chung cho nhiều vai trò quản lý */}
                <Route element={<ProtectedRoute allowedRoles={['GVU', 'CSVC', 'TK']} />}>
                    <Route path="/request-management" element={<RequestManagement />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['CSVC']} />}>
                    <Route path="/reports/room" element={<RoomReport />} />
                </Route>



            </Route>

            {/* Route không tìm thấy */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;