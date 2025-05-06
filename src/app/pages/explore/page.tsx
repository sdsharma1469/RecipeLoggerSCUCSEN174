// page.tsx
"use client";
import React, { useState } from "react";
import "./explore.css";

const ExplorePage: React.FC = () => {
  const filters = ["Vegetarian", "Quick", "Gluten-Free", "Under $10"];
  const [filterStates, setFilterStates] = useState<Record<string, string>>({});

  // toggleFilter 
  const toggleFilter = (name: string) => {
    setFilterStates(prev => {
      const current = prev[name] || "none";
      const next = current === "none" ? "whitelisted" : current === "whitelisted" ? "blacklisted" : "none";
      return { ...prev, [name]: next };
    });
  };

  return (
    <div>
      <div className="navbar">
        <div>Explore Recipes</div>
        <div>
          <a href="#">Home</a> | <a href="#">My Recipes</a> | <a href="#">Profile</a>
        </div>
      </div>
      <div className="container">
        <div className="main-content">
          <div className="search-filter-bar">
            <input type="text" placeholder="Search recipes..." />
            <input type="text" placeholder="Filter by tags..." />
          </div>
          <div className="recipe-block">
            <div className="recipe-header">Recipe Title 1</div>
            <img
              src="https://via.placeholder.com/600x200"
              alt="Recipe 1"
              className="recipe-image"
            />
            <div className="recipe-description">
            Ad litora torquent per conubia nostra inceptos himenaeos.
            </div>
            <div className="recipe-tags">
              <span>Vegetarian</span>
              <span>Easy</span>
              <span>30 min</span>
            </div>
            <div className="recipe-footer">
              <div className="ratings">
                <div>Creator Rating: ⭐⭐⭐⭐</div>
                <div>User Rating: ⭐⭐⭐⭐☆</div>
                <div>Difficulty: ⭐⭐</div>
              </div>
              <div className="price">$12.99</div>
            </div>
          </div>
        
        {/* </div> Closes the main-content section where all recipes are located. Will uncomment this div once dups are removed */}

        {/* The following are just more copies of the recipe block for visualization, these will be deleted later */}
        <div className="recipe-block">
            <div className="recipe-header">Recipe Title 2</div>
            <img
              src="https://via.placeholder.com/600x200"
              alt="Recipe 2"
              className="recipe-image"
            />
            <div className="recipe-description">
            Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </div>
            <div className="recipe-tags">
              <span>Vegetarian</span>
              <span>Easy</span>
              <span>30 min</span>
            </div>
            <div className="recipe-footer">
              <div className="ratings">
                <div>Creator Rating: ⭐⭐⭐⭐</div>
                <div>User Rating: ⭐⭐⭐⭐☆</div>
                <div>Difficulty: ⭐⭐</div>
              </div>
              <div className="price">$12.99</div>
            </div>
          </div>

          <div className="recipe-block">
            <div className="recipe-header">Recipe Title 3</div>
            <img
              src="https://via.placeholder.com/600x200"
              alt="Recipe 3"
              className="recipe-image"
            />
            <div className="recipe-description">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </div>
            <div className="recipe-tags">
              <span>Vegetarian</span>
              <span>Easy</span>
              <span>30 min</span>
            </div>
            <div className="recipe-footer">
              <div className="ratings">
                <div>Creator Rating: ⭐⭐⭐⭐</div>
                <div>User Rating: ⭐⭐⭐⭐☆</div>
                <div>Difficulty: ⭐⭐</div>
              </div>
              <div className="price">$12.99</div>
            </div>
          </div>
        
        <div className="recipe-block">
            <div className="recipe-header">Recipe Title 4</div>
            <img
              src="https://via.placeholder.com/600x200"
              alt="Recipe 4"
              className="recipe-image"
            />
            <div className="recipe-description">
            Lorem ipsum dolor sit amet consectetur adipiscing elit.
            </div>
            <div className="recipe-tags">
              <span>Vegetarian</span>
              <span>Easy</span>
              <span>30 min</span>
            </div>
            <div className="recipe-footer">
              <div className="ratings">
                <div>Creator Rating: ⭐⭐⭐⭐</div>
                <div>User Rating: ⭐⭐⭐⭐☆</div>
                <div>Difficulty: ⭐⭐</div>
              </div>
              <div className="price">$12.99</div>
            </div>
          </div>
        </div>
        {/* End of recipe block duplicates*/}

        <div className="filters-column">
          <div className="filter-title">Filters</div>
          <input type="text" placeholder="Search filters..." style={{ width: "100%", padding: "0.5em", marginBottom: "1em" }}/>
          <div className="filter-list">
            {/* Following is utilized to make the filters toggleable for whitelists and blacklists. Calls toggleFilter() function on click */}
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={filterStates[filter] || ""}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/**
       * <div style={{ padding: '2rem' }}>
       *   <h1>All Recipes</h1>
       *   <div
       *     style={{
       *       display: 'grid',
       *       gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
       *       gap: '1.5rem',
       *       marginTop: '1.5rem',
       *     }}
       *   >
       *     {recipes.map((recipe) => (
       *       <div
       *         key={recipe.recipeId}
       *         style={{
       *           border: '1px solid #ddd',
       *           borderRadius: '10px',
       *           padding: '1rem',
       *           background: '#fafafa',
       *         }}
       *       >
       *         <h2>{recipe.name}</h2>
       *         <p><strong>Rating:</strong> {recipe.rating}/5</p>
       *         <p><strong>Tags:</strong> {[
       *           recipe.halal && 'Halal',
       *           recipe.vegan && 'Vegan',
       *           recipe.vegetarian && 'Vegetarian',
       *           recipe.lactoseFree && 'Lactose-Free'
       *         ].filter(Boolean).join(', ') || 'None'}</p>
       *         <p><strong>Ingredients:</strong></p>
       *         <ul>{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
       *       </div>
       *     ))}
       *   </div>
       * </div>
       */}
    </div>
  );
};

export default ExplorePage;
