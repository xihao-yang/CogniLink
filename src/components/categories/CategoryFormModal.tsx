import { useState, useEffect } from 'react';
import { Category } from '../../types';
import { useCategories } from '../../contexts/CategoryContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import './CategoryFormModal.css';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const { addCategory, updateCategory } = useCategories();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3b82f6',
        icon: category.icon || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: '',
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'The category name cannot be left blank.';
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
      if (category) {
        await updateCategory(category.id, formData);
      } else {
        await addCategory(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit category' : 'Add category'}
      size="small"
    >
      <form onSubmit={handleSubmit} className="category-form">
        <Input
          label="Category name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Please enter the Category name"
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Please enter the Category description"
          rows={3}
        />
        <div className="category-form-group">
          <label className="category-form-label">Category color</label>
          <div className="category-form-color-group">
            <input
              type="color"
              className="category-form-color-input"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#3b82f6"
            />
          </div>
        </div>
        <Input
          label="Category icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="Input icon (emoji or text)"
        />
        <div className="category-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : category ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

