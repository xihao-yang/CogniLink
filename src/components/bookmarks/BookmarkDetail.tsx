import { useEffect, useState } from 'react';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useCategories } from '../../contexts/CategoryContext';
import { Bookmark } from '../../types';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import BookmarkFormModal from './BookmarkFormModal';
import './BookmarkDetail.css';

interface BookmarkDetailProps {
  bookmarkId: string;
  onClose: () => void;
}

export default function BookmarkDetail({ bookmarkId, onClose }: BookmarkDetailProps) {
  const { getBookmark, deleteBookmark, toggleFavorite, toggleArchive, bookmarks } = useBookmarks();
  const { categories } = useCategories();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get latest bookmark data from context
  useEffect(() => {
    const bookmarkFromContext = bookmarks.find((b) => b.id === bookmarkId);
    if (bookmarkFromContext) {
      setBookmark(bookmarkFromContext);
      setIsLoading(false);
    } else {
      // If not in context, load from database
      const loadBookmark = async () => {
        setIsLoading(true);
        const data = await getBookmark(bookmarkId);
        setBookmark(data);
        setIsLoading(false);
      };
      loadBookmark();
    }
  }, [bookmarkId, bookmarks, getBookmark]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you wish to delete this bookmark?')) {
      await deleteBookmark(bookmarkId);
      onClose();
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(bookmarkId);
    const updated = await getBookmark(bookmarkId);
    if (updated) {
      setBookmark(updated);
    }
  };

  const handleToggleArchive = async () => {
    await toggleArchive(bookmarkId);
    const updated = await getBookmark(bookmarkId);
    if (updated) {
      setBookmark(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="bookmark-detail">
        <LoadingSpinner />
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className="bookmark-detail">
        <div className="bookmark-detail-error">The bookmark does not exist.</div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === bookmark.categoryId);

  return (
    <div className="bookmark-detail">
      <div className="bookmark-detail-header">
        <div className="bookmark-detail-actions">
          <Button variant="ghost" size="small" onClick={handleToggleFavorite}>
            {bookmark.favorite ? '★ Remove from favorites' : '☆ Mark as favorite'}
          </Button>
          <Button variant="ghost" size="small" onClick={handleToggleArchive}>
            {bookmark.archived ? 'Remove from archive' : 'Add to archive'}
          </Button>
          <Button variant="ghost" size="small" onClick={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" size="small" onClick={handleDelete}>
            Delete
          </Button>
        </div>
        <button className="bookmark-detail-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="bookmark-detail-content">
        <h1 className="bookmark-detail-title">{bookmark.title}</h1>
        <div className="bookmark-detail-meta">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bookmark-detail-url"
          >
            {bookmark.url}
          </a>
        </div>
        {category && (
          <div className="bookmark-detail-category">
            <span
              className="bookmark-detail-category-badge"
              style={{ backgroundColor: category.color || '#e5e7eb' }}
            >
              {category.name}
            </span>
          </div>
        )}
        {bookmark.description && (
          <div className="bookmark-detail-section">
            <h2 className="bookmark-detail-section-title">Bookmark description</h2>
            <p className="bookmark-detail-text">{bookmark.description}</p>
          </div>
        )}
        {bookmark.notes && (
          <div className="bookmark-detail-section">
            <h2 className="bookmark-detail-section-title">Additional notes</h2>
            <p className="bookmark-detail-text">{bookmark.notes}</p>
          </div>
        )}
        {bookmark.tags.length > 0 && (
          <div className="bookmark-detail-section">
            <h2 className="bookmark-detail-section-title">Tag list</h2>
            <div className="bookmark-detail-tags">
              {bookmark.tags.map((tag) => (
                <span key={tag} className="bookmark-detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="bookmark-detail-footer">
          <div className="bookmark-detail-date">
            Created on: {new Date(bookmark.createdAt).toLocaleString('en-US')}
          </div>
          <div className="bookmark-detail-date">
            Last updated: {new Date(bookmark.updatedAt).toLocaleString('en-US')}
          </div>
        </div>
      </div>
      {isEditModalOpen && bookmark && (
        <BookmarkFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            // Refresh bookmark data after editing
            const updatedBookmark = bookmarks.find((b) => b.id === bookmarkId);
            if (updatedBookmark) {
              setBookmark(updatedBookmark);
            }
          }}
          bookmark={bookmark}
        />
      )}
    </div>
  );
}

