"use client";
import React, { useState } from "react";
import "./home.css";

// Mock Firebase upload function – replace this with your real one
const uploadRecipeClientSide = async (recipe: any) => {
  console.log("Uploading recipe:", recipe);
  return true; // Simulate success
};

export default function UploadRecipePage() {
  const [title, setTitle] = useState("");
  const [creatorRating, setCreatorRating] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(0);
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<{
    quantity: string;
    measurement: string;
    name: string;
  }[]>([
    { quantity: "", measurement: "cup", name: "" }
  ]);
  const [steps, setSteps] = useState<{ id: string; content: string }>([
    { id: "step-1", content: "" }
  ]);
  const [tags, setTags] = useState<Record<string, boolean>>({
    vegan: false,
    vegetarian: false,
    lactoseFree: false,
    halal: false,
    soy: false,
    peanuts: false,
  });
  const [status, setStatus] = useState("");

  const user = true; // Replace with actual auth check if needed

  const MEASUREMENT_OPTIONS = [
    "whole",
    "kg",
    "g",
    "lb",
    "oz",
    "liter",
    "ml",
    "cup",
    "tablespoon",
    "teaspoon"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ["image/jpeg", "image/png"].includes(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a .jpg or .png file.");
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: "", measurement: "cup", name: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    field: "quantity" | "name" | "measurement"
  ) => {
    const value = e.target.value;
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleAddStep = () => {
    const nextId = `step-${steps.length + 1}`;
    setSteps([...steps, { id: nextId, content: "" }]);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleStepChange = (id: string, content: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, content } : step))
    );
  };

  const handleTagToggle = (tag: keyof typeof tags) => {
    setTags((prev) => ({ ...prev, [tag]: !prev[tag] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setStatus("❌ User not logged in.");
      return;
    }

    if (
      !title ||
      ingredients.some((ing) => !ing.name || !ing.quantity) ||
      steps.some((s) => !s.content)
    ) {
      setStatus("❌ Please fill in all fields.");
      return;
    }

    setStatus("✅ Uploading recipe...");

    const recipeData = {
      title,
      creatorRating,
      difficulty,
      ingredients: ingredients.map((ing) => ({
        quantity: parseFloat(ing.quantity),
        measurement: ing.measurement,
        name: ing.name.trim(),
      })),
      steps: steps.map((step) => step.content.trim()),
      tags,
      image,
    };

    try {
      const success = await uploadRecipeClientSide(recipeData);
      if (success) {
        setStatus("🎉 Recipe uploaded successfully!");
        resetForm();
      } else {
        setStatus("❌ Failed to upload recipe.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("❌ Error uploading recipe.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setCreatorRating(0);
    setDifficulty(0);
    setIngredients([{ quantity: "", measurement: "cup", name: "" }]);
    setSteps([{ id: "step-1", content: "" }]);
    setTags({
      vegan: false,
      vegetarian: false,
      lactoseFree: false,
      halal: false,
      soy: false,
      peanuts: false,
    });
    setImage(null);
  };

  return (
    <div>
      {/* Top Navigation Bar */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href="/pages/home">Home</a> |
          <a href="/pages/explore">Explore</a> |
          <a href="/cart">Cart</a> |
          <img
            src="https://via.placeholder.com/30  "
            alt="User Profile"
            style={{ borderRadius: "50%", width: "30px", height: "30px" }}
          />
          <span>Username</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ flexDirection: "column", padding: "2em" }}>
        <h1>Upload a Recipe</h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5em" }}>
          {/* Title */}
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter recipe title"
              style={{ width: "100%", padding: "0.5em" }}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label>Upload Image (.jpg/.png):</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required />
            {image && (
              <img
                src={image}
                alt="Preview"
                style={{ width: "100%", marginTop: "1em", borderRadius: "10px" }}
              />
            )}
          </div>

          {/* Ratings with Sliders */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1em" }}>
            {/* CREATOR RATING */}
            <div>
              <div style={{ marginBottom: "0.5em" }}>
                <label>Creator Rating (0–10):</label>
                <div style={{ fontSize: "0.85em", color: "#666", marginTop: "0.3em" }}>
                  0 = Worst recipe I've ever made &nbsp;&nbsp;|&nbsp;&nbsp; 10 = Best recipe I've ever made
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1em", marginTop: "0.5em" }}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={creatorRating}
                    onChange={(e) => setCreatorRating(parseFloat(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontWeight: "bold", minWidth: "40px", textAlign: "center" }}>
                    {creatorRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* DIFFICULTY RATING */}
            <div>
              <div style={{ marginBottom: "0.5em" }}>
                <label>Difficulty Rating (0–10):</label>
                <div style={{ fontSize: "0.85em", color: "#666", marginTop: "0.3em" }}>
                  0 = Very easy, anyone can make it &nbsp;&nbsp;|&nbsp;&nbsp; 10 = Highly complex, even experienced chefs may struggle
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1em", marginTop: "0.5em" }}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseFloat(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontWeight: "bold", minWidth: "40px", textAlign: "center" }}>
                    {difficulty.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label>Ingredients:</label>
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5em",
                  marginBottom: "0.5em",
                  padding: "0.5em",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              >
                <input
                  type="number"
                  placeholder="Qty"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(e, index, "quantity")}
                  min="0"
                  step="any"
                  style={{ width: "80px" }}
                />

                <select
                  value={ingredient.measurement}
                  onChange={(e) => handleIngredientChange(e, index, "measurement")}
                  style={{ width: "100px" }}
                >
                  {MEASUREMENT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(e, index, "name")}
                  style={{ flex: 1 }}
                />

                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={ingredients.length <= 1}
                  style={{
                    padding: "0.5em",
                    cursor: "pointer",
                    borderRadius: "5px",
                    border: "none",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  &times;
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: "0.5em", marginTop: "0.5em" }}>
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={ingredients.length >= 20}
                style={{
                  padding: "0.5em",
                  cursor: "pointer",
                  borderRadius: "5px",
                  border: "none",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ➕ Add Ingredient
              </button>
              <button
                type="button"
                onClick={() => handleRemoveIngredient(ingredients.length - 1)}
                disabled={ingredients.length <= 1}
                style={{
                  padding: "0.5em",
                  cursor: "pointer",
                  borderRadius: "5px",
                  border: "none",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ➖ Remove Ingredient
              </button>
            </div>
          </div>

          {/* Steps */}
          <div>
            <label>Instructions:</label>
            {steps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  gap: "0.5em",
                  marginBottom: "0.5em",
                  padding: "0.5em",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              >
                <strong style={{ minWidth: "40px" }}>Step {index + 1}:</strong>
                <input
                  type="text"
                  value={step.content}
                  onChange={(e) => handleStepChange(step.id, e.target.value)}
                  style={{ flex: 1, padding: "0.5em" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStep(step.id)}
                  disabled={steps.length <= 1}
                  style={{
                    padding: "0.5em",
                    cursor: "pointer",
                    borderRadius: "5px",
                    border: "none",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  &times;
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: "0.5em", marginTop: "0.5em" }}>
              <button
                type="button"
                onClick={handleAddStep}
                disabled={steps.length >= 20}
                style={{
                  padding: "0.5em",
                  cursor: "pointer",
                  borderRadius: "5px",
                  border: "none",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ➕ Add Step
              </button>
              <button
                type="button"
                onClick={() => setSteps(steps.slice(0, -1))}
                disabled={steps.length <= 1}
                style={{
                  padding: "0.5em",
                  cursor: "pointer",
                  borderRadius: "5px",
                  border: "none",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ➖ Remove Step
              </button>
            </div>
          </div>

          {/* Tags / Filters */}
          <div className="menu-section">
            <strong>Tags:</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em", marginTop: "0.5em" }}>
              {Object.keys(tags).map((tag) => (
                <label
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5em",
                    padding: "0.3em 0.5em",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d6ead6")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <input
                    type="checkbox"
                    checked={tags[tag as keyof typeof tags]}
                    onChange={() => handleTagToggle(tag as keyof typeof tags)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              alignSelf: "flex-start",
              padding: "0.7em 1em",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
          >
            Upload Recipe
          </button>

          {/* Status Message */}
          <p>{status}</p>
        </form>
      </div>
    </div>
  );
}