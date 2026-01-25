# sagellm-website Copilot Instructions

## 仓库信息

| 字段         | 值                                           |
| ------------ | -------------------------------------------- |
| 仓库名       | sagellm-website                              |
| 可见性       | **Public** (公开仓库)                        |
| 主要职责     | sageLLM 公开展示网站 - 演示材料和营销页面   |

## 🎯 仓库定位

**这是 sageLLM 项目唯一的公开仓库**，用于：

1. **展示推理速度**：通过 asciinema 终端录屏展示实时推理
2. **营销材料**：功能特性、架构优势、使用场景
3. **快速入门**：CLI 命令示例、安装指南
4. **社区入口**：提供文档链接、GitHub 链接

**核心原则**：
- ✅ **仅包含演示材料** - 无源代码、无敏感信息
- ✅ **MIT 许可证** - 演示材料开源
- ✅ **独立部署** - 可通过 GitHub Pages 访问

## 📦 仓库结构

```
sagellm-website/
├── index.html              # 主页（渐变背景 + asciinema 播放器）
├── demos/                  # 终端录屏文件
│   └── sagellm-inference.cast
├── assets/                 # 图片、CSS、视频等
├── README.md               # 仓库说明
├── LICENSE                 # MIT 许可证
└── .gitignore
```

## 🚨 重要限制

### ❌ 禁止内容

1. **禁止** 包含任何源代码（Python/C++/CUDA）
2. **禁止** 包含配置文件（含敏感信息）
3. **禁止** 引用私有仓库链接
4. **禁止** 暴露内部架构细节

### ✅ 允许内容

1. **允许** asciinema 终端录屏（`.cast` 文件）
2. **允许** HTML/CSS/JavaScript（前端展示）
3. **允许** 功能特性描述（营销文案）
4. **允许** CLI 命令示例（公开命令）

## 🎬 演示录屏规范

### 录制要求

- 使用 `asciinema` 录制终端
- 分辨率：100 列 x 24 行
- 展示内容：
  - CLI 命令执行
  - 推理速度展示
  - 流式输出效果

### 文件命名

```
demos/
├── sagellm-inference.cast        # 推理演示
├── sagellm-quickstart.cast       # 快速入门
├── sagellm-api-gateway.cast      # API 网关演示
└── sagellm-multi-model.cast      # 多模型切换
```

### 播放器配置

```javascript
AsciinemaPlayer.create('demos/xxx.cast', element, {
    cols: 100,
    rows: 24,
    autoPlay: true,
    loop: true,
    idleTimeLimit: 2  // 跳过长时间空闲
});
```

## 🎨 设计规范

### 品牌色彩

- 主色调：渐变紫色 (#667eea → #764ba2)
- 强调色：白色文字 + 半透明背景
- 卡片背景：纯白色 (#fff)

### 响应式设计

- 移动端优先
- 网格布局：`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`
- 断点：适配手机、平板、桌面

## 📝 内容更新流程

### 添加新演示

1. 录制 `.cast` 文件（或使用脚本生成）
2. 放入 `demos/` 目录
3. 在 `index.html` 中添加播放器
4. 提交并推送到 GitHub

### 更新文案

- 直接编辑 `index.html`
- 保持专业、简洁的营销语言
- 突出国产算力适配（Huawei Ascend）

## 🚀 部署

### GitHub Pages

1. 在 GitHub 仓库 Settings → Pages
2. Source: `main` 分支，根目录
3. 访问: `https://<username>.github.io/sagellm-website/`

### 本地预览

```bash
# Python 简单服务器
python3 -m http.server 8000

# Node.js serve
npx serve .

# 访问 http://localhost:8000
```

## 🔗 关联仓库

| 仓库                    | 可见性  | 关系                     |
| ----------------------- | ------- | ------------------------ |
| `intellistream/sagellm` | Private | 核心引擎（不可引用链接） |
| `sagellm-website`       | Public  | 本仓库                   |

## 开发规范

- 纯静态网站（HTML/CSS/JS）
- 无需构建工具（直接部署）
- 使用 CDN 加载第三方库（asciinema-player）
- 保持轻量级（首页加载 < 1MB）

## 相关文档

- **主文档仓库**（私有）：sagellm-docs
- **asciinema**: https://asciinema.org/
- **GitHub Pages**: https://pages.github.com/

---

**维护者**: IntelliStream Team  
**许可证**: MIT License (仅限演示材料)
