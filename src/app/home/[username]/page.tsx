'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import './home.css';

import { getSavedRecipesByUserId } from '@/lib/utils/Recipes/SavedRecipes';
import { getCreatedRecipesByUserId } from '@/lib/utils/Recipes/CreatedRecipes';
import type { Recipe } from '@/types/Recipe';
import { getUserIdByUsername } from '@/lib/utils/UserHandling/IdbyUsername'
import { getAuth } from 'firebase/auth'

const isOwnPage = async (username: string) => {
  const auth = getAuth()
  const currentUser = auth.currentUser
  if (!currentUser) return false

  const ownerUid = await getUserIdByUsername(username)
  return currentUser.uid === ownerUid
}

const HomePage: React.FC = () => {
  const { username } = useParams() as { username: string };
  const [activeTab, setActiveTab] = useState<'saved' | 'my'>('saved');
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/100');


  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const uid = await getUserIdByUsername(username)
  
        const recipeList =
          activeTab === 'saved'
            ? await getSavedRecipesByUserId(uid)
            : await getCreatedRecipesByUserId(uid)
  
        setCurrentRecipes(recipeList.toArray())
      } catch (err) {
        console.error('❌ Failed to load recipes:', err)
        setCurrentRecipes([]) // empty fallback
      } finally {
        setLoading(false)
      }
    }
  
    fetchRecipes()
  }, [activeTab, username])
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a .jpg file.');
    }
  };

  return (
    <div>
      <div className="navbar">
        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Recipe Logger</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href="/cart">Cart </a> |
          <img
            src="https://via.placeholder.com/30"
            alt="User Profile"
            style={{ borderRadius: '50%', width: '30px', height: '30px' }}
          />
          <span>{username}</span>
        </div>
      </div>

      <div className="container">
        <div className="filters-column">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
            <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ddd',
                }}
              />
            </label>
            <input
              id="profile-upload"
              type="file"
              accept=".jpg"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <span style={{ marginLeft: '1em', fontSize: '1.2em' }}>{username}</span>
          </div>

          <div className="menu-section">
            <div
              onClick={() => setActiveTab('saved')}
              className={activeTab === 'saved' ? 'active' : ''}
              style={{ cursor: 'pointer' }}
            >
              Saved Recipes
            </div>
            <div
              onClick={() => setActiveTab('my')}
              className={activeTab === 'my' ? 'active' : ''}
              style={{ cursor: 'pointer' }}
            >
              My Recipes
            </div>
          </div>

          <div className="menu-section">
          <button
            onClick={async () => {
              const isOwner = await isOwnPage(username)
              if (!isOwner) {
                alert('⚠️ You must be on your own homepage to upload a recipe.')
                return
              }
              window.location.href = '/upload'
            }}
          >
            Post Recipe
          </button>


            <div
              onClick={() => alert('Delete Recipe clicked')}
              style={{
                padding: '0.5em',
                cursor: 'pointer',
                borderRadius: '5px',
                transition: 'background-color 0.3s',
              }}
            >
              Delete Recipe
            </div>
          </div>
        </div>

        <div className="main-content">
          <h2>{activeTab === 'saved' ? 'Saved Recipes' : 'My Recipes'}</h2>
          {loading ? (
            <p>Loading recipes...</p>
          ) : (
            <div>
              {currentRecipes.length === 0 ? (
                <p>No recipes to display.</p>
              ) : (
                currentRecipes.map((recipe, index) => (
                  <div key={index} className="recipe-card">
                    <h3>{recipe.name}</h3>
                    <p><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
                    <p><strong>Steps:</strong> {recipe.steps.join(' → ')}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
