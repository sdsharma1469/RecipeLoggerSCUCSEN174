"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "@/lib/firebase-client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      const user: User = result.user;

      console.log(user.displayName ? "✅ Logged in:" : "✅ Signed up:", user.displayName || user.email);

      // Redirect after successful login
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User profile not found.");
      }

      const { username } = userSnap.data();

      if (!username) {
        throw new Error("Username missing.");
      }

      router.push(`/home/${username}`);
    } catch (err: any) {
      console.error("❌ Auth error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#e8f5e9",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem"
    }}>
      {/* Centered Login Card */}
      <main style={{
        backgroundColor: "#ffffff",
        padding: "3rem",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%",
      }}>
        <h1 style={{ marginBottom: "1rem" }}>Welcome to SCU Recipes 🍳</h1>
        <p style={{ marginBottom: "2rem" }}>Sign in or create an account to start sharing recipes.</p>

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            padding: "1rem 2rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background-color 0.3s",
            width: "100%",
            fontWeight: "bold"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#43a047"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4CAF50"}
        >
          {loading ? "Signing you in..." : "Continue with Google"}
        </button>

        {error && (
          <p style={{
            color: "red",
            marginTop: "1rem",
            fontSize: "0.9rem"
          }}>
            {error.includes('popup') ? 'Please allow popups for Google Sign-In.' : error}
          </p>
        )}
      </main>
    </div>
  );
}