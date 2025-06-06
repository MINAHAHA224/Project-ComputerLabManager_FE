import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import creditClassApi from '../../api/creditClassApi';

const { Title } = Typography;
const { Option } = Select;

const CreditClassManagement = () => {
    const [creditClasses, setCreditClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // States for form dropdowns
    const [subjects, setSubjects] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [teacherLoading, setTeacherLoading] = useState(false);

    const [form] = Form.useForm();

    const fetchCreditClasses = async () => {
        setLoading(true);
        try {
            const response = await creditClassApi.getAll();
            setCreditClasses(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách lớp tín chỉ!');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [subjectsRes, classroomsRes] = await Promise.all([
                creditClassApi.getSubjects(),
                creditClassApi.getClasses(),
            ]);
            setSubjects(subjectsRes.data || []);
            setClassrooms(classroomsRes.data || []);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu cho form!');
        }
    };

    useEffect(() => {
        fetchCreditClasses();
        fetchDropdownData();
    }, []);

    const handleSubjectChange = async (subjectId) => {
        // Reset teacher field when subject changes
        form.setFieldsValue({ teacherId: undefined });
        setTeachers([]);

        const selectedSubject = subjects.find(s => s.subjectId === subjectId);
        if (!selectedSubject) return;

        // Extract subject code from content (e.g., "INT13187_CLC - ...")
        const subjectCode = selectedSubject.content.split(' - ')[0];

        setTeacherLoading(true);
        try {
            const response = await creditClassApi.getTeachersBySubject(subjectCode);
            setTeachers(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách giáo viên!');
        } finally {
            setTeacherLoading(false);
        }
    };

    const showAddModal = () => {
        setEditingRecord(null);
        form.resetFields();
        setTeachers([]); // Clear teachers list
        setIsModalVisible(true);
    };

    const showEditModal = async (record) => {
        setEditingRecord(record);
        try {
            const response = await creditClassApi.getById(record.creditClassId);
            const detail = response.data;
            form.setFieldsValue({
                numberOfStudentLTC: detail.numberOfStudentLTC,
                group: detail.group.trim(),
                // `teacher` trong DTO detail là string, ta cần ID.
                // May mắn là API update trả về `listTeacher`
                // Ta sẽ tìm teacherId từ listTeacher đó
            });
            setTeachers(detail.listTeacher || []);
            // Tìm và set teacherId
            const currentTeacher = detail.listTeacher.find(t => t.content.includes(detail.teacher));
            if(currentTeacher) {
                form.setFieldsValue({ teacherId: currentTeacher.teacherId });
            }
            setIsModalVisible(true);
        } catch(e) {
            message.error("Lỗi khi lấy chi tiết lớp tín chỉ!");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values) => {
        try {
            if (editingRecord) {
                const payload = {
                    creditClassId: editingRecord.creditClassId,
                    ...values,
                };
                await creditClassApi.update(payload);
                message.success('Cập nhật lớp tín chỉ thành công!');
            } else {
                await creditClassApi.create(values);
                message.success('Thêm lớp tín chỉ thành công!');
            }
            setIsModalVisible(false);
            fetchCreditClasses();
        } catch (error) {
            message.error(error.message || 'Thao tác thất bại!');
        }
    };

    const handleDelete = async (id) => {
        try {
            await creditClassApi.delete(id);
            message.success('Xóa lớp tín chỉ thành công!');
            fetchCreditClasses();
        } catch (error) {
            message.error(error.message || 'Xóa thất bại! Lớp có thể đã được lên lịch.');
        }
    };

    const columns = [
        { title: 'Mã LTC', dataIndex: 'codeCreditClass', key: 'codeCreditClass' },
        { title: 'Mã Lớp', dataIndex: 'classroom', key: 'classroom' },
        { title: 'Môn học', dataIndex: 'codeSubject', key: 'codeSubject' },
        { title: 'Sĩ số', dataIndex: 'numberOfStudentLTC', key: 'numberOfStudentLTC' },
        { title: 'Nhóm', dataIndex: 'group', key: 'group' },
        { title: 'Tổ hợp', dataIndex: 'combination', key: 'combination' },
        { title: 'Giáo viên', dataIndex: 'teacher', key: 'teacher' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Xóa lớp tín chỉ"
                        description="Bạn có chắc muốn xóa lớp này?"
                        onConfirm={() => handleDelete(record.creditClassId)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Title level={3}>Quản lý Lớp tín chỉ</Title>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showAddModal}
                style={{ marginBottom: 16 }}
            >
                Thêm Lớp tín chỉ
            </Button>
            <Table
                columns={columns}
                dataSource={creditClasses}
                loading={loading}
                rowKey="creditClassId"
                bordered
                scroll={{ x: 1300 }}
            />

            <Modal
                title={editingRecord ? 'Cập nhật Lớp tín chỉ' : 'Thêm mới Lớp tín chỉ'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" name="creditclass_form" onFinish={onFinish}>
                    {/* Fields for Create mode */}
                    {!editingRecord && (
                        <>
                            <Form.Item name="idSubject" label="Môn học" rules={[{ required: true }]}>
                                <Select placeholder="Chọn môn học" onChange={handleSubjectChange}>
                                    {subjects.map(s => <Option key={s.subjectId} value={s.subjectId}>{s.content}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="idClassroom" label="Lớp học" rules={[{ required: true }]}>
                                <Select placeholder="Chọn lớp học">
                                    {classrooms.map(c => <Option key={c.classroomId} value={c.classroomId}>{c.content}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="codeCreditClass" label="Mã lớp tín chỉ" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </>
                    )}

                    {/* Fields for both Create and Edit mode */}
                    <Form.Item name="teacherId" label="Giáo viên" rules={[{ required: true }]}>
                        <Select placeholder="Chọn giáo viên" loading={teacherLoading} disabled={teachers.length === 0 && !editingRecord}>
                            {teachers.map(t => <Option key={t.teacherId} value={t.teacherId}>{t.content}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="numberOfStudentLTC" label="Sĩ số lớp tín chỉ" rules={[{ required: true }]}>
                        <InputNumber min={15} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="group" label="Nhóm" rules={[{ required: true }, { pattern: /^\d{2}$/, message: "Nhóm phải có 2 chữ số" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingRecord ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CreditClassManagement;