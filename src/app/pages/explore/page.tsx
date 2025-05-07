// page.tsx
"use client";
import React, { useEffect, useState } from "react";
import "./explore.css";

const filters = ["Vegetarian", "Quick", "Gluten-Free", "Easy"];

type FilterState = "none" | "whitelisted" | "blacklisted";

type TagMode = Record<string, FilterState>;

const ExplorePage: React.FC = () => {
  const [filterStates, setFilterStates] = useState<TagMode>({});

  const toggleFilter = (name: string) => {
    setFilterStates((prev) => {
      const current = prev[name] || "none";
      const next =
        current === "none"
          ? "whitelisted"
          : current === "whitelisted"
          ? "blacklisted"
          : "none";
      return { ...prev, [name]: next };
    });
  };

  useEffect(() => {
    const recipeBlocks = document.querySelectorAll<HTMLElement>(".recipe-block");

    recipeBlocks.forEach((block) => {
      const tagElements = block.querySelectorAll<HTMLElement>(".recipe-tags a");
      const tags = Array.from(tagElements).map((el) => el.textContent?.trim().toLowerCase() || "");

      const whitelistTags = Object.keys(filterStates).filter(
        (tag) => filterStates[tag] === "whitelisted"
      );
      const blacklistTags = Object.keys(filterStates).filter(
        (tag) => filterStates[tag] === "blacklisted"
      );

      const hasWhitelistMatch =
        whitelistTags.length === 0 ||
        whitelistTags.some((tag) => tags.includes(tag.toLowerCase()));
      const hasBlacklistMatch = blacklistTags.some((tag) => tags.includes(tag.toLowerCase()));

      if (hasWhitelistMatch && !hasBlacklistMatch) {
        block.style.display = "block";
      } else {
        block.style.display = "none";
      }
    });
  }, [filterStates]);
  
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
            <input type="text" placeholder="Search by recipe name or tag..." />
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
              <a className="tagSpan" href="http://localhost:3000/pages/explore?tag=Vegetarian">Vegetarian</a>
              <a className="tagSpan" href="http://localhost:3000/pages/explore?tag=Hard">Hard</a>
              <a className="tagSpan" href="http://localhost:3000/pages/explore?tag=30 min">30 min</a>
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
              <a>Vegetarian</a>
              <a>Easy</a>
              <a>30 min</a>
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
              <a>Vegetarian</a>
              <a>Easy</a>
              <a>30 min</a>
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
              <a>Vegetarian</a>
              <a>Easy</a>
              <a>30 min</a>
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
