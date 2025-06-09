import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Typography, Spin, message } from 'antd';
import creditClassApi from '../../api/creditClassApi';

const { Title } = Typography;

const TeachingSchedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await creditClassApi.getFullSchedules();
                setScheduleData(response.data || []);
            } catch (error) {
                message.error("Lỗi khi tải dữ liệu lịch giảng dạy!");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const processedData = useMemo(() => {
        const result = [];
        scheduleData.forEach((creditClass, creditClassIndex) => {
            if (creditClass.scheduleDetails && creditClass.scheduleDetails.length > 0) {
                creditClass.scheduleDetails.forEach((detail, detailIndex) => {
                    result.push({
                        key: `${creditClass.maMh}-${detailIndex}`,
                        ...creditClass,
                        ...detail,
                        isFirstRow: detailIndex === 0,
                        rowSpan: creditClass.scheduleDetails.length,
                    });
                });
            } else {
                // Hiển thị cả những lớp chưa có lịch
                result.push({
                    key: `${creditClass.maMh}-no-schedule`,
                    ...creditClass,
                    isFirstRow: true,
                    rowSpan: 1,
                    thu: 'N/A', // Các trường chi tiết để trống
                });
            }
        });
        return result;
    }, [scheduleData]);

    const columns = [
        {
            title: 'Mã MH', dataIndex: 'maMh',
            onCell: record => ({ rowSpan: record.isFirstRow ? record.rowSpan : 0 }),
        },
        {
            title: 'Tên môn học', dataIndex: 'tenMh',
            onCell: record => ({ rowSpan: record.isFirstRow ? record.rowSpan : 0 }),
        },
        {
            title: 'Nhóm tổ', dataIndex: 'nhomTo',
            onCell: record => ({ rowSpan: record.isFirstRow ? record.rowSpan : 0 }),
        },
        {
            title: 'Số tín chỉ', dataIndex: 'soTinChi',
            onCell: record => ({ rowSpan: record.isFirstRow ? record.rowSpan : 0 }),
        },
        {
            title: 'Lớp', dataIndex: 'lop',
            onCell: record => ({ rowSpan: record.isFirstRow ? record.rowSpan : 0 }),
        },
        // Các cột chi tiết không gộp
        { title: 'Thứ', dataIndex: 'thu' },
        { title: 'Tiết bắt đầu', dataIndex: 'tietBatDau' },
        { title: 'Số tiết', dataIndex: 'soTiet' },
        { title: 'Phòng', dataIndex: 'phong' },
        { title: 'Giảng viên', dataIndex: 'giangVien' },
        { title: 'Thời gian học', dataIndex: 'thoiGianHoc' },
    ];

    return (
        <Card>
            <Title level={3}>Tổng quan Lịch giảng dạy Thực hành</Title>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={processedData}
                    bordered
                    pagination={false} // Tắt phân trang nếu muốn hiển thị tất cả
                />
            </Spin>
        </Card>
    );
};

export default TeachingSchedule;