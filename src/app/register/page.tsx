"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client"; // Use your shared Firebase instance
import "./home.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setStatus("❌ Passwords do not match.");
      return;
    }

    if (!email || !password) {
      setStatus("❌ Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setStatus(`✅ Registered successfully! Welcome, ${user.email}`);
      setTimeout(() => {
        router.push("/upload");
      }, 1000);
    } catch (error: any) {
  console.error("Firebase Error Code:", error.code);
  console.error("Firebase Error Message:", error.message);

  if (error.code === "auth/email-already-in-use") {
    setStatus("❌ This email is already in use.");
  } else if (error.code === "auth/invalid-email") {
    setStatus("❌ Invalid email address.");
  } else if (error.code === "auth/operation-not-allowed") {
    setStatus("❌ Email/Password sign-in not enabled in Firebase.");
  } else if (error.code === "auth/network-request-failed") {
    setStatus("❌ Network error. Check internet or Firebase config.");
  } else if (error.code === "auth/internal-error") {
    setStatus("❌ Internal Firebase error. Check configuration.");
  } else {
    setStatus(`❌ ${error.code}: ${error.message}`);
  }
}
  };

  const handleGuestLogin = async () => {
    try {
      const { signInAnonymously } = require("firebase/auth");
      await signInAnonymously(auth);
      setStatus("✅ Logged in anonymously!");
      setTimeout(() => {
        router.push("/upload");
      }, 1000);
    } catch (err) {
      console.error("Anonymous login failed:", err);
      setStatus("❌ Failed to continue as guest.");
    }
  };

  return (
    <div>
      {/* Top Navigation Bar */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href="/pages/home">Home</a> |
          <a href="/pages/explore">Explore</a> |
          <a href="/cart">Cart</a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ flexDirection: "column", padding: "2em" }}>
        <h1>Register</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          style={{ display: "flex", flexDirection: "column", gap: "1em", width: "100%", maxWidth: "400px", margin: "0 auto" }}
        >
          <div>
            <label>Email:</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.5em" }}
              required
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5em" }}
              required
            />
          </div>

          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5em" }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "0.7em",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#218838")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            style={{
              padding: "0.7em",
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0a800")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ffc107")}
          >
            Continue as Guest
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1em" }}>{status}</p>
      </div>
    </div>
  );
}