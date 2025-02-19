import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./Chatbox.scss";

// Connect to WebSocket server
const socket = io("http://localhost:5000");

interface ChatboxProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  channelId: string;
}

const Chatbox: React.FC<ChatboxProps> = ({ isOpen, setIsOpen, channelId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ user: string; content: string }[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const channelIdRef = useRef(channelId); // ✅ Store latest channelId

  // Fetch user ID from localStorage (stored during login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            setUserId(data.id);
          }
        })
        .catch((err) => console.error("Error fetching user ID:", err));
    }
  }, []);

  // ✅ Ensure `channelIdRef` updates properly
  useEffect(() => {
    if (channelId) {
      channelIdRef.current = channelId; // ✅ Update ref with latest channelId
      console.log(` Chatbox detected new channelId: ${channelIdRef.current}`);

      socket.emit("joinRoom", { channelId: channelIdRef.current });

      socket.on("chatHistory", (chatHistory) => {
        console.log(" Chat History Loaded:", chatHistory);
        setMessages(chatHistory);
      });

      return () => {
        socket.off("chatHistory");
      };
    }
  }, [channelId]);

  // ✅ Ensure the correct `channelId` is used before sending a message
  const sendMessage = () => {
    const currentChannelId = channelIdRef.current; // ✅ Get latest channelId

    console.log(" Preparing to send message...", { userId, channelId: currentChannelId, message });

    if (!userId || !currentChannelId || message.trim() === "") {
      console.log("❌ Cannot send message. Missing values:", { userId, channelId: currentChannelId, message });
      return;
    }

    console.log(` Sending message to room ${currentChannelId}: "${message}" from user ${userId}`);
    socket.emit("sendMessage", { userId, message, channelId: currentChannelId });
    setMessage("");
  };

  return (
    <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
      <div className={`chatbox-content ${isOpen ? "open" : ""}`}>
        <h3>Live Chat</h3>
        <div className="messages">
          {messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.user}:</strong> {msg.content}
            </p>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbox;

