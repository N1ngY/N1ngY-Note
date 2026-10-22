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

## 部署

```bash
mkdocs build          # 输出到 site/
mkdocs gh-deploy      # 发布到 GitHub Pages
```
