import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./Chatbox.scss";
import RightArrowIcon from "../../assets/Right_Arrow.svg";

// Connect to WebSocket server
const socket = io("http://localhost:5000");

interface ChatboxProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  channelId: string; // Pass the current channel ID
}

const Chatbox: React.FC<ChatboxProps> = ({ isOpen, setIsOpen, channelId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ user: string; content: string }[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Join a new chat room when the channelId changes

  useEffect(() => {
    console.log(`🔹 Chatbox is joining room: ${channelId}`); // ✅ Debug Log
    if (channelId) {
      socket.emit("joinRoom", { channelId });

      socket.on("chatHistory", (chatHistory) => {
        console.log("📜 Chat History Loaded:", chatHistory);
        setMessages(chatHistory);
      });

      return () => {
        socket.off("chatHistory");
      };
    }
  }, [channelId]);


  // Fetch user ID from localStorage
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

  // Listen for new messages
  useEffect(() => {
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // Send message to WebSocket
  const sendMessage = () => {
    if (message.trim() === "" || !userId) {
      console.log("❌ Cannot send message. userId or channelId is missing!", {
        userId,
        channelId,
        message,
      });
      return;
    }

    console.log(`Sending message to room ${channelId}: "${message}"`);
    socket.emit("sendMessage", { userId, message, channelId });
    setMessage("");
  };

  return (
    <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
      <button className="toggle-button-right" onClick={() => setIsOpen(!isOpen)}>
        <img src={RightArrowIcon} alt="Toggle Chat" />
      </button>

      <div className={`chatbox-content ${isOpen ? "open" : ""}`}>
        <h3>Live Chat</h3>
        <div className="messages">
          {messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.user}:</strong> {msg.content}
            </p>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="chat-button">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;

