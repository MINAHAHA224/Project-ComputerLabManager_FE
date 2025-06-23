import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Input, Typography, Avatar, Space, Divider } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import "./ChatWidget.css";

const { Text } = Typography;
const { TextArea } = Input;

const AI_AVATAR = (
  <Avatar style={{ backgroundColor: "#1890ff" }} icon={<RobotOutlined />} />
);
const USER_AVATAR = (
  <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là Trợ lý AI, bạn cần hỗ trợ gì?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const botMsgIdRef = useRef(null);
  const aiTextRef = useRef("");

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Đếm số từ trong input
  const wordCount = inputMessage.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = 50;
  const isOverWordLimit = wordCount > maxWords;

  // Gửi message tới endpoint /chat (hỗ trợ stream plain text)
  const sendMessage = async () => {
    if (!inputMessage.trim() || isOverWordLimit) return;
    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const url = `http://localhost:5001/chat?accessToken=${encodeURIComponent(token || "")}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputMessage }),
      });
      if (!response.body) throw new Error("No stream body");

      aiTextRef.current = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      const botMsgId = Date.now() + 1;
      botMsgIdRef.current = botMsgId;

      // Đảm bảo message bot đã có trong state trước khi stream
      await new Promise((resolve) => {
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            text: "",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
            isMarkdown: true,
            isStreaming: true,
          },
        ]);
        setTimeout(resolve, 0); // Đợi 1 tick để state cập nhật
      });

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          aiTextRef.current += chunk;
          setMessages((prev) => {
            // Lọc bỏ <think>...</think> khỏi text
            const cleanText = aiTextRef.current.replace(
              /<think>[\s\S]*?<\/think>/g,
              ""
            );
            const updated = prev.map((msg) =>
              msg.id === botMsgIdRef.current ? { ...msg, text: cleanText } : msg
            );
            return updated;
          });
        }
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgIdRef.current ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Đóng chat sẽ chỉ còn icon chat
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="chat-widget open">
          <Card
            className="chat-card"
            title={
              <div
                className="chat-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Space>
                  {AI_AVATAR}
                  <span style={{ fontWeight: 600, color: "#1890ff" }}>
                    Trợ lý AI
                  </span>
                </Space>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={handleClose}
                  style={{ color: "#1890ff" }}
                  aria-label="Đóng chat"
                />
              </div>
            }
            bordered={false}
            bodyStyle={{
              padding: 12,
              paddingBottom: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
            {/* Wrapper flex column: messages + input */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                height: "100%",
              }}
            >
              <div
                className="messages-container"
                style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
                    style={{
                      display: "flex",
                      flexDirection:
                        msg.sender === "user" ? "row-reverse" : "row",
                      alignItems: "flex-end",
                      marginBottom: 8,
                    }}
                  >
                    {msg.sender === "bot" ? AI_AVATAR : USER_AVATAR}
                    <div
                      className="message-content"
                      style={{
                        background:
                          msg.sender === "user" ? "#e6f7ff" : "#f5f5f5",
                        color: "#222",
                        borderRadius: 12,
                        padding: "8px 12px",
                        margin: "0 8px",
                        maxWidth: 220,
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.sender === "bot" && msg.isMarkdown ? (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      ) : (
                        <Text>{msg.text}</Text>
                      )}
                      <div
                        className="message-time"
                        style={{
                          fontSize: 10,
                          color: "#888",
                          textAlign: msg.sender === "user" ? "right" : "left",
                        }}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <Divider style={{ margin: "8px 0", flexShrink: 0 }} />
              <div className="input-container" style={{ flexShrink: 0 }}>
                <TextArea
                  value={inputMessage}
                  onChange={(e) => {
                    const value = e.target.value;
                    const words = value.trim().split(/\s+/).filter(Boolean);
                    if (words.length <= maxWords) {
                      setInputMessage(value);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  disabled={loading}
                  style={{ flex: 1, resize: "none" }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendMessage}
                  loading={loading}
                  disabled={!inputMessage.trim() || isOverWordLimit}
                  aria-label="Gửi tin nhắn"
                />
              </div>
              {/* Hiển thị cảnh báo nếu quá 50 từ */}
              {isOverWordLimit && (
                <div
                  style={{
                    color: "red",
                    fontSize: 12,
                    marginTop: 2,
                    marginLeft: 4,
                  }}
                >
                  Tin nhắn không được vượt quá 50 từ.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
      {/* Chat Icon */}
      {!isOpen && (
        <Button
          className="chat-icon"
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={() => setIsOpen(true)}
          aria-label="Mở chat"
        />
      )}
    </>
  );
};

export default ChatWidget;
