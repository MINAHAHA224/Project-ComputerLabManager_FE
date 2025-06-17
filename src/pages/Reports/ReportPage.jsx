// src/pages/Reports/ReportPage.jsx



import React, { useState, useEffect } from 'react'; // <<<--- THÊM useEffect
import { Card, DatePicker, Button, Table, Space, message, Typography, Select } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
// import dayjs from 'dayjs'; // không cần import này nữa nếu đã cài đặt

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Cập nhật props để nhận thêm bộ lọc tùy chỉnh
const ReportPage = ({ title, columns, onPreview, onDownload, extraFilters }) => {
    const [filters, setFilters] = useState({});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dùng useEffect để tải dữ liệu mặc định khi trang được mở
    useEffect(() => {
        handlePreview(true); // Gọi hàm xem trước với cờ 'isInitialLoad'
    }, []);

    const handleFilterChange = (key, value) => {
        // Nếu value là undefined (khi xóa lựa chọn trong Select), ta xóa key đó khỏi filter
        if (value === undefined) {
            const newFilters = { ...filters };
            delete newFilters[key];
            setFilters(newFilters);
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleDateChange = (dates) => {
        if (dates && dates.length === 2) {
            setFilters(prev => ({
                ...prev,
                fromDate: dates[0].format('YYYY-MM-DD'),
                toDate: dates[1].format('YYYY-MM-DD'),
            }));
        } else {
            const newFilters = { ...filters };
            delete newFilters.fromDate;
            delete newFilters.toDate;
            setFilters(newFilters);
        }
    };

    const handlePreview = async (isInitialLoad = false) => {
        setLoading(true);
        // Nếu là lần tải đầu tiên, dùng filter rỗng
        const currentFilters = isInitialLoad ? {} : filters;
        try {
            const response = await onPreview(currentFilters);
            setData(response.data || []);
            if (!isInitialLoad) {
                message.success("Lọc và xem trước dữ liệu thành công!");
            }
        } catch (error) {
            message.error("Lỗi khi xem trước báo cáo!");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            // Luôn dùng bộ lọc hiện tại để tải về
            const response = await onDownload(filters);
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title.replace(/\s/g, '_')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            message.success("Tải báo cáo thành công!");
        } catch (error) {
            message.error("Lỗi khi tải báo cáo!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Title level={3}>{title}</Title>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
                <Space wrap>
                    <RangePicker onChange={handleDateChange} />

                    {/* Render các bộ lọc tùy chỉnh được truyền vào */}
                    {extraFilters && extraFilters.map(filter => (
                        <Select
                            key={filter.key}
                            placeholder={filter.placeholder}
                            style={{ width: 200 }}
                            onChange={(value) => handleFilterChange(filter.key, value)}
                            allowClear
                        >
                            {filter.options.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    ))}

                    <Button type="primary" icon={<SearchOutlined />} onClick={() => handlePreview(false)}>Lọc</Button>
                    <Button icon={<DownloadOutlined />} onClick={handleDownload} disabled={data.length === 0}>Tải Excel</Button>
                </Space>
            </Space>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                bordered
                rowKey={(record, index) => record.id || record.calendarId || index}
                scroll={{ x: true }}
            />
        </Card>
    );
};

export default ReportPage;