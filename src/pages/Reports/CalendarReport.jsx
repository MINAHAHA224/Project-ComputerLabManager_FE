// // src/pages/Reports/CalendarReport.jsx
//
// import React from 'react';
// import ReportPage from './ReportPage';
// import reportApi from '../../api/reportApi';
//
// const calendarColumns = [
//     { title: 'ID Lịch', dataIndex: 'calendarId', key: 'calendarId' },
//     { title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject' },
//     { title: 'Giáo viên', dataIndex: 'nameTeacher', key: 'nameTeacher' },
//     { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom' },
//     { title: 'Ngày', dataIndex: 'date', key: 'date' },
//     { title: 'Thứ', dataIndex: 'day', key: 'day' },
//     { title: 'Trạng thái', dataIndex: 'statusCalendar', key: 'statusCalendar' },
// ];
//
// const CalendarReport = () => {
//     return (
//         <ReportPage
//             title="Báo cáo Lịch thực hành"
//             columns={calendarColumns}
//             onPreview={reportApi.getCalendarPreview}
//             onDownload={reportApi.downloadCalendarReport}
//         />
//     );
// };
//
// export default CalendarReport;


// src/pages/Reports/CalendarReport.jsx

import React from 'react';
import ReportPage from './ReportPage';
import reportApi from '../../api/reportApi';
import { Tag } from 'antd'; // Import Tag component

// Hàm để xác định CSS class cho mỗi dòng
const getRowClassName = (record) => {
  if (record.statusCalendar === 'Đang hoạt động') {
    return 'table-row-active';
  }
  if (record.statusCalendar === 'Dừng hoạt động') {
    return 'table-row-inactive';
  }
  return ''; // Không có class đặc biệt
};

// Cập nhật lại định nghĩa cột
const calendarColumns = [
  { title: 'ID Lịch', dataIndex: 'calendarId', key: 'calendarId' },
  { title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject' },
  { title: 'Giáo viên', dataIndex: 'nameTeacher', key: 'nameTeacher' },
  { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom' },
  { title: 'Ngày', dataIndex: 'date', key: 'date' },
  { title: 'Thứ', dataIndex: 'day', key: 'day' },
  {
    title: 'Trạng thái',
    dataIndex: 'statusCalendar',
    key: 'statusCalendar',
    // Dùng render để hiển thị Tag màu cho đẹp
    render: (status) => {
      if (status === 'Đang hoạt động') {
        return <Tag color="green">Đang hoạt động</Tag>;
      }
      if (status === 'Dừng hoạt động') {
        return <Tag color="red">Dừng hoạt động</Tag>;
      }
      return <Tag>{status}</Tag>;
    },
  },
];

const CalendarReport = () => {
  return (
    <ReportPage
      title="Báo cáo Lịch thực hành"
      columns={calendarColumns}
      onPreview={reportApi.getCalendarPreview}
      onDownload={reportApi.downloadCalendarReport}
      // Truyền hàm xác định class vào đây
      rowClassName={getRowClassName}
    />
  );
};

export default CalendarReport;