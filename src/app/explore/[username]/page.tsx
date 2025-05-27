'use client'

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "./explore.css";
import type { Recipe } from "@/types/Recipe";

const ExplorePage: React.FC = () => {
  const { username } = useParams();
  const [filterStates, setFilterStates] = useState<Record<string, string>>({});
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Creates an object of filters to dynamically locate for each item in the tag map in Recipe to dynamically add as a filters list
  const filters = useMemo(() => {
    const tagKeys = new Set<string>();
    recipes.forEach(recipe => {
      Object.keys(recipe.tags || {}).forEach(tag => tagKeys.add(tag));
    });
    return Array.from(tagKeys);
  }, [recipes]);

  // Creates an object of tools to dynamically generate a tools list
  const tools = useMemo(() => {
    const toolKeys = new Set<string>();
    recipes.forEach(recipe => {
      Object.keys(recipe.tools || {}).forEach(tool => toolKeys.add(tool));
    });
    return Array.from(toolKeys);
  }, [recipes]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterSearchInput, setFilterSearchInput] = useState('');

  // Toggles our filter states from: none -> whitelisted -> blacklisted
  const toggleFilter = (name: string) => {
    setFilterStates(prev => {
      const current = prev[name] || 'none';
      const next =
        current === 'none'
          ? 'whitelisted'
          : current === 'whitelisted'
          ? 'blacklisted'
          : 'none';
      return { ...prev, [name]: next };
    });
  };

  // This function formats the tag names from however they are written in a nicer format
  const formatTagName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')     // insert space before capital letters
      .replace(/^./, str => str.toUpperCase()); // capitalize first letter
  };

  // Fetch our recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/GetAllRecipes');
        const data = await res.json();
        setRecipes(data.recipes);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Ensures that the visible filters logic ONLY applies when filterSearchQuery is set first!
  const visibleFilters = filterSearchQuery
    ? filters.filter(filter =>
        filter.toLowerCase().includes(filterSearchQuery.toLowerCase())
      )
    : filters;

  const visibleTools = filterSearchQuery
    ? tools.filter(tool =>
        tool.toLowerCase().includes(filterSearchQuery.toLowerCase())
      )
    : tools;

  // Filter logic for whitelist, blacklist, and search
  const filteredRecipes = recipes.filter((recipe) => {
    // This line ensures that we filter by name search
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.author.toLowerCase().includes(searchQuery.toLowerCase());

    // Skips this particular recipe if it doesn't match the search query
    if (!matchesSearch) return false;

    // The following applies to establishing the filter tag states and setting the tag name too from recipes and their own tags
    return [...filters, ...tools].every((key) => {
      const state = filterStates[key] || 'none';
      const tagValue = recipe.tags?.[key as keyof Recipe['tags']];
      const toolValue = recipe.tools?.[key as keyof Recipe['tools']];
      const value = tagValue ?? toolValue;

      if (state === 'whitelisted') return value === true;
      if (state === 'blacklisted') return value === false;
      return true;
    });
  });

  // Made another function here to calculate the difficulty rating based on the userDiff and the authorDiff depending on which is available or if both are
  const getDifficultyRating = (recipe: Recipe): number | null => {
    if (typeof recipe.userDiff === 'number') return recipe.userDiff; // NOTE: this number value is returned only if it exists! I am already assuming this value is the average of ALL user ratings!
    if (typeof recipe.authorDiff === 'number') return recipe.authorDiff; // This line will ONLY execute IF there is NO userDiff. Author diff takes priority
    return null; // If neither author or user Diff are initialized, the rating is just gonna be null.
  };

  return (
    <div id="document-wrapper">
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Explore Recipes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href={username ? `/shoppingList/${username}` : "/shoppingList"}>Cart</a> |
          <img
            src="https://placehold.co/100"
            alt="User Profile"
            style={{ borderRadius: '50%', width: '30px', height: '30px' }}
          />
          <span>{username}</span>
        </div>
      </div>

      <div className="container">
        <div className="main-content">
          <div className="search-filter-bar">
            <input
              className="recipe-search"
              type="text"
              placeholder="Search recipes by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <p style={{ padding: '2rem' }}>Loading recipes...</p>
          ) : (
            filteredRecipes.map((recipe) => {
              const difficulty = getDifficultyRating(recipe); {/* Using the getDifficultyRating function, we can use our difficulty in the page itself */}
              return (
                <Link
                  href={`/recipeTemplate/${recipe.recipeId}?username=${username}`}
                  key={recipe.recipeId}
                  className="recipe-block-link"
                >
                  <div className="recipe-block">
                    <div className="recipe-header">{recipe.name}</div>

                    <div className="recipe-author">By: {recipe.author}</div>

                    <img src="https://via.placeholder.com/600x200" alt={recipe.name} className="recipe-image"/>

                    <div className="recipe-description">
                      {recipe.description ? recipe.description : 'No description available...'}
                    </div>

                    <div className="recipe-tags">
                      {Object.entries(recipe.tags).map(([key, value]) =>
                        value ? <span key={key}>{formatTagName(key)}</span> : null
                      )}
                    </div>

                    <div className="recipe-footer">
                      <div className="ratings">
                        <div>Rating: {recipe.rating}/5</div>
                        <div>Ingredients: {recipe.ingredients.length}</div>
                        {difficulty !== null && <div>Difficulty: {difficulty}/5</div>}
                      </div>
                      <div className="price">Free</div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="filters-column">
          <div className="filter-title">Filters</div>
          <input
            className="filter-search"
            type="text"
            placeholder="Search filters..."
            style={{ width: '100%', padding: '0.5em', marginBottom: '1em' }}
            value={filterSearchQuery}
            onChange={(e) => setFilterSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setFilterSearchQuery(filterSearchInput.trim());
              }
            }}
          />

          <div className="filter-list">
            {visibleFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={filterStates[filter] || ''}
              >
                {formatTagName(filter)}
              </button>
            ))}
          </div>

          <div className="filter-title" style={{marginTop: '0.75em'}}>Tools</div>
          <div className="filter-list">
            {visibleTools.map((tool) => (
              <button
                key={tool}
                onClick={() => toggleFilter(tool)}
                className={filterStates[tool] || ''}
              >
                {formatTagName(tool)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
