import { Timestamp } from 'firebase/firestore'; // from firebase *client* SDK

export type Recipe = {
  name: string;
  recipeId: string;
  author: string;
  createdAt: Timestamp | Date | string; // support all likely cases
  description?: string;
  ingredients: Array<{
    //quantity: number;
    //measurement: string;
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
};
  authorDiff: number;
  rating: number[];
  userDiff: number;
  cost: number;
};
