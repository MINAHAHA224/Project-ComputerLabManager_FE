import axiosClient from "../config/axiosClient";

const calendarApi = {
    // GET /calendarManagement
    getAll: () => {
        const url = '/calendarManagement';
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
};

export default calendarApi;