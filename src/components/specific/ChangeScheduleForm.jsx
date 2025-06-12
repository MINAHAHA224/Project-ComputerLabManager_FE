import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, message, Space, Tabs, Row, Col } from 'antd';
import calendarApi from '../../api/calendarApi';
import requestApi from '../../api/requestApi';

const { Option } = Select;

const ChangeScheduleForm = ({ schedule, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [weeks, setWeeks] = useState([]);
  const [formOptions, setFormOptions] = useState({ day: [], practiceCase: [] });

  useEffect(() => {
    // Tải danh sách tuần hợp lệ cho việc đổi lịch
    const fetchWeeks = async () => {
      if (schedule) {
        try {
          const weeksResponse = await calendarApi.getWeeksForUpdate(schedule.calendarId);
          setWeeks(weeksResponse.data || []);
        } catch (error) {
          message.error("Lỗi khi tải danh sách tuần hợp lệ!");
        }
      }
    };

    // Tải các lựa chọn tĩnh (Thứ, Tiết)
    const fetchStaticOptions = async () => {
      try {
        const response = await requestApi.getDataForRentRoom();
        if (response.data) {
          setFormOptions({
            day: response.data.day || [],
            practiceCase: response.data.practiceCase || []
          });
        }
      } catch(e) {
        console.error("Lỗi tải form options", e);
      }
    };

    fetchWeeks();
    fetchStaticOptions();
  }, [schedule]);

  const handleSubmit = async (values) => {
    // Lấy activeKey từ form để biết người dùng đang ở tab nào
    // (Lưu ý: Bạn có thể không dùng Tabs ở phiên bản này, nhưng logic vẫn tương tự)
    // Tôi sẽ sửa lại để nó dựa vào prop 'type'
    try {
      let responseMessage = '';
      if (type === 'change-schedule') {
        const payload = {
          calendarIdToChange: schedule.calendarId,
          newWeekSemesterId: values.newWeekSemesterId,
          newDayId: values.newDayId,
          newPracticeCaseBeginId: values.newPracticeCaseBeginId,
          newPurposeUse: values.reason, // Lấy lý do từ form
        };
        const res = await requestApi.createChangeCalendarRequest(payload);
        responseMessage = res.message;
      } else { // type === 'change-room'
        const payload = {
          calendarId: schedule.calendarId,
          purposeUse: values.reason, // Lấy lý do từ form
        };
        const res = await requestApi.createChangeRoomRequest(payload);
        responseMessage = res.message;
      }
      message.success(responseMessage || 'Đã gửi yêu cầu thành công!', 5); // DURATION = 5
      onSuccess(); // Gọi callback để báo cho component cha biết đã thành công
    } catch (error) {
      message.error(error.message || "Gửi yêu cầu thất bại!", 5); // DURATION = 5
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="activeKey" initialValue="1" noStyle>
        <Input type="hidden" />
      </Form.Item>
      <Tabs defaultActiveKey="1" onChange={(key) => form.setFieldsValue({ activeKey: key })}>
        <Tabs.TabPane tab="Yêu cầu Đổi lịch" key="1">
          <Row gutter={16}>
            <Col span={24}><Form.Item name="newWeekSemesterId" label="Tuần học mới" rules={[{ required: true }]}><Select placeholder="Chọn tuần" disabled={weeks.length === 0}>{weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="newDayId" label="Thứ mới" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{formOptions.day.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="newPracticeCaseBeginId" label="Tiết bắt đầu mới" rules={[{ required: true }]}><Select placeholder="Chọn tiết">{formOptions.practiceCase.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Yêu cầu Đổi phòng" key="2">
          <p>Hệ thống sẽ tự động tìm một phòng khác trống vào cùng thời điểm với lịch hiện tại của bạn.</p>
        </Tabs.TabPane>
      </Tabs>
      <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right', marginTop: '16px' }}>
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">Gửi yêu cầu</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ChangeScheduleForm;