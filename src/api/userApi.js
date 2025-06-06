import axiosClient from '../config/axiosClient';

const userApi = {
    getProfile: () => {
        return axiosClient.get('/profile');
    },

    updateProfile: (data) => {
        return axiosClient.post('/profile', data);
    }
    // Thêm các API khác cho user management nếu cần
};

export default userApi;