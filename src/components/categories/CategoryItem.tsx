import { Category } from '../../types';
import './CategoryItem.css';

interface CategoryItemProps {
  category: Category;
  bookmarkCount: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export default function CategoryItem({
  category,
  bookmarkCount,
  isSelected,
  onClick,
  onDelete,
}: CategoryItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      onDelete(category.id);
    }
  };

  return (
    <div
      className={`category-item ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      style={
        isSelected && category.color
          ? { backgroundColor: `${category.color}20`, borderLeftColor: category.color }
          : {}
      }
    >
      <div className="category-item-content">
        {category.icon && <span className="category-item-icon">{category.icon}</span>}
        <span className="category-item-name">{category.name}</span>
      </div>
      <div className="category-item-actions">
        <span className="category-item-count">{bookmarkCount}</span>
        {onDelete && (
          <button
            className="category-item-delete"
            onClick={handleDelete}
            title="Delete category"
            aria-label="Delete category"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

