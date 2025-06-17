// src/contexts/AuthContext.jsx


import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../config/axiosClient';
import {App} from "antd";
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

    const logout = () => {
        // Gọi API logout của backend (không bắt buộc phải chờ, nhưng nên gọi)
        // axiosClient.post('/access/logout').catch(err => console.error("API Logout failed", err ));

            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);




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


