"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("✅ Logged in successfully!");
      setTimeout(() => {
        router.push("/upload");
      }, 1000);
    } catch (error) {
      setStatus("❌ Invalid credentials. Try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div style={{ padding: "2em", fontFamily: "Arial" }}>
      <h1>Login to Recipe Logger</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          padding: "0.5em",
          marginBottom: "1em",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          padding: "0.5em",
          marginBottom: "1em",
        }}
      />
      <button
        onClick={handleLogin}
        style={{
          padding: "0.8em 1em",
          fontSize: "1em",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Log In
      </button>
      <p>{status}</p>
      <p>
        Don't have an account?{" "}
        <a href="/register">Register here</a>
      </p>
      <p>
        Or test with anonymous login:{" "}
        <button onClick={async () => {
          try {
            const { signInAnonymously } = require("firebase/auth");
            await signInAnonymously(auth);
            setStatus("✅ Logged in anonymously!");
            setTimeout(() => {
              router.push("/upload");
            }, 1000);
          } catch (err) {
            console.error("Anonymous login failed:", err);
            setStatus("❌ Anonymous login failed.");
          }
        }}>Continue as Guest</button>
      </p>
    </div>
  );
}