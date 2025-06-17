// src/pages/CalendarManagement/CalendarManagement.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Card,
  Typography,
  Tabs,
  InputNumber,
  Input,
  Row,
  Col,
  Tooltip,
  App,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import calendarApi from "../../api/calendarApi";

const { Title, Text } = Typography;
const { Option } = Select;

const CalendarManagement = () => {
  const { message } = App.useApp();
  const DURATION = 5;

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [createOptions, setCreateOptions] = useState({
    creditClass: [],
    day: [],
    practiceCase: [],
    facility: [],
    semesterYear: [],
    room: [],
  });
  const [weeks, setWeeks] = useState([]);
  const [autoForm] = Form.useForm();
  const [manualForm] = Form.useForm();
  const [isCreditClassSelectedForManual, setIsCreditClassSelectedForManual] =
      useState(false);
  const [weeksForEdit, setWeeksForEdit] = useState([]);
  // State cho Modal Sửa
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Thêm một state mới để lưu các ước số hợp lệ cho tab thủ công
  const [validManualLessons, setValidManualLessons] = useState([]);
  const [editingCluster, setEditingCluster] = useState(null); // Lưu trữ cả cụm khi sửa
  const [selectedCalendarForEdit, setSelectedCalendarForEdit] = useState(null); // Lưu lịch chi tiết được chọn để sửa
  const [editForm] = Form.useForm();

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await calendarApi.getForManagement();
      setSchedules(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách lịch!", DURATION);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const response = await calendarApi.getCreateData();
      setCreateOptions({
        creditClass: [],
        day: [],
        practiceCase: [],
        facility: [],
        semesterYear: [],
        room: [],
        ...response.data,
      });
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu form!", DURATION);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchFormData();
  }, []);

  const handleSemesterChange = async (semesterYear) => {
    autoForm.setFieldsValue({ startWeekSemesterId: undefined });
    const currentManualDetails = manualForm.getFieldValue("calendarDetail") || [
      {},
    ];
    manualForm.setFieldsValue({
      calendarDetail: currentManualDetails.map((d) => ({
        ...d,
        weekSemesterId: undefined,
      })),
    });
    setWeeks([]);

    if (!semesterYear) return;

    try {
      const response = await calendarApi.getWeeksBySemester(semesterYear);
      setWeeks(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách tuần!", DURATION);
    }
  };

  const handleCreditClassChangeForManual = (value, option) => {
    // Reset danh sách ước số mỗi khi thay đổi
    setValidManualLessons([]);
    // Reset các trường phụ thuộc trong Form.List
    const currentDetails = manualForm.getFieldValue("calendarDetail") || [{}];
    manualForm.setFieldsValue({
      calendarDetail: currentDetails.map((d) => ({ ...d, allCase: undefined })),
    });

    if (value) {
      setIsCreditClassSelectedForManual(true);
      const studentCount = option ? option["data-studentcount"] : 0;
      const numberOfGroups =
          studentCount && studentCount > 0 ? Math.ceil(studentCount / 35.0) : 1;
      const newCalendarDetails = Array.from(
          { length: numberOfGroups },
          (_, index) => ({ groupId: index + 1 }),
      );
      manualForm.setFieldsValue({ calendarDetail: newCalendarDetails });

      // === LOGIC MỚI ĐỂ TÍNH ƯỚC SỐ ===
      const totalLessons = parseInt(option["data-total-lessons"], 10);
      const currentLessons = parseInt(option["data-current-lessons"], 10);
      const remainingLessons = totalLessons - currentLessons;

      if (remainingLessons > 0) {
        const divisors = [];
        for (let i = 1; i <= remainingLessons; i++) {
          if (remainingLessons % i === 0) {
            divisors.push(i);
          }
        }
        setValidManualLessons(divisors);
      }
      // ================================
    } else {
      setIsCreditClassSelectedForManual(false);
      manualForm.setFieldsValue({ calendarDetail: [{}] });
    }
  };

  const showAddModal = () => {
    setEditingRecord(null);
    autoForm.resetFields();
    manualForm.resetFields();
    manualForm.setFieldsValue({ calendarDetail: [{}] });
    setWeeks([]);
    setIsCreditClassSelectedForManual(false);
    setIsModalVisible(true);
  };

  // === LOGIC MỚI CHO NÚT SỬA ===
  const showEditModal = (record) => {
    // Tìm tất cả các lịch thuộc cụm của record được click
    const cluster = schedules.filter(
        (s) => s.creditClassId === record.creditClassId,
    );
    setEditingCluster(cluster);
    setIsEditModalVisible(true);
  };

  const handleSelectCalendarToEdit = async (calendarId) => {
    if (!calendarId) {
      setSelectedCalendarForEdit(null);
      setWeeksForEdit([]);
      editForm.resetFields();
      return;
    }
    try {
      // Gọi API mới để lấy danh sách tuần
      const weeksResponse = await calendarApi.getWeeksForUpdate(calendarId);
      setWeeksForEdit(weeksResponse.data || []);

      const response = await calendarApi.getById(calendarId);
      const detail = response.data;
      if (!detail || !detail.userCurrent)
        throw new Error("Dữ liệu không hợp lệ");

      setSelectedCalendarForEdit(detail.userCurrent);
      editForm.setFieldsValue({
        ...detail.userCurrent,
        weekSemesterId: Number(detail.userCurrent.weekSemesterId),
        dayId: Number(detail.userCurrent.dayId),
        practiceCaseBeginId: Number(detail.userCurrent.practiceCaseBeginId),
      });
    } catch (e) {
      message.error("Lỗi khi tải chi tiết lịch!", DURATION);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditModalVisible(false);
    setEditingCluster(null);
    setSelectedCalendarForEdit(null);
    editForm.resetFields();
  };

  const handleAutoSubmit = async (values) => {
    try {
      const response = await calendarApi.createAuto(values);
      message.success(
          response.message || "Xếp lịch tự động thành công!",
          DURATION,
      );
      if (response.data && response.data.warnings) {
        const warnings = Object.values(response.data.warnings).join("\n");
        Modal.warning({
          title: "Cảnh báo khi xếp lịch",
          content: <pre style={{ whiteSpace: "pre-wrap" }}>{warnings}</pre>,
          width: 600,
        });
      }
      setIsModalVisible(false);
      fetchSchedules();
    } catch (error) {
      message.error(error.message || "Xếp lịch tự động thất bại!", DURATION);
    }
  };

  const handleManualSubmit = async (values) => {
    try {
      const response = await calendarApi.createManual(values);
      message.success(
          response.message || "Xếp lịch thủ công thành công!",
          DURATION,
      );
      setIsModalVisible(false);
      fetchSchedules();
    } catch (error) {
      message.error(error.message || "Xếp lịch thủ công thất bại!", DURATION);
    }
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const payload = {
        calendarId: selectedCalendarForEdit.calendarId,
        ...values,
      };
      const response = await calendarApi.update(payload);
      message.success(
          response.message || "Cập nhật lịch thành công!",
          DURATION,
      );
      handleCancel(); // Đóng modal và reset state
      fetchSchedules(); // Tải lại dữ liệu
    } catch (error) {
      message.error(error.message || "Cập nhật thất bại!", DURATION);
    }
  };

  // === THAY ĐỔI LOGIC NHÓM DỮ LIỆU ===
  const processedSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];

    const groupedByCreditClass = {};
    const singleSchedules = [];

    schedules.forEach((schedule) => {
      if (schedule.creditClassId) {
        if (!groupedByCreditClass[schedule.creditClassId]) {
          groupedByCreditClass[schedule.creditClassId] = [];
        }
        groupedByCreditClass[schedule.creditClassId].push(schedule);
      } else {
        singleSchedules.push(schedule);
      }
    });

    const result = [];

    Object.values(groupedByCreditClass).forEach((group) => {
      const clusterIds = group.map(s => s.calendarId).join(',');
      group.forEach((schedule, index) => {
        result.push({
          ...schedule,
          // key giờ đây chính là calendarId, luôn duy nhất
          isFirstInGroup: index === 0,
          groupSize: group.length,
          clusterIds: clusterIds,
        });
      });
    });

    singleSchedules.forEach((schedule) => {
      result.push({
        ...schedule,
        isFirstInGroup: true,
        groupSize: 1,
        clusterIds: schedule.calendarId,
      });
    });

    // Sắp xếp lại ở Frontend để đảm bảo thứ tự sau khi nhóm (phòng thủ)
    result.sort((a, b) => {
      if (a.creditClassId && b.creditClassId) {
        if (a.creditClassId !== b.creditClassId) {
          return Number(a.creditClassId) - Number(b.creditClassId);
        }
      }
      return Number(a.calendarId) - Number(b.calendarId);
    });

    return result;
  }, [schedules]);


  // === THAY ĐỔI HÀM XÓA ===
  const handleDelete = async (ids) => {
    try {
      await calendarApi.delete(ids);
      message.success("Xóa lịch thành công!", DURATION);
      fetchSchedules();
    } catch (error) {
      message.error(error.message || "Xóa thất bại!", DURATION);
    }
  };

  const columns = [
    { title: "ID Lịch", dataIndex: "calendarId", key: "calendarId", width: 80 },
    {
      title: "Môn học / Mục đích",
      dataIndex: "nameSubject",
      key: "nameSubject",
      width: 250,
      render: (text, record) => ({
        children: <strong>{text || record.note || "Lịch mượn phòng"}</strong>,
        props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
      }),
    },
    {
      title: "Giáo viên",
      dataIndex: "nameTeacher",
      key: "nameTeacher",
      width: 200,
      render: (text, record) => ({
        children: text,
        props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
      }),
    },
    // Các cột chi tiết không cần gộp

    { title: "Phòng", dataIndex: "nameRoom", key: "nameRoom", width: 100 },
    { title: "Ngày", dataIndex: "date", key: "date", width: 120 },
    { title: "Thứ", dataIndex: "day", key: "day", width: 80 },
    {
      title: "Trạng thái",
      dataIndex: "statusCalendar",
      key: "statusCalendar",
      width: 120,
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => {
        const actionButtons = (
            <Space>
              {/* Nút sửa chỉ gọi hàm showEditModal */}
              <Button
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(record)}
              >
                Sửa
              </Button>
              <Popconfirm
                  title={
                    record.groupSize > 1 ? "Xóa cả cụm lịch?" : "Xóa lịch này?"
                  }
                  description={
                    record.groupSize > 1
                        ? `Xóa ${record.groupSize} lịch của lớp này?`
                        : "Bạn có chắc muốn xóa lịch này?"
                  }
                  onConfirm={() => handleDelete(record.clusterIds)}
                  okText="Đồng ý"
                  cancelText="Hủy"
              >
                <Button icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </Space>
        );
        return {
          children: record.isFirstInGroup ? actionButtons : null,
          props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
        };
      },
    },
  ];

  const renderCreditClassOption = (cc) => {
    const lessonCurrent = parseInt(cc.lessonCurrent, 10);
    const lessonDataBase = parseInt(cc.lessonDataBase, 10);
    const isDisabled = lessonDataBase > 0 && lessonCurrent >= lessonDataBase;
    return (
        <Option
            key={cc.idCredit}
            value={Number(cc.idCredit)}
            label={`${cc.codeCreditClass} - ${cc.nameSubject}`}
            disabled={isDisabled}
            data-studentcount={cc.studentClassroom}
            data-total-lessons={cc.lessonDataBase}
            data-current-lessons={cc.lessonCurrent} // <<< THÊM DÒNG NÀY
        >
          <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
          >
            <Text
                strong
                disabled={isDisabled}
                style={{
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
            >{`${cc.codeCreditClass} - ${cc.nameSubject}`}</Text>
            <Text
                type="secondary"
                disabled={isDisabled}
                style={{
                  marginLeft: "16px",
                  flexShrink: 0,
                }}
            >{`Sĩ số: ${cc.studentClassroom} | Tiết đã xếp: ${cc.lessonCurrent}/${cc.lessonDataBase}`}</Text>
          </div>
        </Option>
    );
  };

  const renderRoomOption = (r) => {
    return (
        <Option
            key={r.idRoom}
            value={Number(r.idRoom)}
            label={`${r.facility} - ${r.nameRoom}`}
        >
          <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
          >
            {/* Phần tên phòng */}
            <Text
                strong
                style={{
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
            >
              {`${r.facility} - ${r.nameRoom}`}
            </Text>
            {/* Phần thông tin số máy */}
            <Text type="secondary" style={{ marginLeft: "16px", flexShrink: 0 }}>
              {`Máy HĐ: ${r.quantityActive}/${r.quantity}`}
            </Text>
          </div>
        </Option>
    );
  };

  const renderModalContent = () => {
    if (editingRecord) {
      // Form Sửa: Dùng autoForm (đã đổi tên)
      return (
          <Form form={autoForm} layout="vertical" onFinish={handleUpdateSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                    name="weekSemesterId"
                    label="Tuần học"
                    rules={[{ required: true }]}
                >
                  <Select placeholder="Chọn tuần học" disabled>
                    {weeks?.map((w) => (
                        <Option key={w.idWeekTime} value={w.idWeekTime}>
                          {w.time}
                        </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}>
                  <Select placeholder="Chọn thứ">
                    {createOptions.day?.map((d) => (
                        <Option key={d.idDay} value={Number(d.idDay)}>
                          {d.name}
                        </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                    name="practiceCaseBeginId"
                    label="Tiết bắt đầu"
                    rules={[{ required: true }]}
                >
                  <Select placeholder="Chọn tiết bắt đầu">
                    {createOptions.practiceCase?.map((pc) => (
                        <Option
                            key={pc.idPracticeCase}
                            value={Number(pc.idPracticeCase)}
                        >
                          {pc.name}
                        </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="purposeUse" label="Ghi chú">
                  <Input.TextArea rows={1} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Space>
            </Form.Item>
          </Form>
      );
    }

    return (
        <Tabs defaultActiveKey="1" destroyInactiveTabPane>
          <Tabs.TabPane tab="Xếp lịch Tự động" key="1">
            <Form
                form={autoForm}
                layout="vertical"
                onFinish={handleAutoSubmit}
                initialValues={{ allCasePerSession: 4 }}
            >
              <Form.Item
                  name="creditClassId"
                  label="Lớp tín chỉ"
                  rules={[{ required: true }]}
              >
                <Select
                    showSearch
                    placeholder="Chọn lớp tín chỉ"
                    filterOption={(input, option) =>
                        (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                >
                  {createOptions.creditClass?.map(renderCreditClassOption)}
                </Select>
              </Form.Item>
              <Form.Item
                  name="idFacility"
                  label="Cơ sở"
                  rules={[{ required: true }]}
              >
                <Select placeholder="Chọn cơ sở">
                  {createOptions.facility?.map((f) => (
                      <Option key={f.idFacility} value={Number(f.idFacility)}>
                        {f.nameFacility}
                      </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                  name="semesterYearAuto"
                  label="Học kỳ - Năm học"
                  rules={[{ required: true }]}
              >
                <Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>
                  {createOptions.semesterYear?.map((sy) => (
                      <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>
                        {sy.content}
                      </Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                      name="startWeekSemesterId"
                      label="Tuần bắt đầu"
                      rules={[{ required: true }]}
                  >
                    <Select placeholder="Chọn tuần" disabled={!weeks.length}>
                      {weeks.map((w) => (
                          <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>
                            {w.time}
                          </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                      name="dayId"
                      label="Thứ"
                      rules={[{ required: true }]}
                  >
                    <Select placeholder="Chọn thứ">
                      {createOptions.day?.map((d) => (
                          <Option key={d.idDay} value={Number(d.idDay)}>
                            {d.name}
                          </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                      name="practiceCaseBeginId"
                      label="Tiết bắt đầu"
                      rules={[{ required: true }]}
                  >
                    <Select placeholder="Chọn tiết">
                      {createOptions.practiceCase?.map((pc) => (
                          <Option
                              key={pc.idPracticeCase}
                              value={Number(pc.idPracticeCase)}
                          >
                            {pc.name}
                          </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                      name="allCasePerSession"
                      label="Số tiết / buổi"
                      rules={[{ required: true }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="purposeUse" label="Ghi chú / Mục đích">
                <Input.TextArea />
              </Form.Item>
              <Form.Item style={{ textAlign: "right" }}>
                <Space>
                  <Button onClick={handleCancel}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    Xếp lịch
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Xếp lịch Thủ công" key="2">
            <Form
                form={manualForm}
                layout="vertical"
                onFinish={handleManualSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                      name="creditClassId"
                      label="Lớp tín chỉ"
                      rules={[{ required: true }]}
                  >
                    <Select
                        allowClear
                        showSearch
                        placeholder="Chọn lớp để tạo nhóm"
                        onChange={handleCreditClassChangeForManual}
                        filterOption={(input, option) =>
                            (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                    >
                      {createOptions.creditClass?.map(renderCreditClassOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                      name="idFacility"
                      label="Cơ sở"
                      rules={[{ required: true }]}
                  >
                    <Select placeholder="Chọn cơ sở">
                      {createOptions.facility?.map((f) => (
                          <Option key={f.idFacility} value={Number(f.idFacility)}>
                            {f.nameFacility}
                          </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                      name="semesterYearManual"
                      label="Học kỳ - Năm học"
                      rules={[{ required: true }]}
                  >
                    <Select
                        placeholder="Chọn học kỳ"
                        onChange={handleSemesterChange}
                    >
                      {createOptions.semesterYear?.map((sy) => (
                          <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>
                            {sy.content}
                          </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                      name="allCase"
                      label="Số tiết"
                      rules={[{ required: true }]}
                  >
                    <Select
                        placeholder="Chọn số tiết"
                        disabled={validManualLessons.length === 0}
                    >
                      {validManualLessons.map((num) => (
                          <Option key={num} value={num}>
                            {num} tiết
                          </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <hr
                  style={{
                    margin: "20px 0",
                    border: "none",
                    borderTop: "1px solid #f0f0f0",
                  }}
              />
              <Form.List name="calendarDetail">
                {(fields, { add, remove }) => (
                    <>
                      <div
                          style={{
                            maxHeight: "40vh",
                            overflowY: "auto",
                            paddingRight: "10px",
                          }}
                      >
                        {fields.map(({ key, name }, index) => (
                            <Card
                                size="small"
                                key={key}
                                style={{ marginBottom: 16 }}
                                title={`Chi tiết cho Nhóm ${index + 1}`}
                                extra={
                                  <Tooltip
                                      title={
                                        isCreditClassSelectedForManual
                                            ? "Không thể xóa nhóm được tạo tự động"
                                            : "Xóa chi tiết"
                                      }
                                  >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<MinusCircleOutlined />}
                                        onClick={() => remove(name)}
                                        disabled={isCreditClassSelectedForManual}
                                    />
                                  </Tooltip>
                                }
                            >
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                      name={[name, "groupId"]}
                                      label="Nhóm/Tổ"
                                      rules={[{ required: true }]}
                                  >
                                    <InputNumber
                                        placeholder="Nhóm"
                                        style={{ width: "100%" }}
                                        disabled
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                      name={[name, "dayId"]}
                                      label="Thứ"
                                      rules={[{ required: true }]}
                                  >
                                    <Select placeholder="Chọn thứ">
                                      {createOptions.day?.map((d) => (
                                          <Option key={d.idDay} value={Number(d.idDay)}>
                                            {d.name}
                                          </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                      name={[name, "weekSemesterId"]}
                                      label="Tuần học"
                                      rules={[{ required: true }]}
                                  >
                                    <Select
                                        placeholder="Chọn tuần"
                                        disabled={!weeks.length}
                                    >
                                      {weeks.map((w) => (
                                          <Option
                                              key={w.idWeekTime}
                                              value={Number(w.idWeekTime)}
                                          >
                                            {w.time}
                                          </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                      name={[name, "roomId"]}
                                      label="Phòng"
                                      rules={[{ required: true }]}
                                  >
                                    <Select
                                        showSearch
                                        placeholder="Chọn phòng"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                    >
                                      {createOptions.room?.map(renderRoomOption)}
                                    </Select>
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                      name={[name, "practiceCaseBeginId"]}
                                      label="Tiết BĐ"
                                      rules={[{ required: true }]}
                                  >
                                    <Select placeholder="Chọn tiết">
                                      {createOptions.practiceCase?.map((pc) => (
                                          <Option
                                              key={pc.idPracticeCase}
                                              value={Number(pc.idPracticeCase)}
                                          >
                                            {pc.name}
                                          </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                      name={[name, "purposeUse"]}
                                      label="Ghi chú"
                                  >
                                    <Input />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </Card>
                        ))}
                      </div>
                      <Form.Item>
                        <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                            disabled={isCreditClassSelectedForManual}
                        >
                          Thêm nhóm khác (Chỉ dùng khi không chọn Lớp tín chỉ)
                        </Button>
                      </Form.Item>
                    </>
                )}
              </Form.List>
              <Form.Item style={{ textAlign: "right" }}>
                <Space>
                  <Button onClick={handleCancel}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    Xếp lịch
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
    );
  };

  return (
      <Card>
        <Title level={3}>Quản lý Lịch thực hành</Title>
        <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            style={{ marginBottom: 16 }}
        >
          Thêm Lịch
        </Button>
        <Table
            columns={columns}
            dataSource={processedSchedules}
            loading={loading}
            // === SỬA LẠI ROW KEY ===
            rowKey="calendarId" // <<< Sử dụng trực tiếp calendarId làm key
            bordered
            scroll={{ x: 1500 }}
        />
        <Modal
            title={editingRecord ? "Cập nhật Lịch" : "Thêm mới Lịch"}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
          {renderModalContent()}
        </Modal>
        {/* === MODAL SỬA MỚI === */}
        <Modal
            title="Chỉnh sửa Lịch"
            open={isEditModalVisible}
            onCancel={handleCancel}
            footer={null} // Footer sẽ nằm trong Form
            destroyOnClose
        >
          {editingCluster && (
              <Form form={editForm} layout="vertical" onFinish={handleUpdateSubmit}>
                <Form.Item
                    label="Chọn lịch chi tiết cần sửa"
                    rules={[{ required: true }]}
                >
                  <Select
                      placeholder="-- Vui lòng chọn một lịch chi tiết --"
                      onChange={handleSelectCalendarToEdit}
                  >
                    {editingCluster.map((cal) => (
                        <Option key={cal.calendarId} value={cal.calendarId}>
                          {`ID: ${cal.calendarId} - Phòng: ${cal.nameRoom} - Ngày: ${cal.date}`}
                        </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Form sửa chi tiết sẽ chỉ hiện ra sau khi người dùng chọn */}
                {selectedCalendarForEdit && (
                    <Card
                        type="inner"
                        title={`Đang sửa Lịch ID: ${selectedCalendarForEdit.calendarId}`}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                              name="weekSemesterId"
                              label="Tuần học"
                              rules={[{ required: true }]}
                          >
                            <Select placeholder="Chọn tuần học">
                              {weeksForEdit.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                              name="dayId"
                              label="Thứ"
                              rules={[{ required: true }]}
                          >
                            <Select placeholder="Chọn thứ">
                              {createOptions.day?.map((d) => (
                                  <Option key={d.idDay} value={Number(d.idDay)}>
                                    {d.name}
                                  </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                              name="practiceCaseBeginId"
                              label="Tiết bắt đầu"
                              rules={[{ required: true }]}
                          >
                            <Select placeholder="Chọn tiết">
                              {createOptions.practiceCase?.map((pc) => (
                                  <Option
                                      key={pc.idPracticeCase}
                                      value={Number(pc.idPracticeCase)}
                                  >
                                    {pc.name}
                                  </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="purposeUse" label="Ghi chú">
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                )}

                <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
                  <Space>
                    <Button onClick={handleCancel}>Hủy</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={!selectedCalendarForEdit} // Chỉ cho submit khi đã chọn lịch
                    >
                      Cập nhật
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
          )}
        </Modal>
      </Card>
  );
};

export default CalendarManagement;

