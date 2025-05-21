import { Timestamp } from 'firebase/firestore'; // from firebase *client* SDK

export type Recipe = {
  recipeId: string;
  author: string;
  createdAt: Timestamp | Date | string; // support all likely cases
  name: string;
  description?: string;
  ingredients: Array<{
    quantity: number;
    name: string;
  }>;
  steps: string[];
  comments: string[];
  tags: {
    vegan: boolean;
    vegetarian: boolean;
    lactoseFree: boolean;
    halal: boolean;
    soy: boolean;
    peanuts: boolean;
  };
  authorDiff: number;
  rating: number;
  userDiff: number;
  cost: number;
};
