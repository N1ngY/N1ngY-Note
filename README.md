# N1ngYのNote

基于 **MkDocs + Material** 的个人笔记本，克莱因蓝主题。

## 本地开发

```bash
pip install -r requirements.txt
mkdocs serve        # http://127.0.0.1:8000
```

## 写作

在 `docs/` 对应分区方向目录下新建 `.md` 文件，并在 `mkdocs.yml` 的 `nav` 中登记。

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

### 文章访问保护

在文章 frontmatter 中标注 `password` 即为受保护文章，访问前会弹出密码确认框；不写 `password` 即为公开文章。

```markdown
---
password: "your-secret"
---

# 标题

正文……
```

- 构建时会把密码转换成 SHA-256 哈希，不把明文写入生成页面。
- 每次进入受保护文章都会重新要求输入密码。
- 首页的「News」链接会自动指向最新一篇文章（按 git 最后修改时间）。

## 部署

```bash
mkdocs build          # 输出到 site/
mkdocs gh-deploy      # 发布到 GitHub Pages
```
