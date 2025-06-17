// src/api/reportApi.js

import axiosClient from "../config/axiosClient";

const reportApi = {
    getCalendarPreview: (filters) => {
        return axiosClient.post('/api/reports/calendar/preview', filters);
    },
    downloadCalendarReport: (filters) => {
        return axiosClient.post('/api/reports/calendar/download', filters, {
            responseType: 'blob', // Quan trọng: nhận response là một file
        });
    },
    getRoomPreview: (filters) => {
        return axiosClient.post('/api/reports/room/preview', filters);
    },
    downloadRoomReport: (filters) => {
        return axiosClient.post('/api/reports/room/download', filters, {
            responseType: 'blob',
        });
    },
};

export default reportApi;