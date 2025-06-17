// src/pages/Reports/RoomReport.jsx


import React from 'react';
import ReportPage from './ReportPage';
import reportApi from '../../api/reportApi';

const roomColumns = [
    { title: 'ID Phòng', dataIndex: 'id', key: 'id' },
    { title: 'Tên phòng', dataIndex: 'nameRoom', key: 'nameRoom' },
    { title: 'Cơ sở', dataIndex: 'facility', key: 'facility' },
    { title: 'Tổng số máy', dataIndex: 'numberOfComputers', key: 'numberOfComputers' },
    { title: 'Số máy hoạt động', dataIndex: 'numberOfComputerActive', key: 'numberOfComputerActive' },
];

const RoomReport = () => {
    // Dữ liệu cơ sở này nên được lấy từ API, nhưng ta tạm hard-code
    const facilityOptions = [
        { value: 1, label: 'Quận 1' },
        { value: 2, label: 'Quận 9' },
    ];

    // Tạo cấu trúc cho bộ lọc tùy chỉnh
    const roomExtraFilters = [
        {
            key: 'facilityId',
            placeholder: 'Lọc theo cơ sở',
            options: facilityOptions,
        }
    ];

    // Cần hàm onPreview mới để lọc dữ liệu ở phía client
    // vì backend chưa hỗ trợ lọc phòng theo cơ sở
    const handleRoomPreview = async (filters) => {
        // Luôn gọi API để lấy toàn bộ dữ liệu gốc
        const response = await reportApi.getRoomPreview({});

        let filteredData = response.data || [];

        // Lọc phía client nếu có filter
        if (filters.facilityId) {
            const selectedFacilityName = facilityOptions.find(f => f.value === filters.facilityId)?.label;
            filteredData = filteredData.filter(room => room.facility === selectedFacilityName);
        }

        // Trả về dữ liệu đã lọc với cấu trúc giống response API
        return { ...response, data: filteredData };
    };

    return (
        <ReportPage
            title="Báo cáo Phòng máy"
            columns={roomColumns}
            onPreview={handleRoomPreview}
            onDownload={reportApi.downloadRoomReport}
            extraFilters={roomExtraFilters}
        />
    );
};

export default RoomReport;