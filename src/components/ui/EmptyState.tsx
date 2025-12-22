import './EmptyState.css';

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📚</div>
      <h2 className="empty-state-title">No bookmarks yet</h2>
      <p className="empty-state-description">Add your first bookmark to get started</p>
    </div>
  );
}

