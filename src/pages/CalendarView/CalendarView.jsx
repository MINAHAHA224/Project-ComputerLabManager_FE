// import React, { useState, useEffect } from 'react';
// import {Table, Button, Space, Modal, Form, Select, Input, InputNumber, message, Card, Typography, App} from 'antd';
// import { EditOutlined, SwapOutlined } from '@ant-design/icons';
// import calendarApi from '../../api/calendarApi';
// import requestApi from '../../api/requestApi';
//
// const { Title } = Typography;
// const { Option } = Select;
//
// const CalendarView = () => {
//     const [schedules, setSchedules] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [modalType, setModalType] = useState(''); // 'change-schedule' hoặc 'change-room'
//     const [currentCalendar, setCurrentCalendar] = useState(null);
//     const { message } = App.useApp();
//     const DURATION = 5;
//     // State cho dữ liệu dropdowns tĩnh
//     const [formOptions, setFormOptions] = useState({ day: [], practiceCase: [] });
//     // State cho dropdown Tuần học (động)
//     const [weeksForEdit, setWeeksForEdit] = useState([]);
//     const [form] = Form.useForm();
//
//     const fetchSchedules = async () => {
//         setLoading(true);
//         try {
//             const response = await calendarApi.getForUser();
//             setSchedules(response.data || []);
//         } catch (error) {
//             message.error('Lỗi khi tải lịch thực hành!', DURATION);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // Hàm riêng để lấy dữ liệu tĩnh cho các form
//     const fetchFormOptions = async () => {
//         try {
//             const response = await requestApi.getDataForRentRoom(); // Tái sử dụng API này để lấy Day và PracticeCase
//             if (response.data) {
//                 setFormOptions({
//                     day: response.data.day || [],
//                     practiceCase: response.data.practiceCase || []
//                 });
//             }
//         } catch(e) {
//             message.error("Lỗi khi tải dữ liệu form!", DURATION);
//         }
//     }
//
//     useEffect(() => {
//         fetchSchedules();
//         fetchFormOptions(); // Gọi hàm lấy dữ liệu tĩnh
//     }, []);
//
//     const handleOpenModal = async (type, record) => {
//         setModalType(type);
//         setCurrentCalendar(record);
//         form.resetFields();
//         setWeeksForEdit([]); // Reset danh sách tuần cũ
//
//         // Chỉ gọi API lấy tuần khi là "Đổi lịch"
//         if (type === 'change-schedule') {
//             try {
//                 const weeksResponse = await calendarApi.getWeeksForUpdate(record.calendarId);
//                 setWeeksForEdit(weeksResponse.data || []);
//             } catch(error) {
//                 message.error("Lỗi khi tải danh sách tuần hợp lệ!", DURATION);
//             }
//         }
//
//         // Luôn mở modal dù có lỗi tải tuần hay không
//         setIsModalVisible(true);
//     };
//
//     const handleCancel = () => {
//         setIsModalVisible(false);
//         setCurrentCalendar(null);
//     };
//
//     const handleSubmitRequest = async (values) => {
//         try {
//             let responseMessage = '';
//             if (modalType === 'change-schedule') {
//                 const payload = {
//                     calendarIdToChange: currentCalendar.calendarId,
//                     ...values
//                 };
//                 const res = await requestApi.createChangeCalendarRequest(payload);
//                 responseMessage = res.message;
//             } else { // 'change-room'
//                 const payload = {
//                     calendarId: currentCalendar.calendarId,
//                     purposeUse: values.purposeUse // Chỉ cần lý do
//                 };
//
//                 const res = await requestApi.createChangeRoomRequest(payload);
//                 responseMessage = res.message;
//             }
//             message.success(responseMessage || 'Đã gửi yêu cầu thành công!', DURATION);
//             handleCancel();
//         } catch (error) {
//             message.error(error.message || "Gửi yêu cầu thất bại!", DURATION);
//         }
//     };
//
//     const columns = [
//         { title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject' },
//         { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom' },
//         { title: 'Ngày', dataIndex: 'date', key: 'date' },
//         { title: 'Thứ', dataIndex: 'day', key: 'day' },
//         { title: 'Tiết BĐ', dataIndex: 'lessonBegin', key: 'lessonBegin' },
//         { title: 'Số tiết', dataIndex: 'lesson', key: 'lesson' },
//         { title: 'Trạng thái', dataIndex: 'statusCalendar', key: 'statusCalendar' },
//         {
//             title: 'Hành động',
//             key: 'action',
//             render: (_, record) => (
//                 <Space>
//                     <Button icon={<EditOutlined />} onClick={() => handleOpenModal('change-schedule', record)}>
//                         Đổi lịch
//                     </Button>
//                     <Button icon={<SwapOutlined />} onClick={() => handleOpenModal('change-room', record)}>
//                         Đổi phòng
//                     </Button>
//                 </Space>
//             ),
//         },
//     ];
//
//     return (
//         <Card>
//             <Title level={3}>Lịch thực hành của tôi</Title>
//             <Table columns={columns} dataSource={schedules} loading={loading} rowKey="calendarId" bordered />
//
//             <Modal
//                 title={modalType === 'change-schedule' ? 'Yêu cầu Đổi lịch' : 'Yêu cầu Đổi phòng'}
//                 open={isModalVisible}
//                 onCancel={handleCancel}
//                 footer={null}
//                 destroyOnClose // Reset form state khi đóng
//             >
//                 <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
//                     {modalType === 'change-schedule' ? (
//                         <>
//                             <Form.Item name="newWeekSemesterId" label="Tuần học mới" rules={[{ required: true }]}>
//                                 <Select placeholder="Chọn tuần học" disabled={weeksForEdit.length === 0}>
//                                     {weeksForEdit.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}
//                                 </Select>
//                             </Form.Item>
//                             <Form.Item name="newDayId" label="Thứ mới" rules={[{ required: true }]}>
//                                 <Select placeholder="Chọn thứ">
//                                     {formOptions.day.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}
//                                 </Select>
//                             </Form.Item>
//                             <Form.Item name="newPracticeCaseBeginId" label="Tiết bắt đầu mới" rules={[{ required: true }]}>
//                                 <Select placeholder="Chọn tiết">
//                                     {formOptions.practiceCase.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}
//                                 </Select>
//                             </Form.Item>
//                         </>
//                     ) : null}
//
//                     <Form.Item
//                         name={modalType === 'change-schedule' ? 'newPurposeUse' : 'purposeUse'}
//                         label="Lý do / Ghi chú"
//                         rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
//                     >
//                         <Input.TextArea rows={3} />
//                     </Form.Item>
//
//                     <Form.Item style={{ textAlign: 'right', marginTop: '16px' }}>
//                         <Space>
//                             <Button onClick={handleCancel}>Hủy</Button>
//                             <Button type="primary" htmlType="submit">Gửi yêu cầu</Button>
//                         </Space>
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </Card>
//     );
// };
//
// export default CalendarView;
//
//
//
//
//
//
//



import React, { useState, useEffect, useMemo } from 'react';
import { Select, Button, Spin, message, Modal, Form, Input, Card, Typography, Tooltip, App, Tabs, Space, Row, Col } from 'antd';
import { PrinterOutlined, LeftOutlined, RightOutlined, EditOutlined, SwapOutlined } from '@ant-design/icons';
import './CalendarView.css';
import calendarApi from '../../api/calendarApi';
import requestApi from '../../api/requestApi';
import { useAuth } from '../../hooks/useAuth'; // <<< BƯỚC 1: IMPORT useAuth

const { Title, Text } = Typography;
const { Option } = Select;
const TOTAL_LESSONS = 14;

// --- Component con cho một ô lịch ---
// const ScheduleBlock = ({ schedule, onClick, userRole }) => {
//   const isOff = schedule.statusCalendar === 'OFF';
//
//   // Bây giờ isClickable sẽ hoạt động vì userRole đã được nhận từ props
//   const isClickable = userRole === 'GV' && !isOff;
//
//   const popoverContent = (
//     <div>
//       <p><strong>Môn học:</strong> {schedule.nameSubject || 'Lịch mượn phòng'}</p>
//       <p><strong>Phòng:</strong> {schedule.nameRoom}</p>
//       <p><strong>Ngày:</strong> {schedule.date}</p>
//       {schedule.group && <p><strong>Nhóm:</strong> {schedule.group.trim()}</p>}
//       {schedule.combination && <p><strong>Tổ:</strong> {schedule.combination.trim()}</p>}
//     </div>
//   );
//
//   return (
//     <Tooltip title={popoverContent} placement="right">
//       <div
//         className={`schedule-block ${isOff ? 'schedule-block-off' : ''}`}
//         style={{ cursor: isClickable ? 'pointer' : 'default' }}
//         onClick={isClickable ? () => onClick(schedule) : undefined}
//       >
//         <div className="subject" title={schedule.nameSubject}>
//           {schedule.nameSubject || 'Lịch Mượn Phòng'}
//         </div>
//         <div className="details">
//           Phòng: {schedule.nameRoom}
//         </div>
//       </div>
//     </Tooltip>
//   );
// };
const ScheduleBlock = ({ schedule, onClick, userRole }) => {
  const isOff = schedule.statusCalendar === 'OFF';
  const isClickable = userRole === 'GV' && !isOff;

  // === NỘI DUNG HIỂN THỊ TRONG TOOLTIP (MÀU ĐEN) ===
  const tooltipContent = (
    <div>
      {schedule.codeSubject && <p><strong>Mã MH:</strong> {schedule.codeSubject}</p>}
      <p><strong>Môn:</strong> {schedule.nameSubject || 'Lịch mượn phòng'}</p>
      {schedule.group && <p><strong>Nhóm:</strong> {schedule.group.trim()}</p>}
      {schedule.combination && <p><strong>Tổ:</strong> {schedule.combination.trim()}</p>}
      <p><strong>Phòng:</strong> {schedule.nameRoom}</p>
      <p><strong>Thứ {schedule.day} - Tiết {schedule.lessonBegin} - Số tiết: {schedule.lesson}</strong></p>
      <p><strong>GV:</strong> {schedule.nameTeacher}</p>
      {schedule.nameClassroom && <p><strong>Lớp:</strong> {schedule.nameClassroom}</p>}
      <p><strong>Ngày:</strong> {schedule.date}</p>
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="right" color="blue">
      <div
        className={`schedule-block ${isOff ? 'schedule-block-off' : ''}`}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
        onClick={isClickable ? () => onClick(schedule) : undefined}
      >
        {/* === NỘI DUNG HIỂN THỊ TRÊN Ô LỊCH (MÀU XANH) === */}
        <Text strong className="subject" title={schedule.nameSubject}>
          {schedule.nameSubject || 'Lịch Mượn Phòng'}
        </Text>
        <Text className="details" title={`Mã LTC: ${schedule.codeSubject || 'N/A'}`}>
         ( {schedule.codeSubject || ''} )
        </Text>
        <Text className="details" title={`Nhóm: ${schedule.group?.trim() || 'N/A'}`}>
          Nhóm: {schedule.group?.trim()}
        </Text>
        <Text className="details" title={`Phòng: ${schedule.nameRoom}`}>
          Phòng: {schedule.nameRoom}
        </Text>
        <Text className="details" title={`Giảng viên: ${schedule.nameTeacher}`}>
          GV: {schedule.nameTeacher}
        </Text>
      </div>
    </Tooltip>
  );
};



// --- Component chính ---
const CalendarView = () => {
  const { message } = App.useApp();
  const DURATION = 5;
// === BƯỚC 2: LẤY THÔNG TIN VAI TRÒ ===
  const { user } = useAuth();
  const userRoleMapping = {
    'Nhân viên phòng Giáo Vụ': 'GVU',
    'Nhân viên phòng Cơ sở vật chất': 'CSVC',
    'Giảng Viên': 'GV',
    'Trưởng khoa': 'TK'
  };
  const currentUserRole = user ? userRoleMapping[user.role] : null;
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [scheduleRes, createDataRes] = await Promise.all([
        calendarApi.getForUser(),
        calendarApi.getCreateData()
      ]);
      console.log("test1",scheduleRes.data);
      console.log("test2",createDataRes.data.semesterYear);

      setAllSchedules(scheduleRes.data || []);
      setSemesters(createDataRes.data.semesterYear || []);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu ban đầu!", DURATION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSemesterChange = async (value) => {
    setSelectedSemester(value);
    setSelectedWeekId(null);
    setWeeks([]);
    if (value) {
      try {
        const response = await calendarApi.getWeekStudyForCalendar(value);
        setWeeks(response.data || []);
      } catch (error) {
        message.error("Lỗi khi tải danh sách tuần!", DURATION);
      }
    }
  };

  // === LOGIC XỬ LÝ DỮ LIỆU SANG DẠNG LƯỚI ===
// === LOGIC XỬ LÝ DỮ LIỆU SANG DẠNG LƯỚI (ĐÃ SỬA LỖI SO SÁNH NGÀY) ===
// === LOGIC XỬ LÝ DỮ LIỆU SANG DẠNG LƯỚI (SỬA LỖI PHÂN TÍCH CHUỖI) ===
  const gridData = useMemo(() => {
    const grid = Array.from({ length: TOTAL_LESSONS }, () => Array(7).fill(null));
    if (!selectedWeekId || !allSchedules.length) return grid;

    const selectedWeek = weeks.find(w => w.idWeekTime === selectedWeekId);
    if (!selectedWeek) return grid;

    // Helper function để chuyển chuỗi dd-MM-yyyy thành đối tượng Date an toàn
    const parseDate = (dateString) => {
      const [day, month, year] = dateString.split('-');
      // new Date(year, monthIndex, day) là cách tạo date an toàn nhất
      const date = new Date(year, month - 1, day);
      date.setHours(0, 0, 0, 0); // Reset giờ về 0 để so sánh chỉ dựa trên ngày
      return date;
    };

    // === CÁCH PHÂN TÍCH CHUỖI AN TOÀN HƠN ===
    // Dùng regex để trích xuất cả 2 ngày trong một lần
    const dateRegex = /(\d{2}-\d{2}-\d{4})/g;
    const datesFound = selectedWeek.time.match(dateRegex);

    // Nếu không tìm thấy đúng 2 ngày, không làm gì cả
    if (!datesFound || datesFound.length < 2) {
      return grid;
    }

    const startDate = parseDate(datesFound[0]); // Ngày đầu tiên tìm được
    const endDate = parseDate(datesFound[1]);   // Ngày thứ hai tìm được

    const weekSchedules = allSchedules.filter(s => {
      if (!s.date) return false; // Bỏ qua lịch không có ngày
      const scheduleDate = parseDate(s.date);
      // Kiểm tra xem các date có hợp lệ không trước khi so sánh
      if (isNaN(scheduleDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return false;
      }
      return scheduleDate.getTime() >= startDate.getTime() && scheduleDate.getTime() <= endDate.getTime();
    });

    console.log("test3 - Lịch đã được lọc:", weekSchedules); // Log lại để kiểm tra
    weekSchedules.forEach(schedule => {
      const day = parseInt(schedule.day, 10);
      const startLesson = parseInt(schedule.lessonBegin, 10);
      const lessonSpan = parseInt(schedule.lesson, 10);

      if (day >= 2 && day <= 8 && startLesson >= 1 && startLesson <= TOTAL_LESSONS) {
        const colIndex = day - 2;
        const rowIndex = startLesson - 1;
        if (grid[rowIndex][colIndex] === null) {
          grid[rowIndex][colIndex] = { ...schedule, rowspan: lessonSpan };
          for (let i = 1; i < lessonSpan; i++) {
            if (rowIndex + i < TOTAL_LESSONS) {
              grid[rowIndex + i][colIndex] = { spanned: true };
            }
          }
        }
      }
    });
    // Phần logic điền vào grid giữ nguyên

    return grid;
  }, [allSchedules, selectedWeekId, weeks]);
  const handleScheduleClick = (schedule) => {
    if(schedule.statusCalendar === 'OFF') {
      message.warning("Không thể thao tác trên lịch đã nghỉ.");
      return;
    }
    setSelectedSchedule(schedule);
    setIsActionModalVisible(true);
  };

  const handleModalClose = () => {
    setIsActionModalVisible(false);
    setSelectedSchedule(null);
  };

  const handleNavigateWeek = (direction) => {
    const currentIndex = weeks.findIndex(w => w.idWeekTime === selectedWeekId);
    if(currentIndex === -1) return;
    const newIndex = currentIndex + direction;
    if(newIndex >= 0 && newIndex < weeks.length) {
      setSelectedWeekId(weeks[newIndex].idWeekTime);
    }
  };
  const selectedWeekInfo = weeks.find(w => w.idWeekTime === selectedWeekId)?.time || 'Chọn tuần để hiển thị';

  return (
    <div className="timetable-container">
      <Title level={3}>Lịch thực hành của tôi</Title>
      <div className="timetable-controls">
        <Select placeholder="Chọn học kỳ - năm học" style={{ width: 250 }} value={selectedSemester} onChange={handleSemesterChange}>
          {semesters.map(s => <Option key={s.idSemesterYear} value={s.idSemesterYear}>{s.content}</Option>)}
        </Select>
        <Select placeholder="Chọn tuần" style={{ width: 350 }} value={selectedWeekId} onChange={setSelectedWeekId} disabled={!weeks.length}>
          {weeks.map(w => <Option key={w.idWeekTime} value={w.idWeekTime}>{w.time}</Option>)}
        </Select>
        <Button icon={<PrinterOutlined />}>In</Button>
      </div>

      <Spin spinning={loading}>
        <Space style={{marginBottom: '10px', width: '100%', justifyContent: 'space-between'}}>
          <Button icon={<LeftOutlined/>} onClick={() => handleNavigateWeek(-1)} disabled={!selectedWeekId || weeks.findIndex(w => w.idWeekTime === selectedWeekId) === 0}>Trước</Button>
          <Typography.Text strong>{selectedWeekInfo}</Typography.Text>
          <Button onClick={() => handleNavigateWeek(1)} disabled={!selectedWeekId || weeks.findIndex(w => w.idWeekTime === selectedWeekId) === weeks.length - 1}>Sau <RightOutlined/></Button>
        </Space>
        <table className="timetable">
          <thead><tr><th className="timetable-time-header">Tiết</th>{['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(day => (<th key={day} className="timetable-day-header">{day}</th>))}</tr></thead>
          <tbody>{gridData.map((row, rowIndex) => (<tr key={rowIndex}><td><div className="time-slot">Tiết {rowIndex + 1}</div></td>{row.map((cell, colIndex) => {if (cell?.spanned) return null; return (<td key={colIndex} rowSpan={cell?.rowspan || 1} className="timetable-cell">{cell && <ScheduleBlock schedule={cell} onClick={handleScheduleClick} userRole={currentUserRole} />}</td>);})}</tr>))}</tbody>
        </table>
      </Spin>
      {currentUserRole === 'GV' && (
        <Modal title="Thực hiện Tác vụ" open={isActionModalVisible} onCancel={handleModalClose} footer={null} destroyOnClose width={600}>
          {selectedSchedule && (
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab={<><EditOutlined /> Đổi Lịch</>} key="1"><ChangeScheduleForm type="change-schedule" schedule={selectedSchedule} onCancel={handleModalClose} onSuccess={() => { handleModalClose(); fetchInitialData(); }} /></Tabs.TabPane>
              <Tabs.TabPane tab={<><SwapOutlined /> Đổi Phòng</>} key="2"><ChangeScheduleForm type="change-room" schedule={selectedSchedule} onCancel={handleModalClose} onSuccess={() => { handleModalClose(); fetchInitialData(); }} /></Tabs.TabPane>
            </Tabs>
          )}
        </Modal>
      )}

    </div>
  );
};

// Component con cho Form, có thể tách ra file riêng
const ChangeScheduleForm = ({ type, schedule, onCancel, onSuccess }) => {
  const { message } = App.useApp();
  const DURATION = 5;
  const [form] = Form.useForm();
  const [weeks, setWeeks] = useState([]);
  const [options, setOptions] = useState({ day: [], practiceCase: [] });

  useEffect(() => {
    async function loadData() {
      try {
        if (type === 'change-schedule') {
          const weeksRes = await calendarApi.getWeeksForUpdate(schedule.calendarId);
          setWeeks(weeksRes.data || []);
        }
        const optionsRes = await requestApi.getDataForRentRoom();
        setOptions({ day: optionsRes.data.day || [], practiceCase: optionsRes.data.practiceCase || [] });
      } catch(e) {
        message.error("Lỗi khi tải dữ liệu cho form!", DURATION);
      }
    }
    loadData();
  }, [schedule, type, message]);

  const handleSubmit = async (values) => {
    try {
      let responseMessage = '';
      if (type === 'change-schedule') {
        const payload = {
          calendarIdToChange: schedule.calendarId,
          newWeekSemesterId: values.newWeekSemesterId,
          newDayId: values.newDayId,
          newPracticeCaseBeginId: values.newPracticeCaseBeginId,
          newPurposeUse: values.reason,
        };
        const res = await requestApi.createChangeCalendarRequest(payload);
        responseMessage = res.message;
      } else { // type === 'change-room'
        const payload = {
          calendarId: schedule.calendarId,
          purposeUse: values.reason,
        };
        const res = await requestApi.createChangeRoomRequest(payload);
        responseMessage = res.message;
      }
      message.success(responseMessage || 'Đã gửi yêu cầu thành công!', DURATION);
      onSuccess(); // Gọi callback để đóng modal và refresh bảng
    } catch (error) {
      message.error(error.message || "Gửi yêu cầu thất bại!", DURATION);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {type === 'change-schedule' && (
        <>
          <Row gutter={16}><Col span={24}><Form.Item name="newWeekSemesterId" label="Tuần học mới" rules={[{ required: true }]}><Select placeholder="Chọn tuần học" disabled={weeks.length === 0}>{weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}</Select></Form.Item></Col></Row>
          <Row gutter={16}><Col span={12}><Form.Item name="newDayId" label="Thứ mới" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{options.day.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col><Col span={12}><Form.Item name="newPracticeCaseBeginId" label="Tiết bắt đầu mới" rules={[{ required: true }]}><Select placeholder="Chọn tiết">{options.practiceCase.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col></Row>
        </>
      )}
      <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}>
        <Input.TextArea rows={3} placeholder={type === 'change-schedule' ? 'Nhập lý do đổi lịch...' : 'Nhập lý do đổi phòng...'} />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right', marginTop: '16px' }}>
        <Space><Button onClick={onCancel}>Hủy</Button><Button type="primary" htmlType="submit">Gửi yêu cầu</Button></Space>
      </Form.Item>
    </Form>
  );
};


export default CalendarView;




