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

### 收藏和归档

- **收藏**：点击书签卡片上的星标收藏书签
- **归档**：在书签详情页面点击"归档"按钮
- **筛选**：使用筛选面板快速查看收藏或归档的书签

### 编辑书签

1. 点击书签卡片查看详情
2. 点击"编辑"按钮
3. 修改书签信息
4. 点击"更新"保存

### 删除书签

1. 在书签详情页面点击"删除"按钮
2. 确认删除操作

## 数据存储

所有数据都存储在浏览器的 IndexedDB 中：
- **数据库名称**: CogniLinkDB
- **版本**: 1
- **对象存储**: bookmarks, categories, tags

## 注意事项

1. **数据备份**：定期导出数据备份，清除浏览器数据会导致所有书签丢失
2. **浏览器支持**：建议使用最新版本的 Chrome、Firefox 或 Safari
3. **数据迁移**：未来版本升级时，数据迁移功能会自动处理

## 故障排除

### 问题：无法打开数据库

**解决方案**：
- 检查浏览器是否支持 IndexedDB
- 清除浏览器缓存后重试
- 检查浏览器控制台错误信息

### 问题：搜索无结果

**解决方案**：
- 检查搜索关键词是否正确
- 尝试使用不同的关键词
- 检查书签是否已正确添加

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

