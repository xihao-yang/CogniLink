/**
 * IndexedDB database management module
 * Handles database initialization, version management, data migration, etc.
 */

import { Bookmark, Category, Tag, DatabaseSchema } from '../types';

const DB_NAME = 'CogniLinkDB';
const DB_VERSION = 1;
const STORE_BOOKMARKS = 'bookmarks';
const STORE_CATEGORIES = 'categories';
const STORE_TAGS = 'tags';

export class Database {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize database
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        reject(new Error('Unable to open the database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create bookmark store
        if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
          const bookmarkStore = db.createObjectStore(STORE_BOOKMARKS, {
            keyPath: 'id',
          });
          bookmarkStore.createIndex('categoryId', 'categoryId', {
            unique: false,
          });
          bookmarkStore.createIndex('createdAt', 'createdAt', {
            unique: false,
          });
          bookmarkStore.createIndex('updatedAt', 'updatedAt', {
            unique: false,
          });
          bookmarkStore.createIndex('favorite', 'favorite', {
            unique: false,
          });
          bookmarkStore.createIndex('archived', 'archived', {
            unique: false,
          });
        }

        // Create category store
        if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
          const categoryStore = db.createObjectStore(STORE_CATEGORIES, {
            keyPath: 'id',
          });
          categoryStore.createIndex('parentId', 'parentId', {
            unique: false,
          });
          categoryStore.createIndex('name', 'name', {
            unique: false,
          });
        }

        // Create tag store
        if (!db.objectStoreNames.contains(STORE_TAGS)) {
          const tagStore = db.createObjectStore(STORE_TAGS, {
            keyPath: 'id',
          });
          tagStore.createIndex('name', 'name', { unique: true });
          tagStore.createIndex('usageCount', 'usageCount', {
            unique: false,
          });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get database instance
   */
  async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Bookmark operations
   */
  async addBookmark(bookmark: Bookmark): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKMARKS], 'readwrite');
      const store = transaction.objectStore(STORE_BOOKMARKS);
      const request = store.add(bookmark);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateBookmark(bookmark: Bookmark): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKMARKS], 'readwrite');
      const store = transaction.objectStore(STORE_BOOKMARKS);
      const request = store.put(bookmark);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBookmark(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKMARKS], 'readwrite');
      const store = transaction.objectStore(STORE_BOOKMARKS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getBookmark(id: string): Promise<Bookmark | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKMARKS], 'readonly');
      const store = transaction.objectStore(STORE_BOOKMARKS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKMARKS], 'readonly');
      const store = transaction.objectStore(STORE_BOOKMARKS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getBookmarksByCategory(categoryId: string): Promise<Bookmark[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BOOKMARKS], 'readonly');
      const store = transaction.objectStore(STORE_BOOKMARKS);
      const index = store.index('categoryId');
      const request = index.getAll(categoryId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Category operations
   */
  async addCategory(category: Category): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CATEGORIES], 'readwrite');
      const store = transaction.objectStore(STORE_CATEGORIES);
      const request = store.add(category);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateCategory(category: Category): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CATEGORIES], 'readwrite');
      const store = transaction.objectStore(STORE_CATEGORIES);
      const request = store.put(category);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CATEGORIES], 'readwrite');
      const store = transaction.objectStore(STORE_CATEGORIES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCategory(id: string): Promise<Category | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CATEGORIES], 'readonly');
      const store = transaction.objectStore(STORE_CATEGORIES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CATEGORIES], 'readonly');
      const store = transaction.objectStore(STORE_CATEGORIES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Tag operations
   */
  async addTag(tag: Tag): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TAGS], 'readwrite');
      const store = transaction.objectStore(STORE_TAGS);
      const request = store.put(tag);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateTag(tag: Tag): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TAGS], 'readwrite');
      const store = transaction.objectStore(STORE_TAGS);
      const request = store.put(tag);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTag(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TAGS], 'readwrite');
      const store = transaction.objectStore(STORE_TAGS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTag(id: string): Promise<Tag | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TAGS], 'readonly');
      const store = transaction.objectStore(STORE_TAGS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTags(): Promise<Tag[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TAGS], 'readonly');
      const store = transaction.objectStore(STORE_TAGS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Data migration (for future version upgrades)
   */
  async migrate(fromVersion: number, toVersion: number): Promise<void> {
    // Implement data migration logic
    console.log(`Migrating from version ${fromVersion} to ${toVersion}`);
  }

  /**
   * Export all data
   */
  async exportData(): Promise<DatabaseSchema> {
    const [bookmarks, categories, tags] = await Promise.all([
      this.getAllBookmarks(),
      this.getAllCategories(),
      this.getAllTags(),
    ]);

    return {
      version: DB_VERSION,
      bookmarks,
      categories,
      tags,
    };
  }

  /**
   * Import data
   */
  async importData(data: DatabaseSchema): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(
      [STORE_BOOKMARKS, STORE_CATEGORIES, STORE_TAGS],
      'readwrite'
    );

    // Clear existing data
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORE_BOOKMARKS).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORE_CATEGORIES).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORE_TAGS).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ]);

    // Import new data
    const bookmarkStore = transaction.objectStore(STORE_BOOKMARKS);
    const categoryStore = transaction.objectStore(STORE_CATEGORIES);
    const tagStore = transaction.objectStore(STORE_TAGS);

    for (const bookmark of data.bookmarks) {
      bookmarkStore.add(bookmark);
    }

    for (const category of data.categories) {
      categoryStore.add(category);
    }

    for (const tag of data.tags) {
      tagStore.add(tag);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Singleton instance
export const db = new Database();

