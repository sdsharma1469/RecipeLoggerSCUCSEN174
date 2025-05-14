// types/recipe.ts or types/recipeList.ts
import type { Recipe } from '@/types/Recipe'

export class RecipeObjectList {
  private items: Recipe[] = []

  constructor(initialItems?: Recipe[]) {
    if (initialItems) {
      this.items = [...initialItems]
    }
  }

  append(recipe: Recipe): void {
    this.items.push(recipe)
  }

  get(index: number): Recipe | undefined {
    return this.items[index]
  }

  size(): number {
    return this.items.length
  }

  toArray(): Recipe[] {
    return [...this.items]
  }
}
