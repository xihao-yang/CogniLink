import { useState } from 'react';
import { useCategories } from '../../contexts/CategoryContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import CategoryItem from './CategoryItem';
import CategoryFormModal from './CategoryFormModal';
import Button from '../ui/Button';
import './CategoryList.css';

export default function CategoryList() {
  const { categories, deleteCategory } = useCategories();
  const { bookmarks, searchBookmarks } = useBookmarks();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
    } else {
      setSelectedCategoryId(categoryId);
      searchBookmarks({
        query: '',
        categoryId,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    }
  };

  const getBookmarkCount = (categoryId: string) => {
    return bookmarks.filter((b) => b.categoryId === categoryId).length;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      // If deleted category was selected, clear selection
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  return (
    <div className="category-list">
      <div className="category-list-header">
        <Button
          variant="primary"
          size="small"
          onClick={() => setIsAddModalOpen(true)}
        >
          New category
        </Button>
      </div>
      <div className="category-list-items">
        <div
          className={`category-list-item ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategoryId(null);
            searchBookmarks({ query: '', sortBy: 'updatedAt', sortOrder: 'desc' });
          }}
        >
          <span className="category-list-item-name">All bookmarks</span>
          <span className="category-list-item-count">{bookmarks.length}</span>
        </div>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            bookmarkCount={getBookmarkCount(category.id)}
            isSelected={selectedCategoryId === category.id}
            onClick={() => handleCategoryClick(category.id)}
            onDelete={handleDeleteCategory}
          />
        ))}
      </div>
      {isAddModalOpen && (
        <CategoryFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}

