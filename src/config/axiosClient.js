// src/config/axiosClient.js

import axios from 'axios';

// Tạo một instance của Axios với cấu hình mặc định
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào mỗi request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        console.log("Token in interceptor:", token); // ✅ Thêm dòng này
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý lỗi response chung
axiosClient.interceptors.response.use(
    (response) => {
        // Trả về data từ response nếu request thành công
        return response.data;
    },
    (error) => {
        // Xử lý lỗi 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
        if (error.response && error.response.status === 401) {
            // Xóa token cũ và thông tin người dùng
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole'); // Chúng ta sẽ thêm cái này sau
            // Redirect về trang đăng nhập
            // window.location.href = '/login'; // sẽ làm ở phần routing để mượt hơn
            console.error("Unauthorized! Redirecting to login.");
        }
        // Trả về một promise bị reject với thông tin lỗi
        return Promise.reject(error.response ? error.response.data : error);
    }
);

export default axiosClient;