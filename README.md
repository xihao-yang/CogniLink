# CogniLink - Intelligent Bookmark and Knowledge Management System

CogniLink is a powerful client-side bookmark and knowledge management system that runs entirely in the browser and uses IndexedDB for data storage.

## Project Description

This project is implemented as part of the course requirements.
The repository contains source code and materials related to the CogniLink project.

## Notes

This repository is intended for **educational purposes only**.

## Disclaimer

This project is not intended as a research prototype or a production system.

## 功能特性

- 📚 **Intelligent Bookmark Management** - Add, edit, delete, and organize bookmarks
- 🔍 **Full-Text Search** - High-performance full-text search via a custom inverted index
- 🏷️ **Tag System** - Categorize and organize bookmarks with tags
- 📁 **Category Management** - Create and manage bookmark categories
- ⭐ **Favorites** - Mark and filter favorite bookmarks
- 📦 **Archiving** - Archive bookmarks that are no longer needed
- 💾 **Client-Side Storage** - All data is stored in the browser via IndexedDB
- 🎨 **Modern UI** - A clean, responsive user interface

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety and maintainability
- **IndexedDB** - Client-side persistent storage
- **Vite** - Build tool and development server
- **Custom Search Index** - Inverted index–based full-text search implementation

## 项目结构


```
CogniLink/
├── src/
│   ├── components/        # React components
│   │   ├── bookmarks/     # Bookmark-related components
│   │   ├── categories/    # Category-related components
│   │   ├── tags/          # Tag-related components
│   │   ├── search/        # Search-related components
│   │   ├── filters/       # Filtering components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # Shared UI primitives/components
│   ├── contexts/          # React Context
│   ├── db/                # IndexedDB management layer
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Installation and Running

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

The application will start at http://localhost:5173

### Build for Production

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

## Core Implementation

### 1. IndexedDB 数据管理

- Database schema design
- Asynchronous transaction handling
- Data migration support
- Data import/export


### 2. Custom Search Index

- Inverted index implementation
- Chinese/English tokenization
- TF-IDF scoring
- Multi-field search

### 3. React Component Architecture
- 25+ functional components25+ 功能组件
- State management via Context API
- Custom Hooks
- Responsive design

## Data Model

### Bookmark

```typescript
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  categoryId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
  archived: boolean;
}
```

### Category 

```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Tag

```typescript
interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
  usageCount: number;
}
```

## Usage Guide

### Adding a Bookmark

1. Click the “Add Bookmark” button in the top-right corner
2. Fill in the bookmark details (Title and URL are required)
3. Optional: add description, notes, category, and tags
4. Click “Add” to save

### 搜索书签

1. 在顶部搜索栏输入关键词
2. 系统会自动搜索标题、描述、备注、URL 和标签
3. 搜索结果按相关性排序

### 管理分类

1. 在侧边栏点击"分类"标签
2. 点击"添加分类"创建新分类
3. 点击分类名称筛选该分类下的书签

### 使用标签

1. 在添加/编辑书签时输入标签
2. 在侧边栏点击"标签"查看所有标签
3. 点击标签筛选包含该标签的书签

### 收藏和归档

- 点击书签卡片上的星标收藏书签
- 在书签详情页面可以归档书签
- 使用筛选面板快速查看收藏或归档的书签

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)

## 开发计划

- [ ] 数据导入/导出功能
- [ ] 书签批量操作
- [ ] 更高级的搜索选项
- [ ] 主题切换
- [ ] 键盘快捷键
- [ ] 书签分享功能

## 许可证

MIT License

## 作者

Xihao Yang

---

**注意**: 这是一个纯客户端应用，所有数据都存储在浏览器的 IndexedDB 中。清除浏览器数据将导致所有书签丢失，请定期导出数据备份。

