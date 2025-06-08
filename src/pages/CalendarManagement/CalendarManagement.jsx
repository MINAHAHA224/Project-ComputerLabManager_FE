//
// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Button,
//   Space,
//   Modal,
//   Form,
//   Select,
//   message,
//   Popconfirm,
//   Card,
//   Typography,
//   Tabs,
//   InputNumber,
//   Input,
//   Row,
//   Col,
//   Tooltip,
//   App,
// } from "antd";
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   MinusCircleOutlined,
// } from "@ant-design/icons";
// import calendarApi from "../../api/calendarApi";
//
// const { Title, Text } = Typography;
// const { Option } = Select;
//
// const CalendarManagement = () => {
//   const { message } = App.useApp();
//   const DURATION = 5;
//
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//
//   const [createOptions, setCreateOptions] = useState({
//     creditClass: [],
//     day: [],
//     practiceCase: [],
//     facility: [],
//     semesterYear: [],
//     room: [],
//   });
//   const [weeks, setWeeks] = useState([]);
//   const [autoForm] = Form.useForm();
//   const [manualForm] = Form.useForm();
//   // State mới để kiểm soát việc disable các nút
//
//
//
//   const fetchSchedules = async () => {
//     setLoading(true);
//     try {
//       const response = await calendarApi.getAll();
//       setSchedules(response.data || []);
//     } catch (error) {
//       message.error("Lỗi khi tải danh sách lịch!", DURATION);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const fetchFormData = async () => {
//     try {
//       const response = await calendarApi.getCreateData();
//
//       setCreateOptions({
//         creditClass: [],
//         day: [],
//         practiceCase: [],
//         facility: [],
//         semesterYear: [],
//         room: [],
//         ...response.data,
//       });
//     } catch (error) {
//       message.error("Lỗi khi tải dữ liệu form!", DURATION);
//     }
//   };
//
//   useEffect(() => {
//     fetchSchedules();
//     fetchFormData();
//   }, []);
//
//   const handleSemesterChange = async (semesterYear) => {
//     autoForm.setFieldsValue({ startWeekSemesterId: undefined });
//     const currentManualDetails = manualForm.getFieldValue("calendarDetail") || [
//       {},
//     ];
//     manualForm.setFieldsValue({
//       calendarDetail: currentManualDetails.map((d) => ({
//         ...d,
//         weekSemesterId: undefined,
//       })),
//     });
//     setWeeks([]);
//
//     if (!semesterYear) return;
//
//     try {
//       const response = await calendarApi.getWeeksBySemester(semesterYear);
//       setWeeks(response.data || []);
//     } catch (error) {
//       message.error("Lỗi khi tải danh sách tuần!", DURATION);
//     }
//   };
//
//   const handleCreditClassChangeForManual = (value, option) => {
//     if (!value) {
//       manualForm.setFieldsValue({ calendarDetail: [{}] });
//       return;
//     }
//     const studentCount = option ? option["data-studentcount"] : 0;
//     if (!studentCount || studentCount <= 0) {
//       manualForm.setFieldsValue({ calendarDetail: [{}] });
//       return;
//     }
//     const numberOfGroups = Math.ceil(studentCount / 35.0);
//     const newCalendarDetails = Array.from(
//       { length: numberOfGroups },
//       (_, index) => ({
//         groupId: index + 1,
//       }),
//     );
//     manualForm.setFieldsValue({ calendarDetail: newCalendarDetails });
//   };
//
//   const showAddModal = () => {
//     setEditingRecord(null);
//     autoForm.resetFields();
//     manualForm.resetFields();
//     manualForm.setFieldsValue({ calendarDetail: [{}] });
//     setWeeks([]);
//     setIsModalVisible(true);
//   };
//
//   const showEditModal = async (record) => {
//     setEditingRecord(record);
//     try {
//       const response = await calendarApi.getById(record.calendarId);
//       const detail = response.data;
//       if (!detail || !detail.userCurrent)
//         throw new Error("Dữ liệu không hợp lệ");
//       // Chỉ điền dữ liệu vào form, không đụng đến state `createOptions`
//       autoForm.setFieldsValue({ ...detail.userCurrent });
//       setIsModalVisible(true);
//     } catch (e) {
//       message.error("Lỗi khi lấy chi tiết lịch!", DURATION);
//     }
//   };
//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };
//
//   const handleAutoSubmit = async (values) => {
//     try {
//       const response = await calendarApi.createAuto(values);
//       message.success(
//         response.message || "Xếp lịch tự động thành công!",
//         DURATION,
//       );
//       if (response.data && response.data.warnings) {
//         const warnings = Object.values(response.data.warnings).join("\n");
//         Modal.warning({
//           title: "Cảnh báo khi xếp lịch",
//           content: <pre style={{ whiteSpace: "pre-wrap" }}>{warnings}</pre>,
//           width: 600,
//         });
//       }
//       setIsModalVisible(false);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || "Xếp lịch tự động thất bại!", DURATION);
//     }
//   };
//
//   const handleManualSubmit = async (values) => {
//     try {
//       console.log("manual submit", values);
//       const response = await calendarApi.createManual(values);
//       message.success(
//         response.message || "Xếp lịch thủ công thành công!",
//         DURATION,
//       );
//       setIsModalVisible(false);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || "Xếp lịch thủ công thất bại!", DURATION);
//     }
//   };
//
//   const handleUpdateSubmit = async (values) => {
//     try {
//       const payload = {
//         calendarId: editingRecord.calendarId,
//         ...values,
//       };
//       const response = await calendarApi.update(payload);
//       message.success(
//         response.message || "Cập nhật lịch thành công!",
//         DURATION,
//       );
//       setIsModalVisible(false);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || "Cập nhật thất bại!", DURATION);
//     }
//   };
//
//   const handleDelete = async (id) => {
//     try {
//       const response = await calendarApi.delete(id);
//       message.success(response.message || "Xóa lịch thành công!", DURATION);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || "Xóa thất bại!", DURATION);
//     }
//   };
//
//   const columns = [
//     {
//       title: "ID Lịch",
//       dataIndex: "calendarId",
//       key: "calendarId",
//       width: 80,
//       fixed: "left",
//     },
//     {
//       title: "Môn học",
//       dataIndex: "nameSubject",
//       key: "nameSubject",
//       width: 250,
//     },
//     {
//       title: "Giáo viên",
//       dataIndex: "nameTeacher",
//       key: "nameTeacher",
//       width: 200,
//     },
//     { title: "Phòng", dataIndex: "nameRoom", key: "nameRoom", width: 100 },
//     { title: "Ngày", dataIndex: "date", key: "date", width: 120 },
//     { title: "Thứ", dataIndex: "day", key: "day", width: 80 },
//     {
//       title: "Tiết BĐ",
//       dataIndex: "lessonBegin",
//       key: "lessonBegin",
//       width: 80,
//     },
//     { title: "Số tiết", dataIndex: "lesson", key: "lesson", width: 80 },
//     {
//       title: "Trạng thái",
//       dataIndex: "statusCalendar",
//       key: "statusCalendar",
//       width: 120,
//     },
//     {
//       title: "Hành động",
//       key: "action",
//       fixed: "right",
//       width: 180,
//       render: (_, record) => (
//         <Space>
//           <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
//             Sửa
//           </Button>
//           <Popconfirm
//             title="Xóa lịch"
//             description="Bạn có chắc muốn xóa lịch này?"
//             onConfirm={() => handleDelete(record.calendarId)}
//             okText="Xóa"
//             cancelText="Hủy"
//           >
//             <Button icon={<DeleteOutlined />} danger />
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];
//
//   const renderCreditClassOption = (cc) => {
//     const lessonCurrent = parseInt(cc.lessonCurrent, 10);
//     const lessonDataBase = parseInt(cc.lessonDataBase, 10);
//     const isDisabled = lessonDataBase > 0 && lessonCurrent >= lessonDataBase;
//     return (
//       <Option
//         key={cc.idCredit}
//         value={Number(cc.idCredit)}
//         label={`${cc.codeCreditClass} - ${cc.nameSubject}`}
//         disabled={isDisabled}
//         data-studentcount={cc.studentClassroom}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Text
//             strong
//             disabled={isDisabled}
//             style={{
//               flex: 1,
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//             }}
//           >
//             {`${cc.codeCreditClass} - ${cc.nameSubject}`}
//           </Text>
//           <Text
//             type="secondary"
//             disabled={isDisabled}
//             style={{ marginLeft: "16px", flexShrink: 0 }}
//           >
//             {`Sĩ số: ${cc.studentClassroom} | Tiết đã xếp: ${cc.lessonCurrent}/${cc.lessonDataBase}`}
//           </Text>
//         </div>
//       </Option>
//     );
//   };
//
//   const renderRoomOption = (r) => {
//     return (
//         <Option
//             key={r.idRoom}
//             value={Number(r.idRoom)}
//             label={`${r.facility} - ${r.nameRoom}`}
//         >
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             {/* Phần tên phòng */}
//             <Text strong style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//               {`${r.facility} - ${r.nameRoom}`}
//             </Text>
//             {/* Phần thông tin số máy */}
//             <Text type="secondary" style={{ marginLeft: '16px', flexShrink: 0 }}>
//               {`Máy HĐ: ${r.quantityActive}/${r.quantity}`}
//             </Text>
//           </div>
//         </Option>
//     );
//   };
//
//
//   const renderModalContent = () => {
//     if (editingRecord) {
//       return (
//         <Form form={autoForm} layout="vertical" onFinish={handleUpdateSubmit}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="weekSemesterId"
//                 label="Tuần học"
//                 rules={[{ required: true }]}
//               >
//                 <Select placeholder="Chọn tuần học" disabled>
//                   {weeks?.map((w) => (
//                     <Option key={w.idWeekTime} value={w.idWeekTime}>
//                       {w.time}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}>
//                 <Select placeholder="Chọn thứ">
//                   {createOptions.day?.map((d) => (
//                     <Option key={d.idDay} value={Number(d.idDay)}>
//                       {d.name}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="practiceCaseBeginId"
//                 label="Tiết bắt đầu"
//                 rules={[{ required: true }]}
//               >
//                 <Select placeholder="Chọn tiết bắt đầu">
//                   {createOptions.practiceCase?.map((pc) => (
//                     <Option
//                       key={pc.idPracticeCase}
//                       value={Number(pc.idPracticeCase)}
//                     >
//                       {pc.name}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item name="purposeUse" label="Ghi chú">
//                 <Input.TextArea rows={1} />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Form.Item style={{ textAlign: "right" }}>
//             <Space>
//               <Button onClick={handleCancel}>Hủy</Button>
//               <Button type="primary" htmlType="submit">
//                 Cập nhật
//               </Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       );
//     }
//
//     return (
//       <Tabs defaultActiveKey="1">
//         <Tabs.TabPane tab="Xếp lịch Tự động" key="1">
//           <Form form={autoForm} layout="vertical" onFinish={handleAutoSubmit}>
//             <Form.Item
//               name="creditClassId"
//               label="Lớp tín chỉ"
//               rules={[{ required: true }]}
//             >
//               <Select
//                 showSearch
//                 placeholder="Chọn lớp tín chỉ"
//                 filterOption={(input, option) =>
//                   (option?.label ?? "")
//                     .toLowerCase()
//                     .includes(input.toLowerCase())
//                 }
//               >
//                 {createOptions.creditClass?.map(renderCreditClassOption)}
//               </Select>
//             </Form.Item>
//             <Form.Item
//               name="idFacility"
//               label="Cơ sở"
//               rules={[{ required: true }]}
//             >
//               <Select placeholder="Chọn cơ sở">
//                 {createOptions.facility?.map((f) => (
//                   <Option key={f.idFacility} value={Number(f.idFacility)}>
//                     {f.nameFacility}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//             <Form.Item
//               name="semesterYearAuto"
//               label="Học kỳ - Năm học"
//               rules={[{ required: true }]}
//             >
//               <Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>
//                 {createOptions.semesterYear?.map((sy) => (
//                   <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>
//                     {sy.content}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//             <Row gutter={16}>
//               <Col span={12}>
//                 <Form.Item
//                   name="startWeekSemesterId"
//                   label="Tuần bắt đầu"
//                   rules={[{ required: true }]}
//                 >
//                   <Select placeholder="Chọn tuần" disabled={!weeks.length}>
//                     {weeks.map((w) => (
//                       <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>
//                         {w.time}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//               <Col span={12}>
//                 <Form.Item
//                   name="dayId"
//                   label="Thứ"
//                   rules={[{ required: true }]}
//                 >
//                   <Select placeholder="Chọn thứ">
//                     {createOptions.day?.map((d) => (
//                       <Option key={d.idDay} value={Number(d.idDay)}>
//                         {d.name}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//             </Row>
//             <Row gutter={16}>
//               <Col span={12}>
//                 <Form.Item
//                   name="practiceCaseBeginId"
//                   label="Tiết bắt đầu"
//                   rules={[{ required: true }]}
//                 >
//                   <Select placeholder="Chọn tiết bắt đầu">
//                     {createOptions.practiceCase?.map((pc) => (
//                       <Option
//                         key={pc.idPracticeCase}
//                         value={Number(pc.idPracticeCase)}
//                       >
//                         {pc.name}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//               <Col span={12}>
//                 <Form.Item
//                   name="allCasePerSession"
//                   label="Số tiết / buổi"
//                   rules={[{ required: true }]}
//                 >
//                   <InputNumber min={1} style={{ width: "100%" }} />
//                 </Form.Item>
//               </Col>
//             </Row>
//             <Form.Item name="purposeUse" label="Ghi chú / Mục đích">
//               <Input.TextArea />
//             </Form.Item>
//             <Form.Item style={{ textAlign: "right" }}>
//               <Space>
//                 <Button onClick={handleCancel}>Hủy</Button>
//                 <Button type="primary" htmlType="submit">
//                   Xếp lịch
//                 </Button>
//               </Space>
//             </Form.Item>
//           </Form>
//         </Tabs.TabPane>
//         <Tabs.TabPane tab="Xếp lịch Thủ công" key="2">
//           <Form
//             form={manualForm}
//             layout="vertical"
//             onFinish={handleManualSubmit}
//           >
//             <Row gutter={16}>
//               <Col span={12}>
//                 <Form.Item
//                   name="creditClassId"
//                   label="Lớp tín chỉ"
//                   rules={[{ required: true }]}
//                 >
//                   <Select
//                     showSearch
//                     placeholder="Chọn lớp để tạo nhóm"
//                     onChange={handleCreditClassChangeForManual}
//                     filterOption={(input, option) =>
//                       (option?.label ?? "")
//                         .toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                   >
//                     {createOptions.creditClass?.map(renderCreditClassOption)}
//                   </Select>
//                 </Form.Item>
//               </Col>
//               <Col span={12}>
//                 <Form.Item
//                   name="idFacility"
//                   label="Cơ sở"
//                   rules={[{ required: true }]}
//                 >
//                   <Select placeholder="Chọn cơ sở">
//                     {createOptions.facility?.map((f) => (
//                       <Option key={f.idFacility} value={Number(f.idFacility)}>
//                         {f.nameFacility}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//
//               {/* === THAY ĐỔI 1: THÊM Ô NHẬP SỐ TIẾT CHUNG === */}
//               <Col span={12}>
//                 <Form.Item
//                     name="practiceCaseBeginId"
//                     label="Tiết bắt đầu (áp dụng cho tất cả nhóm)"
//                     rules={[{ required: true }]}
//                 >
//                   <Select placeholder="Chọn tiết bắt đầu">
//                     {createOptions.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}
//                   </Select>
//                 </Form.Item>
//               </Col>
//
//               {/* === THAY ĐỔI 1: THÊM Ô NHẬP SỐ TIẾT CHUNG === */}
//               <Col span={12}>
//                 <Form.Item
//                   name="allCase"
//                   label="Số tiết / buổi (áp dụng cho tất cả nhóm)"
//                   rules={[{ required: true }]}
//                 >
//                   <InputNumber min={1} style={{ width: "100%" }} />
//                 </Form.Item>
//               </Col>
//             </Row>
//             <Row gutter={24}>
//               <Col span={24}>
//                 <Form.Item
//                     name="semesterYearManual"
//                     label="Học kỳ - Năm học"
//                     rules={[{ required: true }]}
//                 >
//                   <Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>
//                     {createOptions.semesterYear?.map((sy) => (
//                         <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>
//                           {sy.content}
//                         </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//
//
//             </Row>
//             <Row gutter={24}>
//               <Col span={12}>
//                 <Form.Item
//                     name="weekSemesterId"
//                     label="Tuần học"
//                     rules={[{ required: true }]}
//                 >
//                   <Select
//                       placeholder="Chọn tuần"
//                       disabled={!weeks.length}
//                   >
//                     {weeks.map((w) => (
//                         <Option
//                             key={w.idWeekTime}
//                             value={Number(w.idWeekTime)}
//                         >
//                           {w.time}
//                         </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//               <Col span={12}>
//                 <Form.Item
//                     name="dayId"
//                     label="Thứ"
//                     rules={[{ required: true }]}
//                 >
//                   <Select placeholder="Chọn thứ">
//                     {createOptions.day?.map((d) => (
//                         <Option key={d.idDay} value={Number(d.idDay)}>
//                           {d.name}
//                         </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//
//             </Row>
//
//             <hr
//               style={{
//                 margin: "20px 0",
//                 border: "none",
//                 borderTop: "1px solid #f0f0f0",
//               }}
//             />
//             <Form.List name="calendarDetail">
//               {(fields, { add, remove }) => (
//                 <>
//                   {fields.map(({ key, name }, index) => (
//                     <Card
//                       size="small"
//                       key={key}
//                       style={{ marginBottom: 16 }}
//                       title={`Chi tiết cho Nhóm ${index + 1}`}
//                       extra={
//                         // Nút xóa chỉ hiện khi có nhiều hơn 1 nhóm hoặc khi không chọn lớp tín chỉ
//                         fields.length > 1 && (
//                           <Tooltip
//                             title={
//                               fields.length > 1
//                                 ? "Không thể xóa nhóm được tạo tự động"
//                                 : "Xóa chi tiết"
//                             }
//                           >
//                             <Button
//                               type="text"
//                               danger
//                               icon={<MinusCircleOutlined />}
//                               onClick={() => remove(name)}
//                               disabled={fields.length > 1}
//                             />
//                           </Tooltip>
//                         )
//                       }
//                     >
//                       <Form.Item
//                         name={[name, "groupId"]}
//                         label="Nhóm/Tổ"
//                         rules={[{ required: true }]}
//                       >
//                         <InputNumber
//                           placeholder="Nhóm"
//                           style={{ width: "100%" }}
//                           disabled
//                         />
//                       </Form.Item>
//
//
//                       <Row gutter={16}>
//                         <Col span={24}>
//                           <Form.Item
//                             name={[name, "roomId"]}
//                             label="Phòng"
//                             rules={[{ required: true }]}
//                           >
//                             <Select
//                               showSearch
//                               placeholder="Chọn phòng"
//                               filterOption={(input, option) =>
//                                 (option?.label ?? "")
//                                   .toLowerCase()
//                                   .includes(input.toLowerCase())
//                               }
//                             >
//                               {createOptions.room?.map(renderRoomOption)}
//                             </Select>
//                           </Form.Item>
//                         </Col>
//                       </Row>
//                       <Form.Item name={[name, "purposeUse"]} label="Ghi chú">
//                         <Input />
//                       </Form.Item>
//                     </Card>
//                   ))}
//                   <Form.Item>
//                     <Button
//                       type="dashed"
//                       onClick={() => add()}
//                       block
//                       icon={<PlusOutlined />}
//                       disabled={manualForm.getFieldValue("creditClassId")}
//                     >
//                       Thêm nhóm khác (Chỉ dùng khi không chọn Lớp tín chỉ)
//                     </Button>
//                   </Form.Item>
//                 </>
//               )}
//             </Form.List>
//             <Form.Item style={{ textAlign: "right" }}>
//               <Space>
//                 <Button onClick={handleCancel}>Hủy</Button>
//                 <Button type="primary" htmlType="submit">
//                   Xếp lịch
//                 </Button>
//               </Space>
//             </Form.Item>
//           </Form>
//         </Tabs.TabPane>
//       </Tabs>
//     );
//   };
//
//   return (
//     <Card>
//       <Title level={3}>Quản lý Lịch thực hành</Title>
//       <Button
//         type="primary"
//         icon={<PlusOutlined />}
//         onClick={showAddModal}
//         style={{ marginBottom: 16 }}
//       >
//         Thêm Lịch
//       </Button>
//       <Table
//         columns={columns}
//         dataSource={schedules}
//         loading={loading}
//         rowKey="calendarId"
//         bordered
//         scroll={{ x: 1500 }}
//       />
//       <Modal
//         title={editingRecord ? "Cập nhật Lịch" : "Thêm mới Lịch"}
//         open={isModalVisible}
//         onCancel={handleCancel}
//         footer={null}
//         width={800}
//         destroyOnClose
//       >
//         {renderModalContent()}
//       </Modal>
//     </Card>
//   );
// };
//
// export default CalendarManagement;



// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Table, Button, Space, Modal, Form, Select, message, Popconfirm, Card, Typography,
//   Tabs, InputNumber, Input, Row, Col, Tooltip, App
// } from 'antd';
// import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
// import calendarApi from '../../api/calendarApi';
//
// const { Title, Text } = Typography;
// const { Option } = Select;
//
// const CalendarManagement = () => {
//   const { message } = App.useApp();
//   const DURATION = 5;
//
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//
//   const [createOptions, setCreateOptions] = useState({
//     creditClass: [], day: [], practiceCase: [], facility: [], semesterYear: [], room: []
//   });
//   const [weeks, setWeeks] = useState([]); // Tuần học dựa trên Học kỳ được chọn
//   const [autoForm] = Form.useForm(); // Form cho tab Tự động
//   const [manualForm] = Form.useForm(); // Form cho tab Thủ công
//   const [isCreditClassSelectedForManual, setIsCreditClassSelectedForManual] = useState(false); // State cho tab Thủ công
//
//   const fetchSchedules = async () => {
//     setLoading(true);
//     try {
//       const response = await calendarApi.getAll();
//       setSchedules(response.data || []);
//     } catch (error) {
//       message.error('Lỗi khi tải danh sách lịch!', DURATION);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const fetchFormData = async () => {
//     try {
//       const response = await calendarApi.getCreateData();
//       console.log("Show data" ,response.data );
//       setCreateOptions({
//         creditClass: [], day: [], practiceCase: [], facility: [], semesterYear: [], room: [],
//         ...response.data
//       });
//     } catch (error) {
//       message.error('Lỗi khi tải dữ liệu form!', DURATION);
//     }
//   };
//
//   useEffect(() => {
//     fetchSchedules();
//     fetchFormData();
//   }, []);
//
//   // === LOGIC NHÓM DỮ LIỆU ĐỂ HIỂN THỊ BẢNG GỘP ===
//   const processedSchedules = useMemo(() => {
//     if (!schedules || schedules.length === 0) return [];
//
//     const grouped = {};
//     // Tạo key duy nhất cho mỗi buổi học (LTC + Tuần + Thứ + Tiết BĐ)
//     schedules.forEach(schedule => {
//       // Chỉ nhóm các lịch thuộc lớp tín chỉ (bỏ qua lịch mượn phòng nếu muốn, tùy nghiệp vụ)
//       // Tuy nhiên yêu cầu là GVU quản lý tất cả, nên nhóm cả lịch mượn phòng nếu có LTC_FK
//       // Lịch mượn phòng chỉ có UserIdMp_FK, không có LopTinChiID_FK
//       // Để nhóm được, cần có ít nhất LTC ID hoặc UserIdMp_FK và các thông tin thời gian
//       const key = `${schedule.creditClassId || schedule.userIdMp_FK}-${schedule.weekSemesterId}-${schedule.day}-${schedule.lessonBegin}`;
//       if (!grouped[key]) {
//         grouped[key] = [];
//       }
//       grouped[key].push(schedule);
//     });
//
//     const result = [];
//     // Biến đổi object nhóm thành mảng phẳng có đánh dấu dòng đầu và số lượng dòng
//     Object.values(grouped).forEach(group => {
//       group.forEach((schedule, index) => {
//         result.push({
//           ...schedule,
//           isFirstInGroup: index === 0,
//           groupSize: group.length,
//         });
//       });
//     });
//     return result;
//   }, [schedules]); // Tính toán lại khi schedules thay đổi
//   // === KẾT THÚC LOGIC NHÓM DỮ LIỆU ===
//
//
//   const handleSemesterChange = async (semesterYear) => {
//     // Reset các dropdown tuần ở cả 2 form
//     autoForm.setFieldsValue({ startWeekSemesterId: undefined });
//     const currentManualDetails = manualForm.getFieldValue('calendarDetail') || [{}];
//     manualForm.setFieldsValue({ calendarDetail: currentManualDetails.map(d => ({...d, weekSemesterId: undefined})) });
//     setWeeks([]);
//
//     if (!semesterYear) return;
//
//     try {
//       const response = await calendarApi.getWeeksBySemester(semesterYear);
//       setWeeks(response.data || []);
//     } catch (error) {
//       message.error('Lỗi khi tải danh sách tuần!', DURATION);
//     }
//   };
//
//   // Hàm được gọi khi chọn Lớp tín chỉ ở tab Thủ công
//   const handleCreditClassChangeForManual = (value, option) => {
//     // Khi chọn lớp tín chỉ, đánh dấu là đã chọn và tự động tạo nhóm
//     if (value) {
//       setIsCreditClassSelectedForManual(true);
//       const studentCount = option ? option['data-studentcount'] : 0;
//       const numberOfGroups = (studentCount && studentCount > 0) ? Math.ceil(studentCount / 35.0) : 1; // Ít nhất 1 nhóm nếu có SV
//       const newCalendarDetails = Array.from({ length: numberOfGroups }, (_, index) => ({
//         groupId: index + 1, // Tự động điền số nhóm
//       }));
//       manualForm.setFieldsValue({ calendarDetail: newCalendarDetails });
//     } else {
//       // Khi xóa lựa chọn Lớp tín chỉ, cho phép thêm nhóm thủ công và reset về 1 nhóm trống
//       setIsCreditClassSelectedForManual(false);
//       manualForm.setFieldsValue({ calendarDetail: [{}] });
//     }
//   };
//
//   const showAddModal = () => {
//     setEditingRecord(null);
//     autoForm.resetFields();
//     manualForm.resetFields();
//     manualForm.setFieldsValue({ calendarDetail: [{}] }); // Khởi tạo với 1 dòng trống cho form list
//     setWeeks([]); // Reset tuần học
//     setIsCreditClassSelectedForManual(false); // Reset state cho tab thủ công
//     setIsModalVisible(true);
//   };
//
//   const showEditModal = async (record) => {
//     // Lưu record đang sửa lại
//     setEditingRecord(record);
//     // Reset form auto (vì form sửa dùng các trường giống form auto)
//     autoForm.resetFields();
//     try {
//       // API getById trả về chi tiết lịch (userCurrent) và dữ liệu dropdown (dataBase)
//       const response = await calendarApi.getById(record.calendarId);
//       const detail = response.data;
//       if (!detail || !detail.userCurrent || !detail.dataBase) {
//         message.error("Dữ liệu chi tiết lịch không hợp lệ.", DURATION);
//         return;
//       }
//
//       const currentData = detail.userCurrent;
//       // Lấy dữ liệu dropdown từ response getById để điền vào form sửa nếu cần các select
//       // Hiện tại form sửa chỉ có các input/select đơn giản, không cần set CreateOptions
//       // setCreateOptions(detail.dataBase || {});
//
//       // Lấy semesterYear để tải tuần học
//       const weekSemesterId = currentData.weekSemesterId;
//       const selectedWeek = detail.dataBase.weekSemester?.find(w => w.idWeekSemester === weekSemesterId);
//       const semesterYearContent = selectedWeek?.time.split(' ')[selectedWeek?.time.split(' ').length - 1]; // Lấy năm học cuối cùng (ví dụ: 2025)
//       // Tìm idSemesterYear trong createOptions.semesterYear
//       const semesterYearObject = createOptions.semesterYear?.find(sy => sy.content.includes(semesterYearContent));
//       const semesterYearValue = semesterYearObject?.idSemesterYear;
//
//
//       // Điền dữ liệu vào form sửa
//       autoForm.setFieldsValue({
//         weekSemesterId: Number(currentData.weekSemesterId), // Đảm bảo là Number
//         dayId: Number(currentData.dayId), // Đảm bảo là Number
//         practiceCaseBeginId: Number(currentData.practiceCaseBeginId), // Đảm bảo là Number
//         purposeUse: currentData.purposeUse,
//         // Các trường khác như creditClassId, userIdMp_Fk, allCase, roomId
//         // có thể không cần thiết cho form update đơn giản này,
//         // nhưng nếu cần thì điền vào
//         // creditClassId: Number(currentData.creditClassId),
//         // userIdMp_Fk: Number(currentData.userIdMp_Fk),
//         // allCase: Number(currentData.allCase),
//         // roomId: Number(currentData.roomId)
//       });
//
//       // Tải tuần học cho học kỳ tương ứng (cần thiết nếu select Tuần học không disabled)
//       if (semesterYearValue) {
//         await handleSemesterChange(semesterYearValue);
//       }
//
//
//       setIsModalVisible(true);
//
//     } catch (e) {
//       message.error("Lỗi khi lấy chi tiết lịch!" + (e.message || ''), DURATION);
//       console.error("Error fetching edit data:", e);
//     }
//   };
//
//
//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };
//
//   const handleAutoSubmit = async (values) => {
//     try {
//       const response = await calendarApi.createAuto(values);
//       message.success(response.message || 'Xếp lịch tự động thành công!', DURATION);
//       if (response.data && response.data.warnings) {
//         const warnings = Object.values(response.data.warnings).join('\n');
//         Modal.warning({
//           title: 'Cảnh báo khi xếp lịch',
//           content: <pre style={{ whiteSpace: 'pre-wrap' }}>{warnings}</pre>,
//           width: 600,
//         });
//       }
//       setIsModalVisible(false);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || 'Xếp lịch tự động thất bại!', DURATION);
//     }
//   };
//
//   const handleManualSubmit = async (values) => {
//     try {
//       const response = await calendarApi.createManual(values);
//       message.success(response.message || 'Xếp lịch thủ công thành công!', DURATION);
//       setIsModalVisible(false);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || 'Xếp lịch thủ công thất bại!', DURATION);
//     }
//   };
//
//   const handleUpdateSubmit = async (values) => {
//     try {
//       const payload = {
//         calendarId: editingRecord.calendarId,
//         ...values,
//       }
//       const response = await calendarApi.update(payload);
//       message.success(response.message || 'Cập nhật lịch thành công!', DURATION);
//       setIsModalVisible(false);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || "Cập nhật thất bại!", DURATION);
//     }
//   };
//
//   const handleDelete = async (id) => {
//     try {
//       const response = await calendarApi.delete(id);
//       message.success(response.message || 'Xóa lịch thành công!', DURATION);
//       fetchSchedules();
//     } catch (error) {
//       message.error(error.message || 'Xóa thất bại!', DURATION);
//     }
//   };
//
//   // === HÀM MỚI: XÓA THEO CỤM ===
//   const handleDeleteCluster = async (record) => {
//     try {
//       // Chỉ cần truyền một ID bất kỳ trong cụm
//       await calendarApi.deleteCluster(record.calendarId);
//       message.success('Xóa cụm lịch thành công!', DURATION);
//       fetchSchedules(); // Tải lại dữ liệu
//     } catch (error) {
//       message.error(error.message || 'Xóa cụm lịch thất bại!', DURATION);
//     }
//   };
//
//   const columns = [
//     // Cấu hình cột với RowSpan và hiển thị nút Xóa cụm
//     {
//       title: 'ID Lịch', dataIndex: 'calendarId', key: 'calendarId', width: 80, fixed: 'left',
//       render: (text, record) => ({
//         children: text, props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     {
//       title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject', width: 250,
//       render: (text, record) => ({
//         children: text || 'Lịch Mượn Phòng', // Hiển thị "Lịch Mượn Phòng" nếu không có môn
//         props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     {
//       title: 'Giáo viên', dataIndex: 'nameTeacher', key: 'nameTeacher', width: 200,
//       render: (text, record) => ({
//         children: text || record.userIdMp_FK || 'N/A', // Hiển thị UserID mượn phòng nếu không có tên GV
//         props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom', width: 100 },
//     {
//       title: 'Ngày', dataIndex: 'date', key: 'date', width: 120,
//       render: (text, record) => ({
//         children: text, props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     {
//       title: 'Thứ', dataIndex: 'day', key: 'day', width: 80,
//       render: (text, record) => ({
//         children: text, props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     {
//       title: 'Tiết BĐ', dataIndex: 'lessonBegin', key: 'lessonBegin', width: 80,
//       render: (text, record) => ({
//         children: text, props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     {
//       title: 'Số tiết', dataIndex: 'lesson', key: 'lesson', width: 80,
//       render: (text, record) => ({
//         children: text, props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     {
//       title: 'Trạng thái', dataIndex: 'statusCalendar', key: 'statusCalendar', width: 120,
//       render: (text, record) => ({
//         children: text, props: { rowSpan: record.isFirstInGroup ? record.groupSize : 0 },
//       })
//     },
//     {
//       title: 'Hành động', key: 'action', fixed: 'right', width: 120, // Giảm chiều rộng một chút
//       render: (_, record) => {
//         const actionButtons = (
//             <Space size="small">
//               {/* Nút sửa, có thể thêm lại nếu cần */}
//               {/* <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Sửa</Button> */}
//               <Popconfirm
//                   title="Xóa cả cụm lịch?"
//                   description="Thao tác này sẽ xóa tất cả các phòng của buổi học này."
//                   onConfirm={() => handleDeleteCluster(record)} // Gọi hàm đã được đơn giản hóa
//                   okText="Xóa cụm"
//                   cancelText="Hủy"
//               >
//                 <Button icon={<DeleteOutlined />} danger />
//               </Popconfirm>
//             </Space>
//         );
//
//         return {
//           children: record.isFirstInGroup ? actionButtons : null,
//           props: {
//             rowSpan: record.isFirstInGroup ? record.groupSize : 0,
//           },
//         };
//       }
//     },
//   ];
//
//   // Hàm render <Option> cho Lớp tín chỉ, được tái sử dụng
//   const renderCreditClassOption = (cc) => { /* ... giữ nguyên logic ... */ };
//   // Hàm render <Option> cho Phòng, được tái sử dụng
//   const renderRoomOption = (r) => { /* ... giữ nguyên logic ... */ };
//
//   const renderModalContent = () => {
//     if (editingRecord) {
//       // Form Sửa: Dùng autoForm (đã đổi tên)
//       return (
//           <Form form={autoForm} layout="vertical" onFinish={handleUpdateSubmit}>
//             <Row gutter={16}>
//               <Col span={12}><Form.Item name="weekSemesterId" label="Tuần học" rules={[{ required: true }]}><Select placeholder="Chọn tuần học" disabled>{weeks?.map(w => <Option key={w.idWeekTime} value={w.idWeekTime}>{w.time}</Option>)}</Select></Form.Item></Col>
//               <Col span={12}><Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{createOptions.day?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col>
//               <Col span={12}><Form.Item name="practiceCaseBeginId" label="Tiết bắt đầu" rules={[{ required: true }]}><Select placeholder="Chọn tiết bắt đầu">{createOptions.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col>
//               <Col span={12}><Form.Item name="purposeUse" label="Ghi chú"><Input.TextArea rows={1} /></Form.Item></Col>
//             </Row>
//             <Form.Item style={{ textAlign: 'right' }}><Space><Button onClick={handleCancel}>Hủy</Button><Button type="primary" htmlType="submit">Cập nhật</Button></Space></Form.Item>
//           </Form>
//       );
//     }
//
//     return (
//         <Tabs defaultActiveKey="1" destroyInactiveTabPane> {/* DÙNG destroyInactiveTabPane */}
//           <Tabs.TabPane tab="Xếp lịch Tự động" key="1">
//             <Form form={autoForm} layout="vertical" onFinish={handleAutoSubmit}>
//               <Form.Item name="creditClassId" label="Lớp tín chỉ" rules={[{ required: true }]}><Select showSearch placeholder="Chọn lớp tín chỉ" onChange={(value, option) => autoForm.setFieldsValue({ allCasePerSession: undefined })} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>{createOptions.creditClass?.map(renderCreditClassOption)}</Select></Form.Item>
//               <Form.Item name="idFacility" label="Cơ sở" rules={[{ required: true }]}><Select placeholder="Chọn cơ sở">{createOptions.facility?.map(f => <Option key={f.idFacility} value={Number(f.idFacility)}>{f.nameFacility}</Option>)}</Select></Form.Item>
//               <Form.Item name="semesterYearAuto" label="Học kỳ - Năm học" rules={[{ required: true }]}><Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>{createOptions.semesterYear?.map(sy => <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>{sy.content}</Option>)}</Select></Form.Item>
//               <Row gutter={16}><Col span={12}><Form.Item name="startWeekSemesterId" label="Tuần bắt đầu" rules={[{ required: true }]}><Select placeholder="Chọn tuần" disabled={!weeks.length}>{weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}</Select></Form.Item></Col><Col span={12}><Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{createOptions.day?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col></Row>
//               <Row gutter={16}><Col span={12}><Form.Item name="practiceCaseBeginId" label="Tiết bắt đầu" rules={[{ required: true }]}><Select placeholder="Chọn tiết">{createOptions.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col><Col span={12}><Form.Item name="allCasePerSession" label="Số tiết / buổi" rules={[{ required: true }]}><InputNumber min={1} style={{ width: "100%" }} /></Form.Item></Col></Row>
//               <Form.Item name="purposeUse" label="Ghi chú / Mục đích"><Input.TextArea /></Form.Item>
//               <Form.Item style={{ textAlign: "right" }}><Space><Button onClick={handleCancel}>Hủy</Button><Button type="primary" htmlType="submit">Xếp lịch</Button></Space></Form.Item>
//             </Form>
//           </Tabs.TabPane>
//
//           <Tabs.TabPane tab="Xếp lịch Thủ công" key="2">
//             <Form form={manualForm} layout="vertical" onFinish={handleManualSubmit}>
//               <Row gutter={16}>
//                 <Col span={12}><Form.Item name="creditClassId" label="Lớp tín chỉ" rules={[{ required: true }]}><Select allowClear showSearch placeholder="Chọn lớp để tạo nhóm" onChange={handleCreditClassChangeForManual} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>{createOptions.creditClass?.map(renderCreditClassOption)}</Select></Form.Item></Col>
//                 <Col span={12}><Form.Item name="idFacility" label="Cơ sở" rules={[{ required: true }]}><Select placeholder="Chọn cơ sở">{createOptions.facility?.map(f => <Option key={f.idFacility} value={Number(f.idFacility)}>{f.nameFacility}</Option>)}</Select></Form.Item></Col>
//               </Row>
//               <Row gutter={16}> {/* Học kỳ - Năm học và các trường chung mới */}
//                 <Col span={12}><Form.Item name="semesterYearManual" label="Học kỳ - Năm học" rules={[{ required: true }]}><Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>{createOptions.semesterYear?.map(sy => <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>{sy.content}</Option>)}</Select></Form.Item></Col>
//                 <Col span={12}><Form.Item name="practiceCaseBeginId" label="Tiết bắt đầu (chung)" rules={[{ required: true }]}><Select placeholder="Chọn tiết">{createOptions.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col>
//               </Row>
//               <Row gutter={16}>
//                 <Col span={12}><Form.Item name="allCase" label="Số tiết / buổi (chung)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: "100%" }} /></Form.Item></Col>
//               </Row>
//
//               <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f0f0f0' }}/>
//
//               <Form.List name="calendarDetail">
//                 {(fields, { add, remove }) => (
//                     <>
//                       {fields.map(({ key, name }, index) => (
//                           <Card size="small" key={key} style={{ marginBottom: 16 }} title={`Chi tiết cho Nhóm ${index + 1}`} extra={(fields.length > 1 || !isCreditClassSelectedForManual) && (<Tooltip title={isCreditClassSelectedForManual ? "Không thể xóa nhóm được tạo tự động" : "Xóa chi tiết"}><Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} disabled={isCreditClassSelectedForManual} /></Tooltip>)}>
//                             <Row gutter={16}> {/* Gom groupId và dayId */}
//                               <Col span={12}><Form.Item name={[name, 'groupId']} label="Nhóm/Tổ" rules={[{ required: true }]}><InputNumber placeholder="Nhóm" style={{ width: "100%" }} disabled /></Form.Item></Col>
//                               <Col span={12}><Form.Item name={[name, 'dayId']} label="Thứ" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{createOptions.day?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col>
//                             </Row>
//                             <Row gutter={16}> {/* Gom weekSemesterId và roomId */}
//                               <Col span={12}><Form.Item name={[name, 'weekSemesterId']} label="Tuần học" rules={[{ required: true }]}><Select placeholder="Chọn tuần" disabled={!weeks.length}>{weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}</Select></Form.Item></Col>
//                               <Col span={12}><Form.Item name={[name, 'roomId']} label="Phòng" rules={[{ required: true }]}><Select showSearch placeholder="Chọn phòng" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>{createOptions.room?.map(renderRoomOption)}</Select></Form.Item></Col>
//                             </Row>
//                             {/* purposeUse chiếm 1 hàng */}
//                             <Form.Item name={[name, 'purposeUse']} label="Ghi chú"><Input /></Form.Item>
//                           </Card>
//                       ))}
//                       <Form.Item><Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={isCreditClassSelectedForManual}>Thêm nhóm khác (Chỉ dùng khi không chọn Lớp tín chỉ)</Button></Form.Item>
//                     </>
//                 )}
//               </Form.List>
//               <Form.Item style={{ textAlign: 'right' }}><Space><Button onClick={handleCancel}>Hủy</Button><Button type="primary" htmlType="submit">Xếp lịch</Button></Space></Form.Item>
//             </Form>
//           </Tabs.TabPane>
//         </Tabs>
//     );
//   };
//
//   return (
//       <Card>
//         <Title level={3}>Quản lý Lịch thực hành</Title>
//         <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} style={{ marginBottom: 16 }}>Thêm Lịch</Button>
//         {/* Sử dụng processedSchedules làm dataSource cho bảng */}
//         <Table columns={columns} dataSource={processedSchedules} loading={loading} rowKey="calendarId" bordered scroll={{ x: 1500 }} />
//         <Modal title={editingRecord ? "Cập nhật Lịch" : "Thêm mới Lịch"} open={isModalVisible} onCancel={handleCancel} footer={null} width={800} destroyOnClose>
//           {renderModalContent()}
//         </Modal>
//       </Card>
//   );
// };
//
// export default CalendarManagement;





import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Select, message, Popconfirm, Card, Typography,
  Tabs, InputNumber, Input, Row, Col, Tooltip, App
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import calendarApi from '../../api/calendarApi';

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
    creditClass: [], day: [], practiceCase: [], facility: [], semesterYear: [], room: []
  });
  const [weeks, setWeeks] = useState([]);
  const [autoForm] = Form.useForm();
  const [manualForm] = Form.useForm();
  const [isCreditClassSelectedForManual, setIsCreditClassSelectedForManual] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await calendarApi.getForManagement();
      setSchedules(response.data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách lịch!', DURATION);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const response = await calendarApi.getCreateData();
      setCreateOptions({
        creditClass: [], day: [], practiceCase: [], facility: [], semesterYear: [], room: [],
        ...response.data
      });
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu form!', DURATION);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchFormData();
  }, []);

  const handleSemesterChange = async (semesterYear) => {
    autoForm.setFieldsValue({ startWeekSemesterId: undefined });
    const currentManualDetails = manualForm.getFieldValue('calendarDetail') || [{}];
    manualForm.setFieldsValue({ calendarDetail: currentManualDetails.map(d => ({...d, weekSemesterId: undefined})) });
    setWeeks([]);

    if (!semesterYear) return;

    try {
      const response = await calendarApi.getWeeksBySemester(semesterYear);
      setWeeks(response.data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách tuần!', DURATION);
    }
  };

  const handleCreditClassChangeForManual = (value, option) => {
    if (value) {
      setIsCreditClassSelectedForManual(true);
      const studentCount = option ? option['data-studentcount'] : 0;
      const numberOfGroups = (studentCount && studentCount > 0) ? Math.ceil(studentCount / 35.0) : 1;
      const newCalendarDetails = Array.from({ length: numberOfGroups }, (_, index) => ({ groupId: index + 1 }));
      manualForm.setFieldsValue({ calendarDetail: newCalendarDetails });
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

  const showEditModal = async (record) => {
    // Lưu record đang sửa lại
    setEditingRecord(record);
    // Reset form auto (vì form sửa dùng các trường giống form auto)
    autoForm.resetFields();
    try {
      // API getById trả về chi tiết lịch (userCurrent) và dữ liệu dropdown (dataBase)
      const response = await calendarApi.getById(record.calendarId);
      const detail = response.data;
      if (!detail || !detail.userCurrent || !detail.dataBase) {
        message.error("Dữ liệu chi tiết lịch không hợp lệ.", DURATION);
        return;
      }

      const currentData = detail.userCurrent;
      // Lấy dữ liệu dropdown từ response getById để điền vào form sửa nếu cần các select
      // Hiện tại form sửa chỉ có các input/select đơn giản, không cần set CreateOptions
      // setCreateOptions(detail.dataBase || {});

      // Lấy semesterYear để tải tuần học
      const weekSemesterId = currentData.weekSemesterId;
      const selectedWeek = detail.dataBase.weekSemester?.find(w => w.idWeekSemester === weekSemesterId);
      const semesterYearContent = selectedWeek?.time.split(' ')[selectedWeek?.time.split(' ').length - 1]; // Lấy năm học cuối cùng (ví dụ: 2025)
      // Tìm idSemesterYear trong createOptions.semesterYear
      const semesterYearObject = createOptions.semesterYear?.find(sy => sy.content.includes(semesterYearContent));
      const semesterYearValue = semesterYearObject?.idSemesterYear;


      // Điền dữ liệu vào form sửa
      autoForm.setFieldsValue({
        weekSemesterId: Number(currentData.weekSemesterId), // Đảm bảo là Number
        dayId: Number(currentData.dayId), // Đảm bảo là Number
        practiceCaseBeginId: Number(currentData.practiceCaseBeginId), // Đảm bảo là Number
        purposeUse: currentData.purposeUse,
        // Các trường khác như creditClassId, userIdMp_Fk, allCase, roomId
        // có thể không cần thiết cho form update đơn giản này,
        // nhưng nếu cần thì điền vào
        // creditClassId: Number(currentData.creditClassId),
        // userIdMp_Fk: Number(currentData.userIdMp_Fk),
        // allCase: Number(currentData.allCase),
        // roomId: Number(currentData.roomId)
      });

      // Tải tuần học cho học kỳ tương ứng (cần thiết nếu select Tuần học không disabled)
      if (semesterYearValue) {
        await handleSemesterChange(semesterYearValue);
      }


      setIsModalVisible(true);

    } catch (e) {
      message.error("Lỗi khi lấy chi tiết lịch!" + (e.message || ''), DURATION);
      console.error("Error fetching edit data:", e);
    }
  };
  const handleCancel = () => { setIsModalVisible(false); };

    const handleAutoSubmit = async (values) => {
    try {
      const response = await calendarApi.createAuto(values);
      message.success(response.message || 'Xếp lịch tự động thành công!', DURATION);
      if (response.data && response.data.warnings) {
        const warnings = Object.values(response.data.warnings).join('\n');
        Modal.warning({
          title: 'Cảnh báo khi xếp lịch',
          content: <pre style={{ whiteSpace: 'pre-wrap' }}>{warnings}</pre>,
          width: 600,
        });
      }
      setIsModalVisible(false);
      fetchSchedules();
    } catch (error) {
      message.error(error.message || 'Xếp lịch tự động thất bại!', DURATION);
    }
  };

  const handleManualSubmit = async (values) => {
    try {
      const response = await calendarApi.createManual(values);
      message.success(response.message || 'Xếp lịch thủ công thành công!', DURATION);
      setIsModalVisible(false);
      fetchSchedules();
    } catch (error) {
      message.error(error.message || 'Xếp lịch thủ công thất bại!', DURATION);
    }
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const payload = {
        calendarId: editingRecord.calendarId,
        ...values,
      }
      const response = await calendarApi.update(payload);
      message.success(response.message || 'Cập nhật lịch thành công!', DURATION);
      setIsModalVisible(false);
      fetchSchedules();
    } catch (error) {
      message.error(error.message || "Cập nhật thất bại!", DURATION);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await calendarApi.delete(id);
      message.success(response.message || 'Xóa lịch thành công!', DURATION);
      fetchSchedules();
    } catch (error) {
      message.error(error.message || 'Xóa thất bại!', DURATION);
    }
  };


  const columns = [
    { title: 'ID Lịch', dataIndex: 'calendarId', key: 'calendarId', width: 80, fixed: 'left' },
    { title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject', width: 250 },
    { title: 'Giáo viên', dataIndex: 'nameTeacher', key: 'nameTeacher', width: 200 },
    { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom', width: 100 },
    { title: 'Ngày', dataIndex: 'date', key: 'date', width: 120 },
    { title: 'Thứ', dataIndex: 'day', key: 'day', width: 80 },
    { title: 'Trạng thái', dataIndex: 'statusCalendar', key: 'statusCalendar', width: 120 },
    {
      title: 'Hành động', key: 'action', fixed: 'right', width: 180,
      render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Sửa</Button>
            <Popconfirm title="Xóa lịch" description="Bạn có chắc muốn xóa lịch này?" onConfirm={() => handleDelete(record.calendarId)} okText="Xóa" cancelText="Hủy">
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
      ),
    },
  ];

  const renderCreditClassOption = (cc) => {
    const lessonCurrent = parseInt(cc.lessonCurrent, 10);
    const lessonDataBase = parseInt(cc.lessonDataBase, 10);
    const isDisabled = lessonDataBase > 0 && lessonCurrent >= lessonDataBase;
    return (
        <Option key={cc.idCredit} value={Number(cc.idCredit)} label={`${cc.codeCreditClass} - ${cc.nameSubject}`} disabled={isDisabled} data-studentcount={cc.studentClassroom} >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong disabled={isDisabled} style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{`${cc.codeCreditClass} - ${cc.nameSubject}`}</Text>
            <Text type="secondary" disabled={isDisabled} style={{ marginLeft: '16px', flexShrink: 0 }}>{`Sĩ số: ${cc.studentClassroom} | Tiết đã xếp: ${cc.lessonCurrent}/${cc.lessonDataBase}`}</Text>
          </div>
        </Option>
    );
  };

  const renderRoomOption = (r) => (
      <Option key={r.idRoom} value={Number(r.idRoom)} label={`${r.facility} - ${r.nameRoom}`}>
        <div><Text strong>{`${r.facility} - ${r.nameRoom}`}</Text></div>
        <Text type="secondary">{`Máy HĐ: ${r.quantityActive} / Tổng: ${r.quantity}`}</Text>
      </Option>
  );

  const renderModalContent = () => {
    if (editingRecord) {
      // Form Sửa: Dùng autoForm (đã đổi tên)
      return (
          <Form form={autoForm} layout="vertical" onFinish={handleUpdateSubmit}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="weekSemesterId" label="Tuần học" rules={[{ required: true }]}><Select placeholder="Chọn tuần học" disabled>{weeks?.map(w => <Option key={w.idWeekTime} value={w.idWeekTime}>{w.time}</Option>)}</Select></Form.Item></Col>
              <Col span={12}><Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{createOptions.day?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col>
              <Col span={12}><Form.Item name="practiceCaseBeginId" label="Tiết bắt đầu" rules={[{ required: true }]}><Select placeholder="Chọn tiết bắt đầu">{createOptions.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col>
              <Col span={12}><Form.Item name="purposeUse" label="Ghi chú"><Input.TextArea rows={1} /></Form.Item></Col>
            </Row>
            <Form.Item style={{ textAlign: 'right' }}><Space><Button onClick={handleCancel}>Hủy</Button><Button type="primary" htmlType="submit">Cập nhật</Button></Space></Form.Item>
          </Form>
      );
    }

    return (
        <Tabs defaultActiveKey="1" destroyInactiveTabPane>
          <Tabs.TabPane tab="Xếp lịch Tự động" key="1">
            <Form form={autoForm} layout="vertical" onFinish={handleAutoSubmit} initialValues={{ allCasePerSession: 4 }}>
              <Form.Item name="creditClassId" label="Lớp tín chỉ" rules={[{ required: true }]}><Select showSearch placeholder="Chọn lớp tín chỉ" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>{createOptions.creditClass?.map(renderCreditClassOption)}</Select></Form.Item>
              <Form.Item name="idFacility" label="Cơ sở" rules={[{ required: true }]}><Select placeholder="Chọn cơ sở">{createOptions.facility?.map(f => <Option key={f.idFacility} value={Number(f.idFacility)}>{f.nameFacility}</Option>)}</Select></Form.Item>
              <Form.Item name="semesterYearAuto" label="Học kỳ - Năm học" rules={[{ required: true }]}><Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>{createOptions.semesterYear?.map(sy => <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>{sy.content}</Option>)}</Select></Form.Item>
              <Row gutter={16}><Col span={12}><Form.Item name="startWeekSemesterId" label="Tuần bắt đầu" rules={[{ required: true }]}><Select placeholder="Chọn tuần" disabled={!weeks.length}>{weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}</Select></Form.Item></Col><Col span={12}><Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{createOptions.day?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col></Row>
              <Row gutter={16}><Col span={12}><Form.Item name="practiceCaseBeginId" label="Tiết bắt đầu" rules={[{ required: true }]}><Select placeholder="Chọn tiết">{createOptions.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col><Col span={12}><Form.Item name="allCasePerSession" label="Số tiết / buổi" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }}/></Form.Item></Col></Row>
              <Form.Item name="purposeUse" label="Ghi chú / Mục đích"><Input.TextArea /></Form.Item>
              <Form.Item style={{ textAlign: 'right' }}><Space><Button onClick={handleCancel}>Hủy</Button><Button type="primary" htmlType="submit">Xếp lịch</Button></Space></Form.Item>
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Xếp lịch Thủ công" key="2">
            <Form form={manualForm} layout="vertical" onFinish={handleManualSubmit}>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="creditClassId" label="Lớp tín chỉ" rules={[{ required: true }]}><Select allowClear showSearch placeholder="Chọn lớp để tạo nhóm" onChange={handleCreditClassChangeForManual} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>{createOptions.creditClass?.map(renderCreditClassOption)}</Select></Form.Item></Col>
                <Col span={12}><Form.Item name="idFacility" label="Cơ sở" rules={[{ required: true }]}><Select placeholder="Chọn cơ sở">{createOptions.facility?.map(f => <Option key={f.idFacility} value={Number(f.idFacility)}>{f.nameFacility}</Option>)}</Select></Form.Item></Col>
              </Row>
              <Form.Item name="semesterYearManual" label="Học kỳ - Năm học" rules={[{ required: true }]}><Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>{createOptions.semesterYear?.map(sy => <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>{sy.content}</Option>)}</Select></Form.Item>
              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f0f0f0' }}/>
              <Form.List name="calendarDetail">
                {(fields, { add, remove }) => (
                    <><div style={{maxHeight: '40vh', overflowY: 'auto', paddingRight: '10px'}}>{fields.map(({ key, name }, index) => (<Card size="small" key={key} style={{ marginBottom: 16 }} title={`Chi tiết cho Nhóm ${index + 1}`} extra={(<Tooltip title={isCreditClassSelectedForManual ? "Không thể xóa nhóm được tạo tự động" : "Xóa chi tiết"}><Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} disabled={isCreditClassSelectedForManual} /></Tooltip>)}><Row gutter={16}><Col span={12}><Form.Item name={[name, 'groupId']} label="Nhóm/Tổ" rules={[{ required: true }]}><InputNumber placeholder="Nhóm" style={{ width: "100%" }} disabled /></Form.Item></Col><Col span={12}><Form.Item name={[name, 'dayId']} label="Thứ" rules={[{ required: true }]}><Select placeholder="Chọn thứ">{createOptions.day?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}</Select></Form.Item></Col></Row><Row gutter={16}><Col span={12}><Form.Item name={[name, 'weekSemesterId']} label="Tuần học" rules={[{ required: true }]}><Select placeholder="Chọn tuần" disabled={!weeks.length}>{weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}</Select></Form.Item></Col><Col span={12}><Form.Item name={[name, 'roomId']} label="Phòng" rules={[{ required: true }]}><Select showSearch placeholder="Chọn phòng" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>{createOptions.room?.map(renderRoomOption)}</Select></Form.Item></Col></Row><Row gutter={16}><Col span={12}><Form.Item name={[name, 'practiceCaseBeginId']} label="Tiết BĐ" rules={[{ required: true }]}><Select placeholder="Chọn tiết">{createOptions.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}</Select></Form.Item></Col><Col span={12}><Form.Item name={[name, 'allCase']} label="Số tiết" rules={[{ required: true }]}><InputNumber min={1} style={{ width: "100%" }}/></Form.Item></Col></Row><Form.Item name={[name, 'purposeUse']} label="Ghi chú"><Input /></Form.Item></Card>))}</div><Form.Item><Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={isCreditClassSelectedForManual}>Thêm nhóm khác (Chỉ dùng khi không chọn Lớp tín chỉ)</Button></Form.Item></>
                )}
              </Form.List>
              <Form.Item style={{ textAlign: 'right' }}><Space><Button onClick={handleCancel}>Hủy</Button><Button type="primary" htmlType="submit">Xếp lịch</Button></Space></Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
    );
  };

  return (
      <Card>
        <Title level={3}>Quản lý Lịch thực hành</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} style={{ marginBottom: 16 }}>Thêm Lịch</Button>
        <Table columns={columns} dataSource={schedules} loading={loading} rowKey="calendarId" bordered scroll={{ x: 1500 }} />
        <Modal title={editingRecord ? "Cập nhật Lịch" : "Thêm mới Lịch"} open={isModalVisible} onCancel={handleCancel} footer={null} width={800} destroyOnClose>
          {renderModalContent()}
        </Modal>
      </Card>
  );
};

export default CalendarManagement;