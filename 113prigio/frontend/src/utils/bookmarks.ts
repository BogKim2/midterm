import type { RecipeDetail } from '../types'

const KEY = 'prigio_bookmarks'

export function getBookmarks(): RecipeDetail[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function addBookmark(recipe: RecipeDetail): void {
  const bookmarks = getBookmarks()
  if (!bookmarks.find((r) => r.title === recipe.title)) {
    localStorage.setItem(KEY, JSON.stringify([...bookmarks, recipe]))
  }
}

export function removeBookmark(title: string): void {
  const bookmarks = getBookmarks().filter((r) => r.title !== title)
  localStorage.setItem(KEY, JSON.stringify(bookmarks))
}

export function isBookmarked(title: string): boolean {
  return getBookmarks().some((r) => r.title === title)
}
