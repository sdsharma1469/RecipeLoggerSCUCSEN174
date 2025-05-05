export class RecipeList {
    private items: string[] = []
  
    constructor(initialItems?: string[]) {
      if (initialItems) {
        this.items = [...initialItems]
      }
    }
  
    append(recipeId: string): void {
      this.items.push(recipeId)
    }
  
    get(index: number): string | undefined {
      return this.items[index]
    }
  
    size(): number {
      return this.items.length
    }
  
    toArray(): string[] {
      return [...this.items]
    }
  }
  