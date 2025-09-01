# 🚀 Turbopack 使用指南

## 选择使用 Turbopack

### ✅ 推荐使用场景

```bash
# 开发环境推荐使用
npm run dev          # 使用 Turbopack（推荐）

# 生产构建可选
npm run build        # 使用 Turbopack
# 或
next build          # 使用 Webpack
```

### 📊 性能对比（开发环境）

| 指标         | Turbopack | Webpack     | 提升               |
| ------------ | --------- | ----------- | ------------------ |
| **首次启动** | ~2-3 秒   | ~10-15 秒   | **5-7 倍** ⚡      |
| **热重载**   | ~50-200ms | ~500-2000ms | **5-10 倍** 🔥     |
| **内存占用** | 较低      | 较高        | **减少 30-50%** 💾 |
| **稳定性**   | 良好      | 非常稳定    | -                  |

## 🔧 配置说明

### 默认配置（推荐）

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack"
  }
}
```

### 自定义配置

```bash
# 指定端口
next dev --turbopack --port 3001

# 开启 HTTPS
next dev --turbopack --https

# 指定主机
next dev --turbopack --hostname 0.0.0.0
```

## ⚠️ 注意事项

### 当前限制

- **Node.js 版本要求**：需要 18.18.0+
- **功能完整性**：某些 Webpack 插件可能不支持
- **生产优化**：仍在持续改进中

### 兼容性检查

```bash
# 检查你的 Node.js 版本
node --version

# 如果版本过低，可以升级
# 使用 nvm 管理 Node.js 版本
nvm install 20
nvm use 20
```

## 🎯 使用建议

### 对于你的项目

```bash
# ✅ 推荐：使用 Turbopack（开发环境）
npm run dev

# ✅ 推荐：生产构建也使用 Turbopack
npm run build
```

### 为什么适合你的项目？

1. **🚀 快速开发**：AI 搜索界面开发需要频繁重载
2. **💾 内存友好**：你的系统资源会更充足
3. **⚡ 响应迅速**：提升开发体验
4. **🔧 现代化**：Next.js 15 的推荐选择

## 🔄 切换方式

### 如果想切换回 Webpack

```bash
# 修改 package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

### 如果想保留两个选项

```bash
# 修改 package.json
{
  "scripts": {
    "dev:fast": "next dev --turbopack",
    "dev": "next dev",
    "build:fast": "next build --turbopack",
    "build": "next build"
  }
}
```

## 🎉 总结

**Turbopack 是 Next.js 15 的未来！**

- ✅ **开发体验极佳**：启动快 5-7 倍，热重载快 5-10 倍
- ✅ **资源占用少**：内存使用减少 30-50%
- ✅ **现代化技术栈**：基于 Rust 开发，性能卓越
- ✅ **官方推荐**：Next.js 15 默认集成

**对于你的 AI 搜索前端项目，强烈推荐使用 Turbopack！** 🚀

---

**💡 提示**: 如果遇到兼容性问题，随时可以切换回传统的 Webpack。
