/**
 * Bookmark service layer
 * Integrates database operations and search index
 */

import { Bookmark, Category, Tag, SearchOptions, SearchResult } from '../types';
import { db } from '../db/database';
import { searchIndex } from './searchIndex';
import { IdGenerator } from '../utils/idGenerator';

export class BookmarkService {
  private initialized = false;

  /**
   * Initialize service (load data and rebuild index)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await db.init();
    const bookmarks = await db.getAllBookmarks();
    searchIndex.rebuildIndex(bookmarks);
    this.initialized = true;
  }

  /**
   * Create bookmark
   */
  async createBookmark(bookmarkData: Partial<Bookmark>): Promise<Bookmark> {
    await this.initialize();

    const now = Date.now();
    const bookmark: Bookmark = {
      id: IdGenerator.generate(),
      title: bookmarkData.title || 'Untitled',
      url: bookmarkData.url || '',
      description: bookmarkData.description,
      notes: bookmarkData.notes,
      categoryId: bookmarkData.categoryId,
      tags: bookmarkData.tags || [],
      createdAt: bookmarkData.createdAt || now,
      updatedAt: now,
      favorite: bookmarkData.favorite || false,
      archived: bookmarkData.archived || false,
    };

    await db.addBookmark(bookmark);
    searchIndex.addBookmark(bookmark);

    // Update tag usage counts
    await this.updateTagUsageCounts(bookmark.tags, 1);

    return bookmark;
  }

  /**
   * Update bookmark
   */
  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
    await this.initialize();

    const existing = await db.getBookmark(id);
    if (!existing) {
      throw new Error('The bookmark does not exist.');
    }

    const oldTags = existing.tags;
    const updated: Bookmark = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    await db.updateBookmark(updated);
    searchIndex.updateBookmark(updated);

    // Update tag usage counts
    const addedTags = updated.tags.filter((tag) => !oldTags.includes(tag));
    const removedTags = oldTags.filter((tag) => !updated.tags.includes(tag));
    await this.updateTagUsageCounts(addedTags, 1);
    await this.updateTagUsageCounts(removedTags, -1);

    return updated;
  }

  /**
   * Delete bookmark
   */
  async deleteBookmark(id: string): Promise<void> {
    await this.initialize();

    const bookmark = await db.getBookmark(id);
    if (!bookmark) {
      throw new Error('The bookmark does not exist.');
    }

    await db.deleteBookmark(id);
    searchIndex.removeBookmark(id);

    // Update tag usage counts
    await this.updateTagUsageCounts(bookmark.tags, -1);
  }

  /**
   * Get bookmark
   */
  async getBookmark(id: string): Promise<Bookmark | null> {
    await this.initialize();
    return await db.getBookmark(id);
  }

  /**
   * Get all bookmarks
   */
  async getAllBookmarks(): Promise<Bookmark[]> {
    await this.initialize();
    return await db.getAllBookmarks();
  }

  /**
   * Search bookmarks
   */
  async searchBookmarks(options: SearchOptions): Promise<SearchResult[]> {
    await this.initialize();
    return searchIndex.search(options);
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<Bookmark> {
    const bookmark = await this.getBookmark(id);
    if (!bookmark) {
      throw new Error('The bookmark does not exist.');
    }
    return await this.updateBookmark(id, { favorite: !bookmark.favorite });
  }

  /**
   * Toggle archive status
   */
  async toggleArchive(id: string): Promise<Bookmark> {
    const bookmark = await this.getBookmark(id);
    if (!bookmark) {
      throw new Error('The bookmark does not exist.');
    }
    return await this.updateBookmark(id, { archived: !bookmark.archived });
  }

  /**
   * Update tag usage counts
   */
  private async updateTagUsageCounts(tagNames: string[], delta: number): Promise<void> {
    for (const tagName of tagNames) {
      const existingTags = await db.getAllTags();
      let tag = existingTags.find((t) => t.name === tagName);

      if (!tag) {
        if (delta > 0) {
          // Create new tag
          tag = {
            id: IdGenerator.generate(),
            name: tagName,
            createdAt: Date.now(),
            usageCount: 1,
          };
          await db.addTag(tag);
        }
      } else {
        // Update usage count
        tag.usageCount = Math.max(0, tag.usageCount + delta);
        if (tag.usageCount === 0) {
          // Optional: delete unused tags
          // await db.deleteTag(tag.id);
        } else {
          await db.updateTag(tag);
        }
      }
    }
  }
}

export class CategoryService {
  /**
   * Create category
   */
  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    await db.init();

    const now = Date.now();
    const category: Category = {
      id: IdGenerator.generate(),
      name: categoryData.name || 'Untitled Category',
      description: categoryData.description,
      color: categoryData.color,
      icon: categoryData.icon,
      parentId: categoryData.parentId,
      createdAt: categoryData.createdAt || now,
      updatedAt: now,
    };

    await db.addCategory(category);
    return category;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await db.init();

    const existing = await db.getCategory(id);
    if (!existing) {
      throw new Error('The category does not exist.');
    }

    const updated: Category = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    await db.updateCategory(updated);
    return updated;
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    await db.init();

    // Check if category has subcategories
    const allCategories = await db.getAllCategories();
    const hasChildren = allCategories.some((cat) => cat.parentId === id);

    if (hasChildren) {
      throw new Error('Categories containing subcategories cannot be deleted.');
    }

    // Check if any bookmarks use this category
    const bookmarks = await db.getBookmarksByCategory(id);
    if (bookmarks.length > 0) {
      throw new Error('Categories with associated bookmarks cannot be deleted.');
    }

    await db.deleteCategory(id);
  }

  /**
   * Get category
   */
  async getCategory(id: string): Promise<Category | null> {
    await db.init();
    return await db.getCategory(id);
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    await db.init();
    return await db.getAllCategories();
  }

  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<Category[]> {
    const categories = await this.getAllCategories();
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Build mapping
    categories.forEach((cat) => {
      categoryMap.set(cat.id, cat);
    });

    // Build tree structure
    categories.forEach((cat) => {
      if (!cat.parentId) {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }
}

export class TagService {
  /**
   * Get all tags
   */
  async getAllTags(): Promise<Tag[]> {
    await db.init();
    return await db.getAllTags();
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const tags = await this.getAllTags();
    return tags
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Update tag color
   */
  async updateTagColor(id: string, color: string): Promise<Tag> {
    await db.init();

    const existing = await db.getTag(id);
    if (!existing) {
      throw new Error('The tag does not exist.');
    }

    const updated: Tag = {
      ...existing,
      color,
    };

    await db.updateTag(updated);
    return updated;
  }

  /**
   * Delete tag
   */
  async deleteTag(id: string): Promise<void> {
    await db.init();

    const existing = await db.getTag(id);
    if (!existing) {
      throw new Error('The tag does not exist.');
    }

    // Check if tag is still in use
    if (existing.usageCount > 0) {
      throw new Error('Tags that are still in use cannot be deleted.');
    }

    await db.deleteTag(id);
  }
}

// Singleton instances
export const bookmarkService = new BookmarkService();
export const categoryService = new CategoryService();
export const tagService = new TagService();

