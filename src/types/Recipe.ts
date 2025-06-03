import { Timestamp } from 'firebase/firestore'; // from Firebase client SDK

export type Recipe = {
  recipeId: string;
  author: string;
  createdAt: Timestamp | Date | string; // support all likely cases
  name: string;
  description?: string;

  ingredients: Array<{
    quantity: number;
    measurement: string;
    name: string;
  }>;

  steps: string[];
  comments: Array<{
    author: string;
    comment: string;
    time: Timestamp;
  }>;

  tags: {
    halal: boolean;
    vegan: boolean;
    vegetarian: boolean;
    lactoseFree: boolean;
    soy: boolean;
    peanuts: boolean;
  };

  tools: {
    knife: boolean;
    oven: boolean;
    airFryer: boolean;
    stainlessSteelPan: boolean;
    kettle: boolean;
    wok: boolean;
    smallPot: boolean;
    mediumPot: boolean;
    largePot: boolean;
    grater: boolean;
  };

  rating: number[];
  authorDiff: number;
  userDiff: number;

  // AI Estimated Price
  price: number;

  imageUrl: string;

  // 🟡 Optional cost field (already used in some code)
  cost?: number;
};