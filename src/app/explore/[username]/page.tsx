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

  // ✅ Get all filters dynamically from tags in the recipes
  const filters = useMemo(() => {
    const tagKeys = new Set<string>();
    recipes.forEach(recipe => {
      Object.keys(recipe.tags || {}).forEach(tag => tagKeys.add(tag));
    });
    return Array.from(tagKeys);
  }, [recipes]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterSearchInput, setFilterSearchInput] = useState('');

  // Toggle filter state: none -> whitelisted -> blacklisted
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

  // Fetch recipes from backend
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

  // Filter logic for whitelist, blacklist, and search
  const filteredRecipes = recipes.filter((recipe) => {
    // This line ensures that we filter by name search
    const matchsSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Skips this particular recipe if it doesn't match the search query
    if (!matchsSearch) return false;

    // The following applies the tag filter states
    return filters.every((filterKey) => {
      const state = filterStates[filterKey] || 'none';
      const tagValue = recipe.tags?.[filterKey as keyof Recipe['tags']];

      if (state === 'whitelisted') return tagValue === true;
      if (state === 'blacklisted') return tagValue === false;
      return true;
    });
  });

  return (
    <div>
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Explore Recipes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href="/cart">Cart </a> |
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
            filteredRecipes.map((recipe) => (
              <Link
                href={`/recipeTemplate/${recipe.recipeId}?username=${username}`}
                key={recipe.recipeId}
                className="recipe-block-link"
              >
                <div className="recipe-block">
                  <div className="recipe-header">{recipe.name}</div>

                  <img
                    src="https://via.placeholder.com/600x200"
                    alt={recipe.name}
                    className="recipe-image"
                  />

                  <div className="recipe-description">
                    {recipe.steps[0]?.slice(0, 100) || 'No description available...'}
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
                    </div>
                    <div className="price">Free</div>
                  </div>
                </div>
              </Link>
            ))
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
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
