// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import axiosClient from '../config/axiosClient';
//
// // Tạo Context
// export const AuthContext = createContext();
//
// // Tạo Provider Component
// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(localStorage.getItem('authToken'));
//     const [user, setUser] = useState(null); // Sẽ chứa { userName, role, userId, userCode }
//     const [isAuthenticated, setIsAuthenticated] = useState(!!token);
//     const [loading, setLoading] = useState(true); // Thêm state loading
//
//     // Hàm này sẽ được gọi khi token thay đổi (login/logout/refresh)
//     const fetchUser = useCallback(async () => {
//
//         if (token) {
//             try {
//                 // Gọi API /home để lấy thông tin user và role
//                 const response = await axiosClient.get('/home');
//
//                 if (response && response.data && response.data.dataUser) {
//                     setUser(response.data.dataUser);
//                     setIsAuthenticated(true);
//                 } else {
//                     // Nếu API /home không trả về data đúng format -> logout
//                     logout();
//                 }
//             } catch (error) {
//                 console.error('Failed to fetch user info, logging out.', error);
//                 // Nếu token không hợp lệ (bị server từ chối) -> logout
//                 logout();
//             }
//         } else {
//
//             // Không có token, đảm bảo trạng thái đã logout
//             setUser(null);
//             setIsAuthenticated(false);
//         }
//         setLoading(false); // Kết thúc loading
//     }, [token]);
//
//     useEffect(() => {
//         fetchUser();
//     }, [fetchUser]);
//
//     // Hàm login: lưu token và fetch lại thông tin user
//     const login = (apiToken) => {
//
//         localStorage.setItem('authToken', apiToken);
//         setToken(apiToken);
//         setIsAuthenticated(true);
//         // useEffect sẽ tự động chạy fetchUser() khi token thay đổi
//
//     };
//
//     // Hàm logout: xóa token và thông tin user
//     const logout = () => {
//         // Gọi API logout của backend (không bắt buộc phải chờ, nhưng nên gọi)
//         axiosClient.post('/access/logout').catch(err => console.error("API Logout failed", err));
//
//         localStorage.removeItem('authToken');
//         setToken(null);
//         setUser(null);
//         setIsAuthenticated(false);
//     };
//
//     // Giá trị cung cấp bởi Context
//     const contextValue = {
//         token,
//         user,
//         isAuthenticated,
//         loading, // Cung cấp loading state
//         login,
//         logout,
//     };
//
//     return (
//         <AuthContext.Provider value={contextValue}>
//             {children}
//         </AuthContext.Provider>
//     );
// };


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


