"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "./home.css";
import { getSavedRecipesByUserId } from "@/lib/utils/Recipes/SavedRecipes";
import { getCreatedRecipesByUserId } from "@/lib/utils/Recipes/CreatedRecipes"; 
import { getUserIdByUsername } from "@/lib/utils/UserHandling/IdbyUsername";
import type { Recipe } from "@/types/Recipe";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase-client";

const isOwnPage = async (username: string) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  const ownerUid = await getUserIdByUsername(username);
  return currentUser.uid === ownerUid;
};

export default function HomePage() {
  const params = useParams();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState<"saved" | "my">("saved");
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileImage, setProfileImage] = useState<string>(
    "https://placehold.co/100"
  );
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Load user's profile image on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const uid = await getUserIdByUsername(username);
        const userDoc = await getDoc(doc(db, "users", uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profileImageUrl) {
            setProfileImage(userData.profileImageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserProfile();
  }, [username]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const uid = await getUserIdByUsername(username);
        const recipeList =
          activeTab === "saved"
            ? await getSavedRecipesByUserId(uid)
            : await getCreatedRecipesByUserId(uid);

        setCurrentRecipes(recipeList.toArray());
      } catch (err) {
        console.error("❌ Failed to load recipes:", err);
        setCurrentRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [activeTab, username]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📁 File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    // Check if user is on their own page
    try {
      const isOwner = await isOwnPage(username);
      console.log("👤 Is owner check:", isOwner);
      if (!isOwner) {
        alert("⚠️ You can only update your own profile picture.");
        return;
      }
    } catch (error) {
      console.error("❌ Error checking ownership:", error);
      alert("❌ Error verifying permissions. Please try again.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      console.log("❌ Invalid file type:", file.type);
      alert("Please upload a .jpg or .png file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      console.log("❌ File too large:", file.size);
      alert("File size must be less than 2MB.");
      return;
    }

    setUploadingImage(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      console.log("🔐 Current user:", currentUser?.uid);
      
      if (!currentUser) {
        alert("You must be logged in to upload a profile picture.");
        setUploadingImage(false);
        return;
      }

      // Upload to Firebase Storage
      const fileName = `profile_${Date.now()}.${file.type.split('/')[1]}`;
      const storagePath = `users/${currentUser.uid}/profile/${fileName}`;
      console.log("📤 Uploading to storage path:", storagePath);
      
      const storageRef = ref(storage, storagePath);
      
      // Upload file
      console.log("⬆️ Starting upload...");
      const snapshot = await uploadBytes(storageRef, file);
      console.log("✅ Upload completed:", snapshot.metadata);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("🔗 Download URL obtained:", downloadURL);

      // Update user document in Firestore
      console.log("💾 Updating Firestore document...");
      const userDocRef = doc(db, "users", currentUser.uid);
      
      // Check if document exists first
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log("📝 User document doesn't exist, creating new one...");
        // Create new user document
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email || "",
          username: username, // Use the username from URL params
          profileImageUrl: downloadURL,
          profileImagePath: storagePath,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log("✅ New user document created with profile image");
      } else {
        // Document exists, update it
        await updateDoc(userDocRef, {
          profileImageUrl: downloadURL,
          profileImagePath: storagePath,
          updatedAt: new Date()
        });
        console.log("✅ Existing user document updated");
      }

      // Update local state
      setProfileImage(downloadURL);
      
      alert("✅ Profile picture updated successfully!");
      
    } catch (error: any) {
      console.error("❌ Full error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: error
      });
      
      let errorMessage = "Failed to upload profile picture. ";
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += "Permission denied. Check your Firestore security rules.";
      } else if (error.code === 'storage/canceled') {
        errorMessage += "Upload was canceled.";
      } else if (error.code === 'storage/unknown') {
        errorMessage += "Unknown error occurred.";
      } else if (error.code === 'permission-denied') {
        errorMessage += "Permission denied. Check your Firestore rules.";
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert("❌ " + errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#e8f5e9", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navigation Bar */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href={username ? `/shoppingList/${username}` : "/shoppingList"}>Cart</a> |
          <img
            src={profileImage}
            alt="User Profile"
            style={{
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              border: "2px solid #4caf50",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
              objectFit: "cover"
            }}
          />
          <span>{username}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="home-container">
        {/* Sidebar Menu */}
        <div className="filters-column">
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1em" }}>
            <label htmlFor="profile-upload" style={{ cursor: "pointer", position: "relative" }}>
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd",
                  opacity: uploadingImage ? 0.6 : 1
                }}
              />
              {uploadingImage && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#666",
                  fontSize: "12px"
                }}>
                  Uploading...
                </div>
              )}
            </label>
            <input 
              id="profile-upload" 
              type="file" 
              accept=".jpg,.jpeg,.png" 
              onChange={handleFileUpload} 
              style={{ display: "none" }}
              disabled={uploadingImage}
            />
            <span style={{ marginLeft: "1em", fontSize: "1.2em" }}>{username}</span>
          </div>

          <div className="menu-section">
            <div
              onClick={() => setActiveTab("saved")}
              className={activeTab === "saved" ? "active" : ""}
              style={{ cursor: "pointer" }}
            >
              Saved Recipes
            </div>
            <div
              onClick={() => setActiveTab("my")}
              className={activeTab === "my" ? "active" : ""}
              style={{ cursor: "pointer" }}
            >
              My Recipes
            </div>
          </div>

          <div className="menu-section">
            <a
              onClick={async (e) => {
                const isOwner = await isOwnPage(username);
                if (!isOwner) {
                  e.preventDefault();
                  alert("⚠️ You must be on your own homepage to upload a recipe.");
                  return;
                }
                window.location.href = "/upload";
              }}
              href="#"
              style={{
                display: "block",
                padding: "0.5em",
                textDecoration: "none",
                color: "inherit",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Post Recipe
            </a>
 
          </div>
        </div>

        {/* Recipe List */}
        <div className="main-content">
          <h2>{activeTab === "saved" ? "Saved Recipes" : "My Recipes"}</h2>
          {loading ? (
            <p>Loading recipes...</p>
          ) : currentRecipes.length === 0 ? (
            <p>No recipes to display.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {currentRecipes.map((recipe) => (
                <Link
                  key={recipe.recipeId}
                  href={`/recipeTemplate/${recipe.recipeId}?username=${username}`}
                  passHref
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="recipe-card" style={{ cursor: "pointer" }}>
                    <h3>{recipe.name}</h3>
                    <p>
                      <strong>Description:</strong> {recipe.description || "No description available"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}