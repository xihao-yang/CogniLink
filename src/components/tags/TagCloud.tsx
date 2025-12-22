import { useEffect, useState } from 'react';
import { useTags } from '../../contexts/TagContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import './TagCloud.css';

export default function TagCloud() {
  const { getPopularTags, deleteTag, tags: allTags } = useTags();
  const { searchBookmarks } = useBookmarks();
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const loadTags = async () => {
      const popularTags = await getPopularTags(20);
      setTags(popularTags.map((t) => t.name));
    };
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTagClick = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newSelectedTags);

    if (newSelectedTags.length === 0) {
      searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
    } else {
      searchBookmarks({
        query: '',
        tags: newSelectedTags,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    }
  };

  const handleDeleteTag = async (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tag = allTags.find((t) => t.name === tagName);
    if (tag) {
      if (window.confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
        try {
          await deleteTag(tag.id);
          setTags((prev) => prev.filter((t) => t !== tagName));
          setSelectedTags((prev) => prev.filter((t) => t !== tagName));
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to delete tag');
        }
      }
    }
  };

  if (tags.length === 0) {
    return <div className="tag-cloud-empty">No tags available</div>;
  }

  return (
    <div className="tag-cloud">
      {tags.map((tag) => {
        const tagData = allTags.find((t) => t.name === tag);
        const canDelete = tagData && tagData.usageCount === 0;
        return (
          <div key={tag} className="tag-cloud-item">
            <button
              className={`tag-cloud-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
            {canDelete && (
              <button
                className="tag-cloud-delete"
                onClick={(e) => handleDeleteTag(tag, e)}
                title="Delete tag"
                aria-label="Delete tag"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

