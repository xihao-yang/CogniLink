# CogniLink Quick Start Guide

## Installation

### 1. Install dependencies

```bash
cd CogniLink
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The application will start at: http://localhost:5173

### 3. Build the production version

```bash
npm run build
```

The built files will be generated in the `dist` directory.

### 4. Preview the production build

```bash
npm run preview
```

## User Guide

### Add a Bookmark

1. Click the “Add Bookmark” button in the top-right corner.
2. Fill in the bookmark information:：
   - **标题**（必填）：书签的标题
   - **URL**（必填）：书签的网址
   - **描述**（可选）：书签的描述
   - **备注**（可选）：个人备注
   - **分类**（可选）：选择或创建分类
   - **标签**（可选）：添加标签（按回车添加）
3. 点击"添加"保存

### 搜索书签

1. 在顶部搜索栏输入关键词
2. 系统会自动搜索：
   - 标题
   - 描述
   - 备注
   - URL
   - 标签
3. 搜索结果按相关性排序

### 管理分类

1. 在侧边栏点击"分类"标签
2. 点击"添加分类"创建新分类
3. 设置分类名称、描述、颜色和图标
4. 点击分类名称筛选该分类下的书签

### 使用标签

1. 在添加/编辑书签时输入标签
2. 在侧边栏点击"标签"查看所有标签
3. 点击标签筛选包含该标签的书签
4. 标签按使用频率排序

### Favorites and Archive

- **Favorite**：Click the star icon on a bookmark card.
- **Archive**：Click the “Archive” button on the bookmark detail page.
- **Filter**：Use the filter panel to quickly view favorited or archived bookmarks.

### Edit a Bookmark

1. Click a bookmark card to view details.
2. Click “Edit.”
3. Modify the bookmark information.
4. Click “Update” to save.

### Delete a Bookmark

1. Click “Delete” on the bookmark detail page.
2. Confirm the deletion.

## Data Storage

All data is stored locally in the browser using IndexedDB:
- **Database name**: CogniLinkDB
- **Version**: 1
- **Object stores**: bookmarks, categories, tags

## Notes

1. **Data backup:**：Regularly export your data. Clearing browser data will permanently delete all bookmarks.
2. **Browser support**：Latest versions of Chrome, Firefox, or Safari are recommended.
3. **Data migration**：Future version upgrades will handle data migration automatically.

## Troubleshooting

### Issue: Unable to open the database

**Solutions:**：
- Check whether the browser supports IndexedDB.
- Clear the browser cache and try again.
- Check error messages in the browser console.

### Issue: No search results

**Solutions**：
- Verify that the search keywords are correct.
- Try different keywords.
- Check whether the bookmarks were added successfully.

### Issue: Unable to save bookmarks

**Solutions:**：
- Ensure the title and URL are filled in.
- Verify that the URL format is correct.
- Check the browser console for error messages.

## Technical Support

For more information, refer to:：
- README.md - Full documentation
- PROJECT_SUMMARY.md - Project overview
- 浏览器控制台 - Error messages

## Development Information

- **Tech stack**: React 18+, TypeScript, IndexedDB, Vite
- **Number of components**: 30+
- **Lines of code**: ~4,500+
- **Project status**: Core features completed

