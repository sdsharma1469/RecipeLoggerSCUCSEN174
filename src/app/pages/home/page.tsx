'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/navbar';

export default function UserPage() {
  const [profileImage, setProfileImage] = useState<string | null>('https://via.placeholder.com/150');
  const [username] = useState('Jane Doe');

  const [uploadedRecipes] = useState([
    { id: 1, title: 'Spaghetti Carbonara', image: 'https://via.placeholder.com/150' },
    { id: 2, title: 'Vegan Buddha Bowl', image: 'https://via.placeholder.com/150' },
    { id: 3, title: 'Chicken Alfredo', image: 'https://via.placeholder.com/150' },
  ]);

  const [savedRecipes] = useState([
    { id: 4, title: 'Pad Thai', image: 'https://via.placeholder.com/150' },
    { id: 5, title: 'Sushi Rolls', image: 'https://via.placeholder.com/150' },
    { id: 6, title: 'Tiramisu', image: 'https://via.placeholder.com/150' },
  ]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteRecipe = (id: number) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      console.log(`Recipe ID ${id} deleted (frontend only).`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <section className="flex flex-col items-center mb-10">
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--primary-green)] shadow-md transition-transform group-hover:scale-105 relative">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-[var(--pale-yellow)] w-full h-full flex items-center justify-center text-[var(--foreground)]">
                  Upload
                </div>
              )}
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold">{username}</h2>
        </section>

        <div className="flex justify-center gap-6 mb-10">
          <button
            onClick={() => alert('Redirecting to upload page...')}
            className="button-primary"
          >
            Post Recipe
          </button>
          <button
            onClick={() => alert('Delete recipe functionality coming soon...')}
            className="button-secondary"
          >
            Delete Recipe
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Uploaded Recipes */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Uploaded Recipes</h3>
            {uploadedRecipes.length === 0 ? (
              <p className="text-gray-500">No recipes uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {uploadedRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="card p-4 rounded-lg shadow overflow-hidden"
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h4 className="font-medium mt-2">{recipe.title}</h4>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="text-sm text-red-500 mt-2"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Recipes */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Saved Recipes</h3>
            {savedRecipes.length === 0 ? (
              <p className="text-gray-500">No recipes saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="card p-4 rounded-lg shadow overflow-hidden"
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h4 className="font-medium mt-2">{recipe.title}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
