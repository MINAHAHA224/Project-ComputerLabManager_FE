import axiosClient from "../config/axiosClient";

const creditClassApi = {
    // GET /creditClassManagement
    getAll: () => {
        const url = '/creditClassManagement';
        return axiosClient.get(url);
    },

    // GET /creditClassManagement/subject
    getSubjects: () => {
        const url = '/creditClassManagement/subject';
        return axiosClient.get(url);
    },

    // GET /creditClassManagement/class
    getClasses: () => {
        const url = '/creditClassManagement/class';
        return axiosClient.get(url);
    },

    // GET /creditClassManagement/teacher?codeSubject=...
    getTeachersBySubject: (subjectCode) => {
        const url = `/creditClassManagement/teacher?codeSubject=${subjectCode}`;
        return axiosClient.get(url);
    },

    // POST /creditClassManagement/create
    create: (data) => {
        const url = '/creditClassManagement/create';
        return axiosClient.post(url, data);
    },

    // GET /creditClassManagement/update/{id}
    getById: (id) => {
        const url = `/creditClassManagement/update/${id}`;
        return axiosClient.get(url);
    },

    // POST /creditClassManagement/update
    update: (data) => {
        const url = '/creditClassManagement/update';
        return axiosClient.post(url, data);
    },

    // POST /creditClassManagement/delete/{id}
    // Backend dùng POST cho delete, ta tuân theo
    delete: (id) => {
        const url = `/creditClassManagement/delete/${id}`;
        return axiosClient.post(url);
    },


    getFullSchedules: () => {
        const url = '/creditClassManagement/schedules';
        return axiosClient.get(url);
    }
};

export default creditClassApi;