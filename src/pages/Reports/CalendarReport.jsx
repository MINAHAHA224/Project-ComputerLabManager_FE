import React from 'react';
import ReportPage from './ReportPage';
import reportApi from '../../api/reportApi';

const calendarColumns = [
    { title: 'ID Lịch', dataIndex: 'calendarId', key: 'calendarId' },
    { title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject' },
    { title: 'Giáo viên', dataIndex: 'nameTeacher', key: 'nameTeacher' },
    { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom' },
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Thứ', dataIndex: 'day', key: 'day' },
    { title: 'Trạng thái', dataIndex: 'statusCalendar', key: 'statusCalendar' },
];

const CalendarReport = () => {
    return (
        <ReportPage
            title="Báo cáo Lịch thực hành"
            columns={calendarColumns}
            onPreview={reportApi.getCalendarPreview}
            onDownload={reportApi.downloadCalendarReport}
        />
    );
};

export default CalendarReport;