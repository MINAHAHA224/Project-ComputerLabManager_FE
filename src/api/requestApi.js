import axiosClient from "../config/axiosClient";

const requestApi = {
    // === API cho GV ===
    // GET /requestTickets
    getMyRequests: () => {
        return axiosClient.get('/requestTickets');
    },

    // GET /requestTickets/{idTicketRequest}
    getMyRequestById: (id) => {
        return axiosClient.get(`/requestTickets/${id}`);
    },

    // DELETE /requestTickets/delete/{idTicketRequest}
    deleteMyRequest: (id) => {
        return axiosClient.delete(`/requestTickets/delete/${id}`);
    },

    // GET /requestChangeCalendar/{calendarId}
    getDataForChangeCalendar: (calendarId) => {
        return axiosClient.get(`/requestChangeCalendar/${calendarId}`);
    },

    // POST /requestChangeCalendar
    createChangeCalendarRequest: (data) => {
        return axiosClient.post('/requestChangeCalendar', data);
    },

    // GET /requestRentRoom
    getDataForRentRoom: () => {
        return axiosClient.get('/requestRentRoom');
    },

    // POST /requestRentRoom
    createRentRoomRequest: (data) => {
        return axiosClient.post('/requestRentRoom', data);
    },

    // GET /requestChangeRoom/{calendarId}
    getDataForChangeRoom: (calendarId) => {
        return axiosClient.get(`/requestChangeRoom/${calendarId}`);
    },

    // POST /requestChangeRoom
    createChangeRoomRequest: (data) => {
        return axiosClient.post('/requestChangeRoom', data);
    },

    // === API cho Quản lý (GVU, CSVC, TK) ===
    // GET /requestManagement
    getRequestsForManager: () => {
        return axiosClient.get('/requestManagement');
    },

    // GET /requestManagement/{ticketId}
    getRequestByIdForManager: (id) => {
        return axiosClient.get(`/requestManagement/${id}`);
    },

    // POST /processChangeCalendar (TK)
    processChangeCalendar: (data) => {
        return axiosClient.post('/processChangeCalendar', data);
    },

    // POST /processChangeRoom (CSVC)
    processChangeRoom: (data) => {
        return axiosClient.post('/processChangeRoom', data);
    },

    // POST /processRentRoom (GVU)
    processRentRoom: (data) => {
        return axiosClient.post('/processRentRoom', data);
    },

    // === API cho Thông báo ===
    // GET /notification
    getNotifications: () => {
        return axiosClient.get('/notification');
    },

    // POST /notification/{notificationId}
    markNotificationAsRead: (id) => {
        return axiosClient.post(`/notification/${id}`);
    },

    // DELETE /notification/delete/{notificationId}
    deleteNotification: (id) => {
        return axiosClient.delete(`/notification/delete/${id}`);
    },
};

export default requestApi;