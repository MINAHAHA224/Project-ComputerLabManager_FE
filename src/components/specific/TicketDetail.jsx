import React from 'react';
import { Descriptions, Card, Row, Col, Typography, Tag } from 'antd';

const { Title } = Typography;

const TicketDetail = ({ ticket }) => {
    if (!ticket) return null;


    const STATUS_MAP = {
        WAITING_DEAN_APPROVAL: { label: "Chờ Trưởng Khoa duyệt", color: "warning" },
        WAITING_REGISTRAR_PROCESSING: { label: "Chờ Giáo Vụ xử lý", color: "warning" },
        WAITING_FACILITIES_APPROVAL: { label: "Chờ CSVC duyệt", color: "warning" },
        PROCESSED_SUCCESSFULLY: { label: "Đã xử lý thành công", color: "success" },
        NOT_REQUIRED: { label: "Không yêu cầu duyệt", color: "default" },
        PENDING_APPROVAL: { label: "Chờ duyệt", color: "warning" },
        APPROVED: { label: "Đã duyệt", color: "success" },
        REJECTED: { label: "Từ chối", color: "error" },
    };

    const renderStatus = (status) => {
        const statusInfo = STATUS_MAP[status];
        if (statusInfo) {
            return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
        }
        return <Tag color="geekblue">{status}</Tag>;
    };
   

    return (
        <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="ID Yêu cầu">{ticket.requestId}</Descriptions.Item>
                <Descriptions.Item label="Loại yêu cầu">{ticket.typeRequest}</Descriptions.Item>
                <Descriptions.Item label="Người gửi">{ticket.userRequest}</Descriptions.Item>
                <Descriptions.Item label="Ngày gửi">{ticket.dateRequest}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái chung">
                    <>{renderStatus(ticket.statusOverall)}</>
                </Descriptions.Item>
            </Descriptions>

            <Row gutter={24}>
                <Col span={12}>
                    <Card title="Thông tin gốc / Trước thay đổi">
                        {ticket.weekSemesterOld ? (
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Tuần">{ticket.weekSemesterOld}</Descriptions.Item>
                                <Descriptions.Item label="Thứ">{ticket.dayOld}</Descriptions.Item>
                                <Descriptions.Item label="Tiết BĐ">{ticket.practiceCaseBeginOld}</Descriptions.Item>
                                <Descriptions.Item label="Số tiết">{ticket.allCaseOld}</Descriptions.Item>
                                <Descriptions.Item label="Phòng">{ticket.roomOld}</Descriptions.Item>
                                <Descriptions.Item label="Ghi chú">{ticket.noteOld}</Descriptions.Item>
                            </Descriptions>
                        ) : <p>Không có thông tin gốc (Yêu cầu mượn phòng mới).</p>}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Thông tin đề xuất / Sau thay đổi">
                        {ticket.weekSemesterNew ? (
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Tuần">{ticket.weekSemesterNew}</Descriptions.Item>
                                <Descriptions.Item label="Thứ">{ticket.dayNew}</Descriptions.Item>
                                <Descriptions.Item label="Tiết BĐ">{ticket.practiceCaseBeginNew}</Descriptions.Item>
                                <Descriptions.Item label="Số tiết">{ticket.allCaseNew}</Descriptions.Item>
                                <Descriptions.Item label="Phòng">{ticket.roomNew || '(Chờ xếp)'}</Descriptions.Item>
                                <Descriptions.Item label="Lý do/Ghi chú mới">{ticket.noteNew}</Descriptions.Item>
                            </Descriptions>
                        ) : <p>Không có thông tin đề xuất.</p>}
                    </Card>
                </Col>
            </Row>

            <Title level={5} style={{marginTop: 24}}>Lịch sử duyệt</Title>
            <Descriptions bordered column={1} size="small">
                {/*<Descriptions.Item label="Trưởng khoa">*/}
                {/*    {ticket.doneTK === "Đã duyệt" ? `${renderStatus(ticket.doneTK)} bởi ${ticket.modified_TK} lúc ${ticket.created_TK}` : 'Chưa xử lý'}*/}
                {/*</Descriptions.Item>*/}
                <Descriptions.Item label="Trưởng khoa">
                    {ticket.doneTK === "Đã duyệt" ? (
                        <>
                            {renderStatus(ticket.doneTK)} bởi {ticket.modified_TK} lúc {ticket.created_TK}
                        </>
                    ) : <>  {renderStatus(ticket.doneTK)} </>}
                </Descriptions.Item>
                <Descriptions.Item label="Giáo vụ">
                    {ticket.doneGVU === "Đã duyệt" ? (
                        <>
                            {renderStatus(ticket.doneGVU)} bởi {ticket.modified_GVU} lúc {ticket.created_GVU}
                        </>
                    ) : <>  {renderStatus(ticket.doneGVU)} </>}
                </Descriptions.Item>

                <Descriptions.Item label="CSVC">
                    {ticket.doneCSVC === "Đã duyệt" ? (
                        <>
                            {renderStatus(ticket.doneCSVC)} bởi {ticket.modified_CSVC} lúc {ticket.created_CSVC}
                        </>
                    ) : <>  {renderStatus(ticket.doneCSVC)} </>}
                </Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default TicketDetail;