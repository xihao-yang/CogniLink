/**
 * Custom search index module
 * Implements inverted index mechanism for full-text search
 */

import { Bookmark, SearchResult, SearchOptions, IndexedTerm } from '../types';

export class SearchIndex {
  private index: Map<string, IndexedTerm> = new Map();
  private bookmarks: Map<string, Bookmark> = new Map();

  /**
   * Text tokenization (simple implementation, supports Chinese and English)
   */
  private tokenize(text: string): string[] {
    if (!text) return [];

    // Remove special characters, convert to lowercase
    const normalized = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .trim();

    if (!normalized) return [];

    // Chinese characters tokenized individually, English words split by spaces
    const tokens: string[] = [];
    let currentWord = '';

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      const charCode = char.charCodeAt(0);

      // Chinese character range
      if (charCode >= 0x4e00 && charCode <= 0x9fa5) {
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
        tokens.push(char);
      } else if (/\s/.test(char)) {
        // Space separator
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
      } else {
        // English/numeric characters
        currentWord += char;
      }
    }

    if (currentWord) {
      tokens.push(currentWord);
    }

    // Filter empty strings and words that are too short
    return tokens.filter((token) => token.length > 0);
  }

  /**
   * Extract all terms from a document
   */
  private extractTerms(bookmark: Bookmark): string[] {
    const terms: string[] = [];

    // Title
    if (bookmark.title) {
      terms.push(...this.tokenize(bookmark.title));
    }

    // Description
    if (bookmark.description) {
      terms.push(...this.tokenize(bookmark.description));
    }

    // Notes
    if (bookmark.notes) {
      terms.push(...this.tokenize(bookmark.notes));
    }

    // URL (extract domain)
    if (bookmark.url) {
      try {
        const url = new URL(bookmark.url);
        terms.push(...this.tokenize(url.hostname));
        terms.push(...this.tokenize(url.pathname));
      } catch {
        terms.push(...this.tokenize(bookmark.url));
      }
    }

    // Tags
    bookmark.tags.forEach((tag) => {
      terms.push(...this.tokenize(tag));
    });

    return terms;
  }

  /**
   * Add bookmark to index
   */
  addBookmark(bookmark: Bookmark): void {
    this.bookmarks.set(bookmark.id, bookmark);
    const terms = this.extractTerms(bookmark);

    terms.forEach((term) => {
      if (!this.index.has(term)) {
        this.index.set(term, {
          term,
          bookmarks: new Map(),
        });
      }

      const indexEntry = this.index.get(term)!;
      const currentCount = indexEntry.bookmarks.get(bookmark.id) || 0;
      indexEntry.bookmarks.set(bookmark.id, currentCount + 1);
    });
  }

  /**
   * Update bookmark index
   */
  updateBookmark(bookmark: Bookmark): void {
    this.removeBookmark(bookmark.id);
    this.addBookmark(bookmark);
  }

  /**
   * Remove bookmark from index
   */
  removeBookmark(bookmarkId: string): void {
    const bookmark = this.bookmarks.get(bookmarkId);
    if (!bookmark) return;

    this.bookmarks.delete(bookmarkId);

    // Update index
    const terms = this.extractTerms(bookmark);
    terms.forEach((term) => {
      const indexEntry = this.index.get(term);
      if (indexEntry) {
        indexEntry.bookmarks.delete(bookmarkId);
        if (indexEntry.bookmarks.size === 0) {
          this.index.delete(term);
        }
      }
    });
  }

  /**
   * Rebuild entire index
   */
  rebuildIndex(bookmarks: Bookmark[]): void {
    this.index.clear();
    this.bookmarks.clear();
    bookmarks.forEach((bookmark) => this.addBookmark(bookmark));
  }

  /**
   * Calculate search score (simplified TF-IDF)
   */
  private calculateScore(
    bookmarkId: string,
    queryTerms: string[],
    matchedFields: string[]
  ): number {
    const bookmark = this.bookmarks.get(bookmarkId);
    if (!bookmark) return 0;

    let score = 0;

    queryTerms.forEach((term) => {
      const indexEntry = this.index.get(term);
      if (indexEntry) {
        const frequency = indexEntry.bookmarks.get(bookmarkId) || 0;
        // Base score: term frequency
        score += frequency;

        // Field weights
        const bookmarkTerms = this.extractTerms(bookmark);
        const termIndex = bookmarkTerms.indexOf(term);

        if (termIndex !== -1) {
          // Title match has highest weight
          if (
            bookmark.title.toLowerCase().includes(term) &&
            !matchedFields.includes('title')
          ) {
            matchedFields.push('title');
            score += 10;
          }
          // Tag match has higher weight
          if (
            bookmark.tags.some((tag) => tag.toLowerCase().includes(term)) &&
            !matchedFields.includes('tags')
          ) {
            matchedFields.push('tags');
            score += 8;
          }
          // Description match
          if (
            bookmark.description?.toLowerCase().includes(term) &&
            !matchedFields.includes('description')
          ) {
            matchedFields.push('description');
            score += 5;
          }
          // Notes match
          if (
            bookmark.notes?.toLowerCase().includes(term) &&
            !matchedFields.includes('notes')
          ) {
            matchedFields.push('notes');
            score += 3;
          }
        }
      }
    });

    return score;
  }

  /**
   * Search bookmarks
   */
  search(options: SearchOptions): SearchResult[] {
    const {
      query,
      categoryId,
      tags,
      favorite,
      archived,
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit,
    } = options;

    const queryTerms = this.tokenize(query);
    const results: SearchResult[] = [];

    // If query is empty, return all bookmarks (apply filters)
    if (queryTerms.length === 0) {
      this.bookmarks.forEach((bookmark) => {
        if (this.matchesFilters(bookmark, { categoryId, tags, favorite, archived })) {
          results.push({
            bookmark,
            score: 0,
            matchedFields: [],
          });
        }
      });
    } else {
      // Use inverted index for search
      const bookmarkScores = new Map<string, { score: number; matchedFields: string[] }>();

      queryTerms.forEach((term) => {
        const indexEntry = this.index.get(term);
        if (indexEntry) {
          indexEntry.bookmarks.forEach((frequency, bookmarkId) => {
            if (!bookmarkScores.has(bookmarkId)) {
              bookmarkScores.set(bookmarkId, { score: 0, matchedFields: [] });
            }
          });
        }
      });

      // Calculate score for each bookmark
      bookmarkScores.forEach((data, bookmarkId) => {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (bookmark && this.matchesFilters(bookmark, { categoryId, tags, favorite, archived })) {
          data.score = this.calculateScore(bookmarkId, queryTerms, data.matchedFields);
          results.push({
            bookmark,
            score: data.score,
            matchedFields: data.matchedFields,
          });
        }
      });
    }

    // Sort
    results.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'relevance') {
        comparison = b.score - a.score;
      } else if (sortBy === 'title') {
        comparison = a.bookmark.title.localeCompare(b.bookmark.title);
      } else if (sortBy === 'createdAt') {
        comparison = a.bookmark.createdAt - b.bookmark.createdAt;
      } else if (sortBy === 'updatedAt') {
        comparison = a.bookmark.updatedAt - b.bookmark.updatedAt;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Limit result count
    if (limit && limit > 0) {
      return results.slice(0, limit);
    }

    return results;
  }

  /**
   * Check if bookmark matches filter conditions
   */
  private matchesFilters(
    bookmark: Bookmark,
    filters: {
      categoryId?: string;
      tags?: string[];
      favorite?: boolean;
      archived?: boolean;
    }
  ): boolean {
    if (filters.categoryId && bookmark.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => bookmark.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    if (filters.favorite !== undefined && bookmark.favorite !== filters.favorite) {
      return false;
    }

    if (filters.archived !== undefined && bookmark.archived !== filters.archived) {
      return false;
    }

    return true;
  }

  /**
   * Get index statistics
   */
  getStats(): { totalTerms: number; totalBookmarks: number } {
    return {
      totalTerms: this.index.size,
      totalBookmarks: this.bookmarks.size,
    };
  }
}

// Singleton instance
export const searchIndex = new SearchIndex();

