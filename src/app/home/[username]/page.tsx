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

/**
 * Helper function to check if the current authenticated user owns the profile page
 * @param username - The username from the URL parameters
 * @returns Promise<boolean> - True if current user owns this profile page
 */
const isOwnPage = async (username: string) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  const ownerUid = await getUserIdByUsername(username);
  return currentUser.uid === ownerUid;
};

/**
 * HomePage Component - Main user profile page displaying saved and created recipes
 * Features:
 * - Tab switching between saved and created recipes
 * - Profile image upload functionality
 * - Recipe list display with navigation
 * - User authentication checks for ownership permissions
 */
export default function HomePage() {
  // Extract username from URL parameters
  const params = useParams();
  const username = params.username as string;
  
  // State management for component functionality
  const [activeTab, setActiveTab] = useState<"saved" | "my">("saved"); // Current active tab
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]); // List of recipes to display
  const [loading, setLoading] = useState<boolean>(true); // Loading state for recipes
  const [profileImage, setProfileImage] = useState<string>("https://placehold.co/100"); // User's profile image URL
  const [uploadingImage, setUploadingImage] = useState<boolean>(false); // Upload progress state

  /**
   * Effect: Load user's profile image when component mounts or username changes
   * Fetches user document from Firestore to get existing profile image
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get user ID from username and fetch user document
        const uid = await getUserIdByUsername(username);
        const userDoc = await getDoc(doc(db, "users", uid));
        
        // If user document exists and has profile image, update state
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

  /**
   * Effect: Fetch recipes based on active tab and username
   * Loads either saved recipes or created recipes depending on current tab
   */
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        // Get user ID and fetch appropriate recipe list
        const uid = await getUserIdByUsername(username);
        const recipeList =
          activeTab === "saved"
            ? await getSavedRecipesByUserId(uid) // Fetch saved recipes
            : await getCreatedRecipesByUserId(uid); // Fetch created recipes

        setCurrentRecipes(recipeList.toArray());
      } catch (err) {
        console.error("❌ Failed to load recipes:", err);
        setCurrentRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [activeTab, username]); // Re-run when tab or username changes

  /**
   * Handle profile image file upload
   * Includes validation, Firebase Storage upload, and Firestore document update
   * @param e - File input change event
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Log file details for debugging
    console.log("📁 File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    // Permission check: Only allow users to update their own profile
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

    // File type validation - only allow common image formats
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      console.log("❌ Invalid file type:", file.type);
      alert("Please upload a .jpg or .png file.");
      return;
    }

    // File size validation - 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      console.log("❌ File too large:", file.size);
      alert("File size must be less than 2MB.");
      return;
    }

    // Start upload process
    setUploadingImage(true);

    try {
      // Get current authenticated user
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      console.log("🔐 Current user:", currentUser?.uid);
      
      if (!currentUser) {
        alert("You must be logged in to upload a profile picture.");
        setUploadingImage(false);
        return;
      }

      // Create unique filename and storage path
      const fileName = `profile_${Date.now()}.${file.type.split('/')[1]}`;
      const storagePath = `users/${currentUser.uid}/profile/${fileName}`;
      console.log("📤 Uploading to storage path:", storagePath);
      
      const storageRef = ref(storage, storagePath);
      
      // Upload file to Firebase Storage
      console.log("⬆️ Starting upload...");
      const snapshot = await uploadBytes(storageRef, file);
      console.log("✅ Upload completed:", snapshot.metadata);
      
      // Get download URL for the uploaded file
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("🔗 Download URL obtained:", downloadURL);

      // Update or create user document in Firestore
      console.log("💾 Updating Firestore document...");
      const userDocRef = doc(db, "users", currentUser.uid);
      
      // Check if user document already exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // Create new user document with profile image
        console.log("📝 User document doesn't exist, creating new one...");
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email || "",
          username: username,
          profileImageUrl: downloadURL,
          profileImagePath: storagePath,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log("✅ New user document created with profile image");
      } else {
        // Update existing user document
        await updateDoc(userDocRef, {
          profileImageUrl: downloadURL,
          profileImagePath: storagePath,
          updatedAt: new Date()
        });
        console.log("✅ Existing user document updated");
      }

      // Update local state to reflect new profile image
      setProfileImage(downloadURL);
      
      alert("✅ Profile picture updated successfully!");
      
    } catch (error: any) {
      // Comprehensive error handling with specific error messages
      console.error("❌ Full error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: error
      });
      
      let errorMessage = "Failed to upload profile picture. ";
      
      // Handle specific Firebase error codes
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
      // Reset upload state regardless of success or failure
      setUploadingImage(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#e8f5e9", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navigation Bar - Contains app title and user navigation */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          {/* Navigation links */}
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href={username ? `/shoppingList/${username}` : "/shoppingList"}>Cart</a> |
          {/* User profile image in navbar */}
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

      {/* Main Content Area - Contains sidebar and recipe list */}
      <div className="home-container">
        {/* Sidebar Menu - Profile section and navigation */}
        <div className="filters-column">
          {/* Profile Image Upload Section */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1em" }}>
            {/* Clickable profile image that triggers file upload */}
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
                  opacity: uploadingImage ? 0.6 : 1 // Dim image during upload
                }}
              />
              {/* Upload progress indicator */}
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
            {/* Hidden file input for image upload */}
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

          {/* Tab Navigation - Switch between saved and created recipes */}
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

          {/* Post Recipe Link - Only available to profile owner */}
          <div className="menu-section">
            <a
              onClick={async (e) => {
                // Check if user owns this profile before allowing recipe upload
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
              // Hover effects for better UX
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Post Recipe
            </a>
          </div>
        </div>

        {/* Recipe List - Main content area displaying recipes */}
        <div className="main-content">
          <h2>{activeTab === "saved" ? "Saved Recipes" : "My Recipes"}</h2>
          
          {/* Conditional rendering based on loading state and recipe availability */}
          {loading ? (
            <p>Loading recipes...</p>
          ) : currentRecipes.length === 0 ? (
            <p>No recipes to display.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Map through recipes and create clickable cards */}
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