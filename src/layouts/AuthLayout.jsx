// src/layouts/AuthLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import {
    BookOutlined,
    SafetyOutlined,
    GlobalOutlined,
    StarOutlined,
    CalendarOutlined,
    TeamOutlined,
    TrophyOutlined,
    RocketOutlined
} from '@ant-design/icons';
import './AuthLayout.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const AuthLayout = () => {
    // Mock data cho tin tức - bạn có thể thay thế bằng API call
    const newsData = [
        {
            id: 1,
            date: '20/06/2025',
            title: 'Thứ trưởng Bộ Khoa học và Công nghệ Hoàng Minh làm việc với Học viện Công nghệ Bưu chính Viễn thông',
            excerpt: 'Thứ trưởng Bộ KH&CN đánh giá cao những thành tích của Học viện trong nghiên cứu khoa học và đào tạo nhân lực chất lượng cao...',
            icon: 'team'
        },
        {
            id: 2,
            date: '20/06/2025',
            title: 'PTIT ký thỏa thuận hợp tác với Công ty TNHH Một thành viên Tài nguyên và Môi trường Việt Nam',
            excerpt: 'Thỏa thuận hợp tác nhằm thúc đẩy các hoạt động nghiên cứu, phát triển công nghệ trong lĩnh vực tài nguyên và môi trường...',
            icon: 'global'
        },
        {
            id: 3,
            date: '19/06/2025',
            title: 'PTIT tham gia Liên minh AI Âu Lạc - Thúc đẩy phát triển trí tuệ nhân tạo',
            excerpt: 'Việc tham gia Liên minh AI Âu Lạc sẽ giúp PTIT tiếp cận những công nghệ tiên tiến nhất trong lĩnh vực AI...',
            icon: 'rocket'
        },
        {
            id: 4,
            date: '18/06/2025',
            title: 'PTIT hợp tác Meshlink (Hàn Quốc) đào tạo và nghiên cứu trong lĩnh vực 5G',
            excerpt: 'Chương trình hợp tác sẽ mang lại cơ hội đào tạo và nghiên cứu trong lĩnh vực công nghệ 5G tiên tiến...',
            icon: 'star'
        },
        {
            id: 5,
            date: '17/06/2025',
            title: 'Sinh viên PTIT đạt Giải Nhất Quốc gia vào Cuộc thi Vô địch Tin học Văn phòng',
            excerpt: 'Thành tích xuất sắc của sinh viên PTIT tại cuộc thi Vô địch Tin học Văn phòng cấp quốc gia...',
            icon: 'trophy'
        },
        {
            id: 6,
            date: '16/06/2025',
            title: 'PTIT là 1 trong 4 cơ sở giáo dục đại học tham gia xây dựng Đề án quốc gia về chuyển đổi số',
            excerpt: 'PTIT được chọn tham gia xây dựng Đề án quốc gia về chuyển đổi số, khẳng định vị thế dẫn đầu trong lĩnh vực công nghệ...',
            icon: 'book'
        }
    ];

    const getIcon = (iconType) => {
        const iconMap = {
            team: <TeamOutlined />,
            global: <GlobalOutlined />,
            rocket: <RocketOutlined />,
            star: <StarOutlined />,
            trophy: <TrophyOutlined />,
            book: <BookOutlined />
        };
        return iconMap[iconType] || <BookOutlined />;
    };

    return (
        <Layout className="auth-layout">
            {/* Header */}
            <header className="auth-header">
                <div className="auth-header-content">
                    <div className="auth-logo">
                        <img src="/assets/ptit-logo.svg" alt="PTIT Logo" />
                    </div>
                    <nav className="auth-nav">
                        <a href="#" className="auth-nav-item">Trang chủ</a>
                        <a href="#" className="auth-nav-item">Giới thiệu</a>
                        <a href="#" className="auth-nav-item">Đào tạo</a>
                        <a href="#" className="auth-nav-item">Tuyển sinh</a>
                        <a href="#" className="auth-nav-item">Tin tức</a>
                    </nav>
                </div>
            </header>

            <Content className="auth-content">
                {/* Hero Section với Form */}
                <section className="auth-hero">
                    <div className="auth-hero-content">
                        <div className="auth-hero-text">
                            <Title className="auth-hero-title">
                                HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
                            </Title>
                            <Paragraph className="auth-hero-subtitle">
                                Trường trọng điểm Quốc gia về Kỹ thuật, Công nghệ
                            </Paragraph>
                            <div className="auth-hero-features">
                                <div className="auth-feature-item">
                                    <SafetyOutlined className="auth-feature-icon" />
                                    <span>Hệ thống quản lý phòng máy tính hiện đại</span>
                                </div>
                                <div className="auth-feature-item">
                                    <GlobalOutlined className="auth-feature-icon" />
                                    <span>Kết nối toàn cầu với công nghệ tiên tiến</span>
                                </div>
                                <div className="auth-feature-item">
                                    <StarOutlined className="auth-feature-icon" />
                                    <span>Đào tạo nhân lực chất lượng cao</span>
                                </div>
                            </div>
                        </div>
                        <div className="auth-form-container">
                            <Outlet />
                        </div>
                    </div>
                </section>

                {/* News Section */}
                <section className="auth-news-section">
                    <div className="auth-news-container">
                        <div className="auth-news-header">
                            <Title className="auth-news-title">Tin tức nổi bật</Title>
                            <Paragraph className="auth-news-subtitle">
                                Cập nhật những thông tin mới nhất về hoạt động của Học viện
                            </Paragraph>
                        </div>
                        <div className="auth-news-grid">
                            {newsData.map((news) => (
                                <div key={news.id} className="auth-news-card">
                                    <div className="auth-news-image">
                                        {getIcon(news.icon)}
                                    </div>
                                    <div className="auth-news-content">
                                        <div className="auth-news-date">{news.date}</div>
                                        <h3 className="auth-news-card-title">{news.title}</h3>
                                        <p className="auth-news-excerpt">{news.excerpt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="auth-stats-section">
                    <div className="auth-stats-container">
                        <div className="auth-stats-grid">
                            <div className="auth-stat-item">
                                <div className="auth-stat-number">#1</div>
                                <div className="auth-stat-label">
                                    về Đổi mới sáng tạo theo xếp hạng của Scimago năm 2024
                                </div>
                            </div>
                            <div className="auth-stat-item">
                                <div className="auth-stat-number">30+</div>
                                <div className="auth-stat-label">
                                    Chương trình đào tạo trình độ Đại học
                                </div>
                            </div>
                            <div className="auth-stat-item">
                                <div className="auth-stat-number">10</div>
                                <div className="auth-stat-label">
                                    Chương trình đào tạo Thạc sĩ và Tiến sĩ
                                </div>
                            </div>
                            <div className="auth-stat-item">
                                <div className="auth-stat-number">03</div>
                                <div className="auth-stat-label">
                                    Văn phòng hợp tác nghiên cứu đào tạo, Liên kết đào tạo tại Nhật Bản và Hàn Quốc
                                </div>
                            </div>
                            <div className="auth-stat-item">
                                <div className="auth-stat-number">07</div>
                                <div className="auth-stat-label">
                                    Cơ sở nghiên cứu, đào tạo Đại học và đào tạo ngành hàng trên toàn lãnh thổ Việt Nam
                                </div>
                            </div>
                            <div className="auth-stat-item">
                                <div className="auth-stat-number">400+</div>
                                <div className="auth-stat-label">
                                    Đối tác trong và ngoài nước
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="auth-footer">
                    <div className="auth-footer-container">
                        <div className="auth-footer-grid">
                            <div className="auth-footer-section">
                                <h3>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</h3>
                                <p>Posts and Telecommunications Institute of Technology</p>
                                <br />
                                <p><strong>Số điện thoại liên hệ:</strong><br />024 3756 2186</p>
                                <p><strong>Email:</strong><br />ctsv@ptit.edu.vn</p>
                            </div>
                            <div className="auth-footer-section">
                                <h3>Đường dẫn liên kết</h3>
                                <a href="#">Bộ Khoa học và Công nghệ</a>
                                <a href="#">Viện Khoa học Kỹ thuật Bưu điện</a>
                                <a href="#">Viện Kinh tế Bưu điện</a>
                                <a href="#">Viện Công nghệ Thông tin và Truyền thông CDIT</a>
                            </div>
                            <div className="auth-footer-section">
                                <h3>Cơ sở đào tạo</h3>
                                <p><strong>Trụ sở chính:</strong><br />122 Hoàng Quốc Việt, Q. Cầu Giấy, Hà Nội</p>
                                <p><strong>Cơ sở đào tạo tại Hà Nội:</strong><br />Km10, Đường Nguyễn Trãi, Q. Hà Đông, Hà Nội</p>
                            </div>
                            <div className="auth-footer-section">
                                <h3>Cổng thông tin</h3>
                                <a href="#">Cổng thông tin Đào tạo</a>
                                <a href="#">Cổng thông tin Khoa học Công nghệ</a>
                                <a href="#">Cổng thông tin Hợp tác quốc tế</a>
                            </div>
                        </div>
                        <div className="auth-footer-bottom">
                            © Copyright 2024 HocVienCongNgheBuuChinhVienThong, All rights reserved ®
                            Học viện Công nghệ Bưu chính Viễn thông giữ bản quyền nội dung trên website này
                        </div>
                    </div>
                </footer>
            </Content>
        </Layout>
    );
};

export default AuthLayout;