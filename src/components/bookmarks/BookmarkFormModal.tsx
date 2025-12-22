import { useState, useEffect } from 'react';
import { Bookmark } from '../../types';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useCategories } from '../../contexts/CategoryContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import TagInput from '../tags/TagInput';
import './BookmarkFormModal.css';

interface BookmarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark?: Bookmark;
}

export default function BookmarkFormModal({
  isOpen,
  onClose,
  bookmark,
}: BookmarkFormModalProps) {
  const { addBookmark, updateBookmark } = useBookmarks();
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    notes: '',
    categoryId: '',
    tags: [] as string[],
    favorite: false,
    archived: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description || '',
        notes: bookmark.notes || '',
        categoryId: bookmark.categoryId || '',
        tags: bookmark.tags || [],
        favorite: bookmark.favorite,
        archived: bookmark.archived,
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        notes: '',
        categoryId: '',
        tags: [],
        favorite: false,
        archived: false,
      });
    }
    setErrors({});
  }, [bookmark, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title cannot be empty';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL cannot be empty';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (bookmark) {
        await updateBookmark(bookmark.id, formData);
      } else {
        await addBookmark(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save Bookmark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookmark ? 'Edit bookmark' : 'Add bookmark'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="bookmark-form">
        <Input
          label="Bookmark title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          placeholder="Type a descriptive title"
        />
        <Input
          label="Bookmark URL *"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          error={errors.url}
          placeholder="https://example.com"
        />
        <Textarea
          label="Bookmark description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this bookmark"
          rows={3}
        />
        <Textarea
          label="Personal notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add personal notes"
          rows={5}
        />
        <div className="bookmark-form-group">
          <label className="bookmark-form-label">Category</label>
          <select
            className="bookmark-form-select"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="bookmark-form-group">
          <label className="bookmark-form-label">Tags</label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
          />
        </div>
        <div className="bookmark-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : bookmark ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

