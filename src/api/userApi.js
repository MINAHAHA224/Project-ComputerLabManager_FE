// src/api/userApi.js

import axiosClient from '../config/axiosClient';

const userApi = {
    getProfile: () => {
        return axiosClient.get('/profile');
    },

    updateProfile: (data) => {
        return axiosClient.post('/profile', data);
    },
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('image', file); // 'image' phải khớp với @RequestParam("image")

        return axiosClient.post('/profile/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    // Thêm các API khác cho user management nếu cần
};

export default userApi;