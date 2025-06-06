import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Select, message, Popconfirm, Card, Typography, Tabs, InputNumber, Input, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import calendarApi from '../../api/calendarApi';

const { Title } = Typography;
const { Option } = Select;

const CalendarManagement = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // State for create/edit form data
    const [formData, setFormData] = useState({
        creditClasses: [],
        days: [],
        practiceCases: [],
        facilities: [],
        semesterYears: [],
    });
    const [weeks, setWeeks] = useState([]);
    const [form] = Form.useForm();

    // State for manual schedule form
    const [manualForm] = Form.useForm();

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await calendarApi.getAll();
            setSchedules(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách lịch!');
        } finally {
            setLoading(false);
        }
    };

    const fetchFormData = async () => {
        try {
            const response = await calendarApi.getCreateData();
            setFormData(response.data || {});
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu form!');
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchFormData();
    }, []);

    const handleSemesterChange = async (semesterYear) => {
        if (!semesterYear) {
            setWeeks([]);
            form.setFieldsValue({ startWeekSemesterId: undefined });
            return;
        }
        try {
            const response = await calendarApi.getWeeksBySemester(semesterYear);
            setWeeks(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách tuần!');
        }
    };

    const showAddModal = () => {
        setEditingRecord(null);
        form.resetFields();
        manualForm.resetFields();
        manualForm.setFieldsValue({ calendarDetail: [{}] }); // Reset manual form
        setWeeks([]);
        setIsModalVisible(true);
    };

    const showEditModal = async (record) => {
        setEditingRecord(record);
        try {
            const response = await calendarApi.getById(record.calendarId);
            const detail = response.data;
            const currentData = detail.userCurrent;

            // Cần tìm semesterYear từ weekSemesterId
            const week = detail.dataBase.weekSemester?.find(w => w.idWeekSemester === currentData.weekSemesterId);
            const semesterYear = week ? detail.dataBase.semesterYear.find(sy => sy.content.includes(week.year))?.idSemesterYear : undefined;

            await handleSemesterChange(semesterYear); // Tải lại danh sách tuần

            form.setFieldsValue({
                ...currentData,
                semesterYear: semesterYear,
            });
            setIsModalVisible(true);
        } catch (e) {
            message.error("Lỗi khi lấy chi tiết lịch!");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleAutoSubmit = async (values) => {
        try {
            await calendarApi.createAuto(values);
            message.success('Xếp lịch tự động thành công!');
            setIsModalVisible(false);
            fetchSchedules();
        } catch (error) {
            message.error(error.message || 'Xếp lịch tự động thất bại!');
        }
    };

    const handleManualSubmit = async (values) => {
        try {
            await calendarApi.createManual(values);
            message.success('Xếp lịch thủ công thành công!');
            setIsModalVisible(false);
            fetchSchedules();
        } catch (error) {
            message.error(error.message || 'Xếp lịch thủ công thất bại!');
        }
    };

    const handleUpdateSubmit = async (values) => {
        try {
            const payload = {
                calendarId: editingRecord.calendarId,
                ...values,
            }
            await calendarApi.update(payload);
            message.success('Cập nhật lịch thành công!');
            setIsModalVisible(false);
            fetchSchedules();
        } catch (error) {
            message.error(error.message || "Cập nhật thất bại!");
        }
    }

    const handleDelete = async (id) => {
        try {
            await calendarApi.delete(id);
            message.success('Xóa lịch thành công!');
            fetchSchedules();
        } catch (error) {
            message.error(error.message || 'Xóa thất bại!');
        }
    };

    const columns = [
        { title: 'ID Lịch', dataIndex: 'calendarId', key: 'calendarId', width: 80 },
        { title: 'Môn học', dataIndex: 'nameSubject', key: 'nameSubject' },
        { title: 'Giáo viên', dataIndex: 'nameTeacher', key: 'nameTeacher' },
        { title: 'Phòng', dataIndex: 'nameRoom', key: 'nameRoom' },
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        { title: 'Thứ', dataIndex: 'day', key: 'day' },
        { title: 'Tiết BĐ', dataIndex: 'lessonBegin', key: 'lessonBegin' },
        { title: 'Số tiết', dataIndex: 'lesson', key: 'lesson' },
        { title: 'Trạng thái', dataIndex: 'statusCalendar', key: 'statusCalendar' },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Xóa lịch"
                        description="Bạn có chắc muốn xóa lịch này?"
                        onConfirm={() => handleDelete(record.calendarId)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const modalContent = () => {
        if (editingRecord) {
            return ( // Form Sửa
                <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="weekSemesterId" label="Tuần học" rules={[{ required: true }]}>
                                <Select placeholder="Chọn tuần học" disabled>
                                    {formData.weekSemester?.map(w => <Option key={w.idWeekSemester} value={w.idWeekSemester}>{w.time}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}>
                                <Select placeholder="Chọn thứ">
                                    {formData.day?.map(d => <Option key={d.idDay} value={d.idDay}>{d.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="practiceCaseBeginId" label="Tiết bắt đầu" rules={[{ required: true }]}>
                                <Select placeholder="Chọn tiết bắt đầu">
                                    {formData.practiceCase?.map(pc => <Option key={pc.idPracticeCase} value={pc.idPracticeCase}>{pc.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="purposeUse" label="Ghi chú">
                                <Input.TextArea rows={1} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Cập nhật</Button>
                        </Space>
                    </Form.Item>
                </Form>
            )
        }
        // Form Thêm mới với 2 Tabs
        return (
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Xếp lịch Tự động" key="1">
                    <Form form={form} layout="vertical" onFinish={handleAutoSubmit}>
                        {/* Các trường cho xếp lịch tự động */}
                        <Form.Item name="creditClassId" label="Lớp tín chỉ" rules={[{ required: true }]}>
                            <Select placeholder="Chọn lớp tín chỉ">
                                {formData.creditClasses?.map(cc => <Option key={cc.idCredit} value={Number(cc.idCredit)}>{`${cc.codeCreditClass} - ${cc.nameSubject}`}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="idFacility" label="Cơ sở" rules={[{ required: true }]}>
                            <Select placeholder="Chọn cơ sở">
                                {formData.facilities?.map(f => <Option key={f.idFacility} value={Number(f.idFacility)}>{f.nameFacility}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Học kỳ - Năm học" rules={[{ required: true }]}>
                            <Select placeholder="Chọn học kỳ" onChange={handleSemesterChange}>
                                {formData.semesterYears?.map(sy => <Option key={sy.idSemesterYear} value={sy.idSemesterYear}>{sy.content}</Option>)}
                            </Select>
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="startWeekSemesterId" label="Tuần bắt đầu" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn tuần học" disabled={!weeks.length}>
                                        {weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="dayId" label="Thứ" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn thứ">
                                        {formData.days?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="practiceCaseBeginId" label="Tiết bắt đầu" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn tiết bắt đầu">
                                        {formData.practiceCases?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="allCasePerSession" label="Số tiết / buổi" rules={[{ required: true }]}>
                                    <InputNumber min={1} style={{ width: '100%' }}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="purposeUse" label="Ghi chú / Mục đích">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={handleCancel}>Hủy</Button>
                                <Button type="primary" htmlType="submit">Xếp lịch</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Xếp lịch Thủ công" key="2">
                    <Form form={manualForm} layout="vertical" onFinish={handleManualSubmit}>
                        {/* Các trường chung cho xếp lịch thủ công */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="creditClassId" label="Lớp tín chỉ" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn lớp tín chỉ">
                                        {formData.creditClasses?.map(cc => <Option key={cc.idCredit} value={Number(cc.idCredit)}>{`${cc.codeCreditClass} - ${cc.nameSubject}`}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="idFacility" label="Cơ sở" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn cơ sở">
                                        {formData.facilities?.map(f => <Option key={f.idFacility} value={Number(f.idFacility)}>{f.nameFacility}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Form list động */}
                        <Form.List name="calendarDetail">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card size="small" key={key} style={{ marginBottom: 16 }}>
                                            <Row gutter={16}>
                                                <Col span={22}>
                                                    <Form.Item {...restField} name={[name, 'groupId']} label="Nhóm/Tổ" rules={[{ required: true }]}>
                                                        <InputNumber placeholder="Nhóm" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                    <Form.Item {...restField} name={[name, 'weekSemesterId']} label="Tuần học" rules={[{ required: true }]}>
                                                        <Select placeholder="Chọn tuần học" disabled={!weeks.length}>
                                                            {weeks.map(w => <Option key={w.idWeekTime} value={Number(w.idWeekTime)}>{w.time}</Option>)}
                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item {...restField} name={[name, 'dayId']} label="Thứ" rules={[{ required: true }]}>
                                                        <Select placeholder="Chọn thứ">
                                                            {formData.days?.map(d => <Option key={d.idDay} value={Number(d.idDay)}>{d.name}</Option>)}
                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item {...restField} name={[name, 'practiceCaseBeginId']} label="Tiết bắt đầu" rules={[{ required: true }]}>
                                                        <Select placeholder="Chọn tiết">
                                                            {formData.practiceCases?.map(pc => <Option key={pc.idPracticeCase} value={Number(pc.idPracticeCase)}>{pc.name}</Option>)}
                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item {...restField} name={[name, 'allCase']} label="Số tiết" rules={[{ required: true }]}>
                                                        <InputNumber min={1} style={{ width: '100%' }}/>
                                                    </Form.Item>
                                                    <Form.Item {...restField} name={[name, 'roomId']} label="Phòng" rules={[{ required: true }]}>
                                                        <InputNumber placeholder="ID Phòng" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                    <Form.Item {...restField} name={[name, 'purposeUse']} label="Ghi chú">
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Tooltip title="Xóa chi tiết này">
                                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                                    </Tooltip>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Thêm chi tiết lịch
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>

                        <Form.Item style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={handleCancel}>Hủy</Button>
                                <Button type="primary" htmlType="submit">Xếp lịch</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        )
    }

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
                dataSource={schedules}
                loading={loading}
                rowKey="calendarId"
                bordered
                scroll={{ x: 1500 }}
            />
            <Modal
                title={editingRecord ? 'Cập nhật Lịch' : 'Thêm mới Lịch'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
                destroyOnClose // Rất quan trọng để reset form list động
            >
                {modalContent()}
            </Modal>
        </Card>
    );
};

export default CalendarManagement;