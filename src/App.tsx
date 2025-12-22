import { useEffect, useState } from 'react';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { TagProvider } from './contexts/TagContext';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize application
    const initApp = async () => {
      try {
        // Preload data
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('Application initialisation failed:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BookmarkProvider>
      <CategoryProvider>
        <TagProvider>
          <MainLayout />
        </TagProvider>
      </CategoryProvider>
    </BookmarkProvider>
  );
}

export default App;

