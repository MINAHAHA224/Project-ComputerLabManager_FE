import axiosClient from '../config/axiosClient';

const authApi = {
    login: (payload) => {
        return axiosClient.post('/access/login', payload);
    },

    forgotPassword: (email) => {
        // API dùng @RequestParam nên ta truyền vào URL
        return axiosClient.post(`/access/forgotPassword?email=${email}`);
    },

    logout: () => {
        return axiosClient.post('/access/logout');
    },

  // API Mới
    faceLogin: (userCode) => {
    // Gửi request POST với userCode trong params
    return axiosClient.post(`/access/face-login?userCode=${userCode}`);
  }
};

export default authApi;