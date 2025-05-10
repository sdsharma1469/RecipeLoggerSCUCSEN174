"use client";
import React, { useState, useEffect } from "react";
import "./home.css";

// Mock data arrays
const savedRecipes = [
  "Spaghetti Carbonara",
  "Chicken Tikka Masala",
  "Pad Thai",
  "Sushi Rolls",
  "Vegetable Stir Fry",
  "Grilled Salmon",
  "Caesar Salad",
  "Beef Stew",
  "Mushroom Risotto",
  "Pumpkin Soup"
];

const myRecipes = [
  "Grandma's Apple Pie",
  "Homemade Pizza",
  "Blueberry Pancakes",
  "Chili Con Carne",
  "Baked Ziti",
  "Tiramisu",
  "Guacamole",
  "Hummus",
  "Stuffed Peppers",
  "Lemon Chicken"
];

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"saved" | "my">("saved");
  const [currentRecipes, setCurrentRecipes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileImage, setProfileImage] = useState<string>("https://via.placeholder.com/100 ");

  // Simulate AJAX loading
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCurrentRecipes(activeTab === "saved" ? savedRecipes : myRecipes);
      setLoading(false);
    }, 500);
  }, [activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/jpeg") {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a .jpg file.");
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
          <a href="/pages/cart">Cart </a> |
          <img
            src="https://via.placeholder.com/30 "
            alt="User Profile"
            style={{ borderRadius: "50%", width: "30px", height: "30px" }}
          />
          <span>Username</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container">
        {/* Left Sidebar Column */}
        <div className="filters-column">
          {/* User Info Section */}
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
                  border: "2px solid #ddd"
                }}
              />
            </label>
            <input
              id="profile-upload"
              type="file"
              accept=".jpg"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <span style={{ marginLeft: "1em", fontSize: "1.2em" }}>Username</span>
          </div>

          {/* Menu Items - Boxed */}
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

         {/* Post/Delete Recipe Buttons - Boxed */}
          <div className="menu-section">
            <a
              href="/upload"
              style={{
                padding: "0.5em",
                cursor: "pointer",
                borderRadius: "5px",
                transition: "background-color 0.3s",
                display: "block",
                textDecoration: "none",
                color: "inherit"
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
                transition: "background-color 0.3s"
              }}
            >
              Delete Recipe
            </div>
          </div>
        </div>

        {/* Right Main Content Column */}
        <div className="main-content">
          <h2>{activeTab === "saved" ? "Saved Recipes" : "My Recipes"}</h2>
          {loading ? (
            <p>Loading recipes...</p>
          ) : (
            <div>
              {currentRecipes.map((recipe, index) => (
                <div key={index} className="recipe-card">
                  {recipe}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;