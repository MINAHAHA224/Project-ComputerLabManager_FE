import axiosClient from "../config/axiosClient";

const calendarApi = {
    // GET /calendarManagement
    getAll: () => {
        const url = '/calendarManagement';
        return axiosClient.get(url);
    },
    getForManagement: () => {
        const url = '/calendarManagement';
        return axiosClient.get(url);
    },

    // API cho tất cả người dùng đã đăng nhập (GV, CSVC, TK...)
    getForUser: () => {
        const url = '/calendar'; // <<<--- API ĐÚNG
        return axiosClient.get(url);
    },

    // THÊM HÀM MỚI Ở ĐÂY
    getWeeksForUpdate: (calendarId) => {
        const url = `/calendarManagement/getWeekUpdate/${calendarId}`;
        return axiosClient.get(url);
    },



    // GET /calendarManagement/create
    getCreateData: () => {
        const url = '/calendarManagement/create';
        return axiosClient.get(url);
    },

    // GET /calendarManagement/{semesterYear}
    getWeeksBySemester: (semesterYear) => {
        const url = `/calendarManagement/${semesterYear}`;
        return axiosClient.get(url);
    },

    // POST /calendarManagement/createAuto
    createAuto: (data) => {
        const url = '/calendarManagement/createAuto';
        return axiosClient.post(url, data);
    },

    // POST /calendarManagement/createNoAuto
    createManual: (data) => {
        const url = '/calendarManagement/createNoAuto';
        return axiosClient.post(url, data);
    },

    // GET /calendarManagement/update/{id}
    getById: (id) => {
        const url = `/calendarManagement/update/${id}`;
        return axiosClient.get(url);
    },

    // POST /calendarManagement/update
    update: (data) => {
        const url = '/calendarManagement/update';
        return axiosClient.post(url, data);
    },

    // DELETE /calendarManagement/delete/{id}
    delete: (id) => {
        const url = `/calendarManagement/delete/${id}`;
        return axiosClient.delete(url);
    },

    // API mới
    deleteCluster: (calendarId) => {
        const url = `/calendarManagement/delete-cluster/${calendarId}`;
        return axiosClient.delete(url);
    },
};

export default calendarApi;