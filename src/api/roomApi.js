import axiosClient from "../config/axiosClient";

const roomApi = {
    // GET /roomManagement
    getAllRooms: () => {
        const url = '/roomManagement';
        return axiosClient.get(url);
    },

    // POST /roomManagement/create
    createRoom: (roomData) => {
        const url = '/roomManagement/create';
        return axiosClient.post(url, roomData);
    },

    // GET /roomManagement/update/{idRoom}
    getRoomById: (id) => {
        const url = `/roomManagement/update/${id}`;
        return axiosClient.get(url);
    },

    // POST /roomManagement/update
    updateRoom: (roomData) => {
        const url = '/roomManagement/update';
        return axiosClient.post(url, roomData);
    },

    // DELETE /roomManagement/delete/{idRoom}
    deleteRoom: (id) => {
        const url = `/roomManagement/delete/${id}`;
        return axiosClient.delete(url);
    },

    // API để lấy danh sách cơ sở (cần cho form)
    // Dựa vào các service khác, ta thấy không có API riêng để lấy Facility
    // Ta sẽ tạm giả định nó được lấy cùng lúc hoặc có API khác.
    // Nếu không, ta cần tạo 1 API bên backend để lấy list Facility.
    // Giả sử ta có API /facilities
    getAllFacilities: () => {
        // Chú ý: API này không có trong backend bạn gửi, tôi đang giả định.
        // Nếu không có, ta sẽ hard-code dữ liệu này trên FE hoặc bạn cần tạo API.
        // Dựa trên DB script, ta có CoSoID=1 (Quận 1) và CoSoID=2 (Quận 9)
        const url = '/facilities'; // API giả định
        return axiosClient.get(url);
    }
};

export default roomApi;