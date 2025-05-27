"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "./home.css";

import { getSavedRecipesByUserId } from "@/lib/utils/Recipes/SavedRecipes";
import { getCreatedRecipesByUserId } from "@/lib/utils/Recipes/CreatedRecipes"; 
import { getUserIdByUsername } from "@/lib/utils/UserHandling/IdbyUsername";
import { getAuth } from "firebase/auth";

const isOwnPage = async (username: string) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  const ownerUid = await getUserIdByUsername(username);
  return currentUser.uid === ownerUid;
};

export default function HomePage() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState<"saved" | "my">("saved");
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileImage, setProfileImage] = useState<string>(
    "https://placehold.co/100 "
  );

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ["image/jpeg", "image/png"].includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a .jpg or .png file.");
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
            src="https://placehold.co/100 "
            alt="User Profile"
            style={{
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              border: "2px solid #4caf50",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
            }}
          />
          <span>{username}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container">
        {/* Sidebar Menu */}
        <div className="filters-column">
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1em" }}>
            <label htmlFor="profile-upload" style={{ cursor: "pointer" }}>
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd",
                }}
              />
            </label>
            <input id="profile-upload" type="file" accept=".jpg" onChange={handleFileUpload} style={{ display: "none" }} />
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

            <div
              onClick={() => alert("Delete Recipe clicked")}
              style={{
                padding: "0.5em",
                cursor: "pointer",
                borderRadius: "5px",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Delete Recipe
            </div>
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
              {currentRecipes.map((recipe, index) => (
                <div key={index} className="recipe-card">
                  <h3>{recipe.name}</h3>
                  <p>
                    <strong>Ingredients:</strong>{" "}
                    {recipe.ingredients.map((ing) => {
                      // If ingredient is object like { quantity, name }
                      if (typeof ing === "object" && ing !== null) {
                        return `${ing.quantity || ""} ${ing.measurement || ""} ${ing.name || ""}`;
                      }
                      // If it's just a string (fallback)
                      return ing;
                    }).join(", ")}
                  </p>
                  <p>
                    <strong>Steps:</strong> {recipe.steps.join(" → ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}