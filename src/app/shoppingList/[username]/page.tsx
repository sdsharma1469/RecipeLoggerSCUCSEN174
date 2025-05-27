"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export default function ShoppingListPage() {
  const [cartItems, setCartItems] = useState<
    Array<{
      recipeID: string;
      recipeName: string;
      ingredients: Array<{ name: string; quantity: number; checked: boolean }>;
    }>
  >([]);
  const [username, setUsername] = useState<string>("Guest");

  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCart = async () => {
      const firebaseAuth = getAuth();
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data && data.cart) {
                setCartItems(data.cart);
              }
              setUsername(data.username || currentUser.email?.split("@")[0] || "User");
            }
          } catch (error) {
            console.error("Firestore error:", error);
          }
        }
      });
      return () => unsubscribe();
    };
    fetchCart();
  }, []);

  const handleCheckIngredient = async (
    recipeIndex: number,
    ingredientIndex: number
  ) => {
    const updatedCart = [...cartItems];
    updatedCart[recipeIndex].ingredients[ingredientIndex].checked =
      !updatedCart[recipeIndex].ingredients[ingredientIndex].checked;
    setCartItems(updatedCart);

    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      const userRef = doc(db, "Users", currentUser.uid);
      await updateDoc(userRef, { cart: updatedCart });
    }
  };

  const handleDeleteRecipe = async (recipeIndex: number) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(recipeIndex, 1);
    setCartItems(updatedCart);

    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      const userRef = doc(db, "Users", currentUser.uid);
      await updateDoc(userRef, { cart: updatedCart });
    }
  };

  return (
    <div style={{ backgroundColor: "#e8f5e9", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navigation Bar - Matches Home Page */}
      <div className="navbar" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #ccc",
        backgroundColor: "#c8e6c9", // Green matching home page navbar
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={username ? `/home/${username}` : "/pages/home"} style={{ textDecoration: "none", color: "#000000" }}>
            Home
          </a>{" "}
          |{" "}
          <a href={username ? `/explore/${username}` : "/pages/explore"} style={{ textDecoration: "none", color: "#000000" }}>
            Explore
          </a>{" "}
          |{" "}
          <a href={username ? `/shoppingList/${username}` : "/pages/shoppingList"} style={{ textDecoration: "none", color: "#000000" }}>
            Cart
          </a>{" "}
          |{" "}
          <img
            src="https://placehold.co/100 "
            alt="User Profile"
            style={{
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              border: "2px solidrgb(1, 10, 1)",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
            }}
          />
          <span style={{ fontWeight: "bold", marginLeft: "0.5em" }}>{username}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: "1.5rem", color: "#000000" }}>
          Your Shopping List
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {cartItems.length === 0 ? (
            <p style={{ color: "#4caf50" }}>No recipes added yet.</p>
          ) : (
            cartItems.map((item, recipeIndex) => (
              <div
                key={recipeIndex}
                style={{
                  backgroundColor: "#fff",
                  padding: "1rem",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{item.recipeName}</h2>
                  <button
                    onClick={() => handleDeleteRecipe(recipeIndex)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "#fff",
                      border: "none",
                      padding: "0.5em 1em",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d32f2f")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f44336")}
                  >
                    Remove Recipe
                  </button>
                </div>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {item.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={ingredient.checked || false}
                        onChange={() => handleCheckIngredient(recipeIndex, index)}
                        style={{
                          accentColor: "#4caf50",
                          transform: "scale(1.2)",
                        }}
                      />
                      <span
                        style={{
                          textDecoration: ingredient.checked ? "line-through" : "none",
                          color: ingredient.checked ? "#757575" : "#000",
                        }}
                      >
                        {ingredient.quantity} × {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}