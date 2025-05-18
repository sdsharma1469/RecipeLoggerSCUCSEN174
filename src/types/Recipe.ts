export type Recipe = {
  recipeId: string;
  name: string;
  description?: string;
  ingredients: Array<{
    quantity: number;
    name: string;
  }>;
  steps: string[];
  tags: {
    vegan: boolean;
    vegetarian: boolean;
    lactoseFree: boolean;
    halal: boolean;
    soy: boolean;
    peanuts: boolean;
  };
  creatorRating: number;
  difficulty: number;
};