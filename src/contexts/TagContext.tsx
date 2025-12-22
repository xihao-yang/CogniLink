import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Tag } from '../types';
import { tagService } from '../services/bookmarkService';

interface TagContextType {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  getPopularTags: (limit?: number) => Promise<Tag[]>;
  updateTagColor: (id: string, color: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  refreshTags: () => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export function TagProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTags = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tagService.getAllTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTags();
  }, []);

  const getPopularTags = async (limit: number = 10) => {
    try {
      setError(null);
      return await tagService.getPopularTags(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular tags');
      return [];
    }
  };

  const updateTagColor = async (id: string, color: string) => {
    try {
      setError(null);
      const updated = await tagService.updateTagColor(id, color);
      setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tag';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTag = async (id: string) => {
    try {
      setError(null);
      await tagService.deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tag';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <TagContext.Provider
      value={{
        tags,
        isLoading,
        error,
        getPopularTags,
        updateTagColor,
        deleteTag,
        refreshTags,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within BookmarkProvider.');
  }
  return context;
}

