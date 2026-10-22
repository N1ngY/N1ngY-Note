# N1ngYのNote

基于 **MkDocs + Material 主题** 二次开发的个人笔记本。

## 功能特性

- **中文全文搜索**：自定义分词分隔符，CJK 逐字切分
- **明暗主题切换**：克莱因蓝配色方案（自定义设计系统，见 `docs/stylesheets/extra.css`）
- **数学公式**：MathJax 3（pymdownx.arithmatex）
- **代码高亮与复制**：Pygments + 一键复制 + 代码注解
- **贡献热力图**：构建钩子从 git 历史自动生成，零依赖原生 JS 渲染（`hooks/hooks.py`）
- **评论系统**：giscus（基于 GitHub Discussions），按页面开启

## 目录结构

```
.
├── mkdocs.yml                # 站点配置（主题 / 插件 / 导航）
├── requirements.txt          # Python 依赖
├── docs/                     # 内容
│   ├── index.md              # 首页（个人信息展示页）
│   ├── cs/                   # Computer Science 分区
│   ├── ctf/                  # CTF 分区
│   ├── devops/               # Devops 分区
│   ├── life/                 # Life 分区
│   ├── heatmap.md            # 贡献热力图
│   ├── assets/               # logo / favicon / 头像
│   ├── stylesheets/extra.css # 克莱因蓝设计系统
│   └── javascripts/          # MathJax 配置 / 热力图渲染
├── hooks/hooks.py            # 构建钩子：git 历史 → 热力图数据
└── overrides/                # 主题覆盖
    └── partials/             # footer / comments / source-file 等
```

## 本地开发

```bash
pip install -r requirements.txt
mkdocs serve        # http://127.0.0.1:8000
```

## 写作

**新增文章**：在对应方向目录（如 `docs/ctf/web/`）下新建 `.md` 文件，并在 `mkdocs.yml` 的 `nav` 中登记到该方向下。

文章 frontmatter 模板：

```markdown
---
tags:
  - CTF
  - Web
date: 2026-10-22
comments: false
---

# 标题

正文……
```

**提交即发布**：`git commit` 后重新构建，贡献热力图自动刷新。

## 开启评论（giscus）

1. 将仓库公开，并启用 [GitHub Discussions](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository)；
2. 安装 [giscus App](https://github.com/apps/giscus)；
3. 到 [giscus.app](https://giscus.app/zh-CN) 获取 `repo` / `repo_id` / `category_id`，填入 `mkdocs.yml` 的 `extra.giscus`；
4. 在需要评论的页面 frontmatter 加 `comments: true`。

## 部署

```bash
mkdocs build          # 输出到 site/
mkdocs gh-deploy      # 一键发布到 GitHub Pages
```

也可使用任意静态托管（Vercel / Netlify / Cloudflare Pages），构建命令 `mkdocs build`，输出目录 `site`。
