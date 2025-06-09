import React, { useState, useEffect } from 'react';
import {Table, Button, Space, Modal, Form, Select, Input, InputNumber, message, Card, Typography, App} from 'antd';
import { EditOutlined, SwapOutlined } from '@ant-design/icons';
import calendarApi from '../../api/calendarApi';
import requestApi from '../../api/requestApi';

const { Title } = Typography;
const { Option } = Select;

const CalendarView = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(''); // 'change-schedule' hoặc 'change-room'
    const [currentCalendar, setCurrentCalendar] = useState(null);
    const { message } = App.useApp();
    const DURATION = 5;
    // State cho dữ liệu dropdowns tĩnh
    const [formOptions, setFormOptions] = useState({ day: [], practiceCase: [] });
    // State cho dropdown Tuần học (động)
    const [weeksForEdit, setWeeksForEdit] = useState([]);
    const [form] = Form.useForm();

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await calendarApi.getForUser();
            setSchedules(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải lịch thực hành!', DURATION);
        } finally {
            setLoading(false);
        }
    };

    // Hàm riêng để lấy dữ liệu tĩnh cho các form
    const fetchFormOptions = async () => {
        try {
            const response = await requestApi.getDataForRentRoom(); // Tái sử dụng API này để lấy Day và PracticeCase
            if (response.data) {
                setFormOptions({
                    day: response.data.day || [],
                    practiceCase: response.data.practiceCase || []
                });
            }
        } catch(e) {
            message.error("Lỗi khi tải dữ liệu form!", DURATION);
        }
    }

    useEffect(() => {
        fetchSchedules();
        fetchFormOptions(); // Gọi hàm lấy dữ liệu tĩnh
    }, []);

    const handleOpenModal = async (type, record) => {
        setModalType(type);
        setCurrentCalendar(record);
        form.resetFields();
        setWeeksForEdit([]); // Reset danh sách tuần cũ

        // Chỉ gọi API lấy tuần khi là "Đổi lịch"
        if (type === 'change-schedule') {
            try {
                const weeksResponse = await calendarApi.getWeeksForUpdate(record.calendarId);
                setWeeksForEdit(weeksResponse.data || []);
            } catch(error) {
                message.error("Lỗi khi tải danh sách tuần hợp lệ!", DURATION);
            }
        }

        // Luôn mở modal dù có lỗi tải tuần hay không
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setCurrentCalendar(null);
    };

    const handleSubmitRequest = async (values) => {
        try {
            let responseMessage = '';
            if (modalType === 'change-schedule') {
                const payload = {
                    calendarIdToChange: currentCalendar.calendarId,
                    ...values
                };
                const res = await requestApi.createChangeCalendarRequest(payload);
                responseMessage = res.message;
            } else { // 'change-room'
                const payload = {
                    calendarId: currentCalendar.calendarId,
                    purposeUse: values.purposeUse // Chỉ cần lý do
                };
                const res = await requestApi.createChangeRoomRequest(payload);
                responseMessage = res.message;
            }
            message.success(responseMessage || 'Đã gửi yêu cầu thành công!', DURATION);
            handleCancel();
        } catch (error) {
            message.error(error.message || "Gửi yêu cầu thất bại!", DURATION);
        }
    };

    const columns = [
        { title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject' },
        { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom' },
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        { title: 'Thứ', dataIndex: 'day', key: 'day' },
        { title: 'Tiết BĐ', dataIndex: 'lessonBegin', key: 'lessonBegin' },
        { title: 'Số tiết', dataIndex: 'lesson', key: 'lesson' },
        { title: 'Trạng thái', dataIndex: 'statusCalendar', key: 'statusCalendar' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal('change-schedule', record)}>
                        Đổi lịch
                    </Button>
                    <Button icon={<SwapOutlined />} onClick={() => handleOpenModal('change-room', record)}>
                        Đổi phòng
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Title level={3}>Lịch thực hành của tôi</Title>
            <Table columns={columns} dataSource={schedules} loading={loading} rowKey="calendarId" bordered />

            <Modal
                title={modalType === 'change-schedule' ? 'Yêu cầu Đổi lịch' : 'Yêu cầu Đổi phòng'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose // Reset form state khi đóng
            >
                <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
                    {modalType === 'change-schedule' ? (
                        <>
                            <Form.Item name="newWeekSemesterId" label="Tuần học mới" rules={[{ required: true }]}>
                                <Select placeholder="Chọn tuần học" disabled={weeksForEdit.length === 0}>
                                    {weeksForEdit.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="newDayId" label="Thứ mới" rules={[{ required: true }]}>
                                <Select placeholder="Chọn thứ">
                                    {formOptions.day.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="newPracticeCaseBeginId" label="Tiết bắt đầu mới" rules={[{ required: true }]}>
                                <Select placeholder="Chọn tiết">
                                    {formOptions.practiceCase.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </>
                    ) : null}

                    <Form.Item
                        name={modalType === 'change-schedule' ? 'newPurposeUse' : 'purposeUse'}
                        label="Lý do / Ghi chú"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginTop: '16px' }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Gửi yêu cầu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CalendarView;




// import React, { useState, useEffect, useMemo } from 'react';
// import {Select, Button, Spin, message, Modal, Space, Card, Typography} from 'antd';
// import { PrinterOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
// import './CalendarView.css';
// import calendarApi from '../../api/calendarApi'; // API lấy lịch
// import requestApi from '../../api/requestApi';
// import Title from "antd/es/skeleton/Title.js"; // API cho các tác vụ
//
// const { Option } = Select;
// const TOTAL_LESSONS = 14;
//
// // --- Component con cho một ô lịch ---
// const ScheduleBlock = ({ schedule, onClick }) => {
//     const isOff = schedule.statusCalendar === 'OFF';
//     return (
//         <div
//             className={`schedule-block ${isOff ? 'schedule-block-off' : ''}`}
//             onClick={() => onClick(schedule)}
//         >
//             <div className="subject" title={schedule.nameSubject}>
//                 {schedule.nameSubject || 'Lịch Mượn Phòng'}
//             </div>
//             <div className="details">
//                 Phòng: {schedule.nameRoom} <br/>
//                 GV: {schedule.nameTeacher} <br/>
//                 {schedule.combination && `Tổ hợp: ${schedule.combination.trim()}`}
//             </div>
//         </div>
//     );
// };
//
// // --- Component chính ---
// const CalendarView = () => {
//     const [allSchedules, setAllSchedules] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [semesters, setSemesters] = useState([]);
//     const [weeks, setWeeks] = useState([]);
//     const [selectedSemester, setSelectedSemester] = useState(null);
//     const [selectedWeekId, setSelectedWeekId] = useState(null);
//     const [isActionModalVisible, setIsActionModalVisible] = useState(false);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//
//     // --- Fetch Data ---
//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const [scheduleRes, createDataRes] = await Promise.all([
//                 calendarApi.getAll(),
//                 calendarApi.getCreateData()
//             ]);
//             setAllSchedules(scheduleRes.data || []);
//             setSemesters(createDataRes.data.semesterYears || []);
//         } catch (error) {
//             message.error("Lỗi tải dữ liệu lịch!");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     useEffect(() => {
//         fetchData();
//     }, []);
//
//     const handleSemesterChange = async (value) => {
//         setSelectedSemester(value);
//         setSelectedWeekId(null);
//         setWeeks([]);
//         if (value) {
//             try {
//                 const response = await calendarApi.getWeeksBySemester(value);
//                 setWeeks(response.data || []);
//             } catch (error) {
//                 message.error("Lỗi tải danh sách tuần!");
//             }
//         }
//     };
//
//     // --- Logic chuyển đổi dữ liệu ---
//     const gridData = useMemo(() => {
//         const grid = Array.from({ length: TOTAL_LESSONS }, () => Array(7).fill(null));
//
//         if (!selectedWeekId || !allSchedules.length) return grid;
//
//         const selectedWeek = weeks.find(w => w.idWeekTime === selectedWeekId);
//         if (!selectedWeek) return grid;
//
//         // Lọc lịch thuộc tuần đã chọn
//         const weekSchedules = allSchedules.filter(s => s.date.split('-').reverse().join('-') >= selectedWeek.time.split(' ')[2] && s.date.split('-').reverse().join('-') <= selectedWeek.time.split(' ')[4]);
//
//         weekSchedules.forEach(schedule => {
//             const day = parseInt(schedule.day, 10);
//             const startLesson = parseInt(schedule.lessonBegin, 10);
//             const lessonSpan = parseInt(schedule.lesson, 10);
//
//             if (day >= 2 && day <= 8 && startLesson >= 1 && startLesson <= TOTAL_LESSONS) {
//                 const colIndex = day - 2; // Thứ 2 -> index 0
//                 const rowIndex = startLesson - 1;
//
//                 if (grid[rowIndex][colIndex] === null) {
//                     grid[rowIndex][colIndex] = { ...schedule, rowspan: lessonSpan };
//                     for (let i = 1; i < lessonSpan; i++) {
//                         if (rowIndex + i < TOTAL_LESSONS) {
//                             grid[rowIndex + i][colIndex] = { spanned: true };
//                         }
//                     }
//                 }
//             }
//         });
//         return grid;
//     }, [allSchedules, selectedWeekId, weeks]);
//
//     // --- Handlers ---
//     const handleScheduleClick = (schedule) => {
//         setSelectedSchedule(schedule);
//         setIsActionModalVisible(true);
//     };
//
//     const handleModalClose = () => {
//         setIsActionModalVisible(false);
//         setSelectedSchedule(null);
//     };
//
//     const handleNavigateWeek = (direction) => {
//         const currentIndex = weeks.findIndex(w => w.idWeekTime === selectedWeekId);
//         if(currentIndex === -1) return;
//
//         const newIndex = currentIndex + direction;
//         if(newIndex >= 0 && newIndex < weeks.length) {
//             setSelectedWeekId(weeks[newIndex].idWeekTime);
//         }
//     }
//
//     const selectedWeekInfo = weeks.find(w => w.idWeekTime === selectedWeekId)?.time || 'Chọn tuần để hiển thị';
//
//     return (
//         <div className="timetable-container">
//             <Title level={3}>Thời Khóa Biểu</Title>
//             <div className="timetable-controls">
//                 <Select
//                     placeholder="Chọn học kỳ - năm học"
//                     style={{ width: 250 }}
//                     value={selectedSemester}
//                     onChange={handleSemesterChange}
//                 >
//                     {semesters.map(s => <Option key={s.idSemesterYear} value={s.idSemesterYear}>{s.content}</Option>)}
//                 </Select>
//                 <Select
//                     placeholder="Chọn tuần"
//                     style={{ width: 350 }}
//                     value={selectedWeekId}
//                     onChange={setSelectedWeekId}
//                     disabled={!weeks.length}
//                 >
//                     {weeks.map(w => <Option key={w.idWeekTime} value={w.idWeekTime}>{w.time}</Option>)}
//                 </Select>
//                 <Button icon={<PrinterOutlined />}>In</Button>
//             </div>
//
//             <Spin spinning={loading}>
//                 <Space style={{marginBottom: '10px', width: '100%', justifyContent: 'space-between'}}>
//                     <Button icon={<LeftOutlined/>} onClick={() => handleNavigateWeek(-1)} disabled={!selectedWeekId || weeks.findIndex(w => w.idWeekTime === selectedWeekId) === 0}>Trước</Button>
//                     <Typography.Text strong>{selectedWeekInfo}</Typography.Text>
//                     <Button onClick={() => handleNavigateWeek(1)} disabled={!selectedWeekId || weeks.findIndex(w => w.idWeekTime === selectedWeekId) === weeks.length - 1}>Sau <RightOutlined/></Button>
//                 </Space>
//                 <table className="timetable">
//                     <thead>
//                     <tr>
//                         <th className="timetable-time-header">Tiết</th>
//                         {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(day => (
//                             <th key={day} className="timetable-day-header">{day}</th>
//                         ))}
//                     </tr>
//                     </thead>
//                     <tbody>
//                     {gridData.map((row, rowIndex) => (
//                         <tr key={rowIndex}>
//                             <td><div className="time-slot">Tiết {rowIndex + 1}</div></td>
//                             {row.map((cell, colIndex) => {
//                                 if (cell?.spanned) return null;
//                                 return (
//                                     <td key={colIndex} rowSpan={cell?.rowspan || 1} className="timetable-cell">
//                                         {cell && <ScheduleBlock schedule={cell} onClick={handleScheduleClick} />}
//                                     </td>
//                                 );
//                             })}
//                         </tr>
//                     ))}
//                     </tbody>
//                 </table>
//             </Spin>
//
//             {/* Modal hiển thị tác vụ */}
//             <Modal
//                 title="Tác vụ cho Lịch"
//                 open={isActionModalVisible}
//                 onCancel={handleModalClose}
//                 footer={[<Button key="close" onClick={handleModalClose}>Đóng</Button>]}
//             >
//                 {selectedSchedule && (
//                     <div>
//                         <p><strong>Môn học:</strong> {selectedSchedule.nameSubject}</p>
//                         <p><strong>Phòng:</strong> {selectedSchedule.nameRoom}</p>
//                         <p><strong>Ngày:</strong> {selectedSchedule.date}</p>
//                         <p>Vui lòng quay lại trang **Lịch thực hành** để thực hiện các tác vụ đổi lịch/đổi phòng.</p>
//                         {/* Trong thực tế, bạn sẽ import form đổi lịch/đổi phòng vào đây */}
//                     </div>
//                 )}
//             </Modal>
//         </div>
//     );
// };
//
// export default CalendarView;
