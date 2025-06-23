// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../config/axiosClient';
import { App } from "antd";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(true);
    const { message } = App.useApp();
    const DURATION = 3;

    // fetchUser bây giờ sẽ được tái sử dụng để làm mới dữ liệu
    const fetchUser = useCallback(async () => {
        // Không cần set loading ở đây để tránh màn hình bị giật khi refresh
        if (localStorage.getItem('authToken')) { // Luôn kiểm tra localStorage
            try {
                const response = await axiosClient.get('/home');

                if (response && response.data && response.data.dataUser) {
                    setUser(response.data.dataUser);
                    setIsAuthenticated(true);
                } else {
                    logout();
                }
            } catch (error) {
                console.error('Failed to fetch user info, logging out.', error);
                logout();
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    // useEffect ban đầu để xác thực khi tải ứng dụng
    useEffect(() => {
        const initialAuth = async () => {
            setLoading(true);
            await fetchUser();
            setLoading(false);
        }
        initialAuth();
    }, [fetchUser]);

    const login = (apiToken) => {
        localStorage.setItem('authToken', apiToken);
        setToken(apiToken);
        setIsAuthenticated(true);
        fetchUser(); // Gọi fetchUser ngay sau khi login
    };

    const logout = async () => {
        console.log('🔄 Starting logout process...');

        try {
            // Gọi API logout của backend để invalidate token trên server
            console.log('📡 Calling logout API...');
            await axiosClient.post('/access/logout');
            console.log('✅ Logout API call successful');
        } catch (error) {
            console.error("❌ API Logout failed", error);
            // Vẫn tiếp tục logout phía client ngay cả khi API call thất bại
        }

        console.log('🧹 Clearing authentication data...');

        // Clear tất cả dữ liệu authentication
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole'); // Clear user role nếu có

        // Reset state
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);

        console.log('✅ Authentication data cleared');

        // Hiển thị message logout thành công
        message.success('Đăng xuất thành công!', DURATION);

        console.log('🔄 Redirecting to login...');

        // Force reload để đảm bảo clear hết state
        setTimeout(() => {
            window.location.href = '/login';
        }, 500); // Delay nhỏ để message hiển thị
    };

    // === HÀM MỚI ĐỂ CẬP NHẬT THÔNG TIN USER ===
    const refreshUserData = async () => {
        // Chỉ cần gọi lại hàm fetchUser là đủ
        await fetchUser();
    };

    const contextValue = {
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshUserData, // <<<--- Đưa hàm mới vào context
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};


