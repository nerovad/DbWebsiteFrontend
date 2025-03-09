import React, { useState } from "react";
import "./Auth.scss";

interface AuthProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthOpen: React.Dispatch<React.SetStateAction<boolean>>;
  authMode: "login" | "register";
  setAuthMode: React.Dispatch<React.SetStateAction<"login" | "register">>;
}

const Auth: React.FC<AuthProps> = ({ setIsLoggedIn, setIsAuthOpen, authMode, setAuthMode }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = authMode === "login" ? "http://localhost:5000/login" : "http://localhost:5000/register";
    const body = authMode === "login"
      ? { email: emailOrUsername, username: emailOrUsername, password }
      : { email: emailOrUsername, username: emailOrUsername, password, confirmPassword };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (response.ok) {
      if (authMode === "login") {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        setIsAuthOpen(false); // ✅ Close modal on login
      } else {
        alert("Registration successful! You can now log in.");
        setAuthMode("login"); // ✅ Switch to login
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <button className="close-btn" onClick={() => setIsAuthOpen(false)}>✖</button>
        <h2>{authMode === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {authMode === "register" && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button type="submit">{authMode === "login" ? "Login" : "Register"}</button>
        </form>
        <p>
          {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
            {authMode === "login" ? " Register" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;

