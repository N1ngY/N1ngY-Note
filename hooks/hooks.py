"""构建期钩子：基于 git 历史自动生成「贡献热力图」数据

- on_pre_build 时读取当前仓库的 git log，生成 docs/javascripts/contrib-data.js：
  按「年份 → 月份 → 日期 → 提交次数」聚合，并附带统计信息。

没有 git 仓库时写入空数据，构建不会失败。
"""

import json
import os
import subprocess
from collections import Counter
from datetime import date, timedelta

DOCS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs")
CONTRIB_JS_PATH = os.path.join(DOCS_DIR, "javascripts", "contrib-data.js")


def _git_log():
    """返回 [(iso_date, short_hash, subject), ...]，按时间正序。"""
    try:
        out = subprocess.run(
            ["git", "log", "--date=short", "--pretty=format:%ad|%h|%s"],
            cwd=os.path.dirname(DOCS_DIR),
            capture_output=True, text=True, timeout=30,
        )
        if out.returncode != 0:
            return []
        entries = []
        for line in out.stdout.strip().splitlines():
            parts = line.split("|", 2)
            if len(parts) == 3 and len(parts[0]) == 10:
                entries.append((parts[0], parts[1], parts[2]))
        # git log 默认倒序，转为正序便于按时间处理
        entries.reverse()
        return entries
    except Exception:
        return []


def _safe_write(path, content):
    """写入生成文件；若因权限失败则尝试放权后重试，仍失败则跳过（不阻断构建）。"""
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
    except PermissionError:
        try:
            os.chmod(path, 0o666)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
        except OSError:
            print(f"[hooks] 警告：无法写入 {path}，已跳过")


def _streaks(iso_dates):
    """根据有提交的日期字符串集合计算 当前/最长 连续天数。"""
    if not iso_dates:
        return 0, 0
    day_set = set()
    for s in iso_dates:
        try:
            y, m, d = s.split("-")
            day_set.add(date(int(y), int(m), int(d)))
        except ValueError:
            continue
    if not day_set:
        return 0, 0
    longest = cur = 0
    for d in sorted(day_set):
        if d - timedelta(days=1) in day_set:
            cur += 1
        else:
            cur = 1
        longest = max(longest, cur)
    today = date.today()
    streak = 0
    cursor = today if today in day_set else today - timedelta(days=1)
    while cursor in day_set:
        streak += 1
        cursor -= timedelta(days=1)
    return streak, longest


def _write_contrib(entries):
    # 按 年份 -> 月份 -> 日期 -> 次数 聚合
    by_year = {}
    days = []
    for iso_date, _, _ in entries:
        try:
            y, m, d = iso_date.split("-")
        except ValueError:
            continue
        day = date(int(y), int(m), int(d))
        days.append(day)
        year_node = by_year.setdefault(y, {})
        month_node = year_node.setdefault(str(int(m)), {})
        month_node[d] = month_node.get(d, 0) + 1

    years = sorted(by_year.keys())
    counter = Counter(d.isoformat() for d in days)
    streak, longest = _streaks([d.isoformat() for d in days])

    payload = {
        "years": years,
        "by_year": by_year,
        "stats": {
            "total_commits": len(entries),
            "active_days": len(counter),
            "current_streak": streak,
            "longest_streak": longest,
        },
    }
    os.makedirs(os.path.dirname(CONTRIB_JS_PATH), exist_ok=True)
    _safe_write(
        CONTRIB_JS_PATH,
        "window.CONTRIB_DATA = " + json.dumps(payload, ensure_ascii=False) + ";\n",
    )


def on_pre_build(config, **kwargs):
    entries = _git_log()
    _write_contrib(entries)
    print(f"[hooks] 热力图数据已生成（{len(entries)} 条提交，{len(set(e[0] for e in entries))} 个活跃日）")
