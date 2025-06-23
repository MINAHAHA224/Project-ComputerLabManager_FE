import React from 'react';
import {
    BookOutlined,
    TeamOutlined,
    TrophyOutlined,
    RocketOutlined,
    StarOutlined,
    GlobalOutlined,
    SafetyOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const ImagePlaceholder = ({
    type = 'default',
    width = '100%',
    height = '200px',
    icon,
    className = ''
}) => {
    const getIcon = () => {
        if (icon) return icon;

        const iconMap = {
            team: <TeamOutlined />,
            global: <GlobalOutlined />,
            rocket: <RocketOutlined />,
            star: <StarOutlined />,
            trophy: <TrophyOutlined />,
            book: <BookOutlined />,
            safety: <SafetyOutlined />,
            calendar: <CalendarOutlined />,
            default: <BookOutlined />
        };

        return iconMap[type] || iconMap.default;
    };

    const style = {
        width,
        height,
        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '48px',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div className={`image-placeholder ${className}`} style={style}>
            {/* Background pattern */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none'
                }}
            />

            {/* Icon */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {getIcon()}
            </div>

            {/* Corner decoration */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default ImagePlaceholder; 