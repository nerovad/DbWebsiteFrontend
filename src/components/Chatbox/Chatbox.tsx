import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Chatbox.scss";
import { useChatStore } from "../../store/useChatStore";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

interface ChatboxProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Chatbox: React.FC<ChatboxProps> = ({ isOpen, setIsOpen }) => {
  const { channelId, userId, setUserId, messages, setMessages, addMessage } = useChatStore();
  const [message, setMessage] = useState("");

  // Fetch userId from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.id) {
            console.log(`Loaded userId: ${data.id}`);
            setUserId(data.id);
          } else {
            console.error("No userId found in profile response!");
          }
        })
        .catch((err) => console.error("Error fetching user ID:", err));
    }
  }, [setUserId]); // ✅ Runs once when the component mounts

  // ✅ Join room when `channelId` updates

  useEffect(() => {
    console.log(`Chatbox detected new channelId: ${channelId}`);
    if (channelId) {
      socket.emit("joinRoom", { channelId });

      socket.on("chatHistory", (chatHistory) => {
        console.log("📜 Chat History Loaded:", chatHistory);

        // ✅ Ensure each message has a 'user' field before saving to Zustand
        const formattedMessages = chatHistory.map((msg) => ({
          user: msg.username || "Unknown", // Fallback if username is missing
          content: msg.content,
          created_at: msg.created_at,
        }));

        setMessages(formattedMessages);
      });

      return () => {
        socket.off("chatHistory");
      };
    }
  }, [channelId]);


  const sendMessage = () => {
    if (!userId || !channelId || message.trim() === "") {
      console.log("Cannot send message. Missing values:", { userId, channelId, message });
      return;
    }

    console.log(`Sending message to room ${channelId}: "${message}" from user ${userId}`);
    socket.emit("sendMessage", { userId, message, channelId });

    // ✅ Fetch the username from Zustand or set fallback as "Unknown"
    fetch("http://localhost:5000/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const username = data?.username || "Unknown";
        addMessage({ user: username, content: message });
      })
      .catch((err) => {
        console.error("Error fetching username:", err);
        addMessage({ user: "Unknown", content: message }); // Fallback
      });

    setMessage("");
  };


  return (
    <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
      <div className={`chatbox-content ${isOpen ? "open" : ""}`}>
        <h3>Live Chat</h3>
        <div className="messages">
          {messages.map((msg, index) => (
            <p key={index}><strong>{msg.user}:</strong> {msg.content}</p>
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

