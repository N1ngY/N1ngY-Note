// 贡献热力图
(function () {
  // 0次 | 1次 | 2-5次 | 6-10次 | 11-20次 | 20次以上
  function level(count) {
    if (!count) return 0;
    if (count === 1) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    if (count <= 20) return 4;
    return 5;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function iso(y, m, d) {
    return y + "-" + pad(m) + "-" + pad(d);
  }

  // monthMap 结构：{ 月份: { 日期: 次数 } }
  function countFor(monthMap, m, d) {
    return (monthMap && monthMap[m] && monthMap[m][d]) || 0;
  }

  function yearTotal(monthMap) {
    var total = 0;
    Object.keys(monthMap || {}).forEach(function (m) {
      Object.keys(monthMap[m]).forEach(function (d) {
        total += monthMap[m][d];
      });
    });
    return total;
  }

  function renderStats(stats) {
    var host = document.getElementById("contrib-stats");
    if (!host) return;
    var items = [
      [stats.total_commits || 0, "总提交"],
      [stats.active_days || 0, "活跃天数"],
      [stats.current_streak || 0, "当前连续"],
      [stats.longest_streak || 0, "最长连续"]
    ];
    host.innerHTML = items
      .map(function (kv) {
        var extraClass = kv[2] ? " " + kv[2] : "";
        return (
          '<div class="contrib-stat' + extraClass + '"><div class="num">' +
          kv[0] +
          '</div><div class="label">' +
          kv[1] +
          "</div></div>"
        );
      })
      .join("");
  }

  // 单张年份表：完整 1月1日～12月31日，40 列自动换行，可折叠
  function buildYearTable(year, monthMap, open) {
    var y = parseInt(year, 10);
    var isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    var daysInYear = isLeap ? 366 : 365;

    var details = document.createElement("details");
    details.className = "contrib-year";
    if (open) details.setAttribute("open", "");

    var summary = document.createElement("summary");
    summary.className = "contrib-year__summary";
    var yearSpan = document.createElement("span");
    yearSpan.textContent = year + " 年";
    var countSpan = document.createElement("span");
    countSpan.className = "contrib-year__count";
    //countSpan.textContent = yearTotal(monthMap) + " 次提交";
    summary.appendChild(yearSpan);
    summary.appendChild(countSpan);
    details.appendChild(summary);

    var table = document.createElement("div");
    table.className = "contrib-long";

    var d = new Date(y, 0, 1); // 1月1日
    for (var n = 0; n < daysInYear; n++) {
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "contrib-day";

      var m = d.getMonth() + 1;
      var day = d.getDate();
      var key = iso(y, m, day);
      var count = countFor(monthMap, String(m), String(day));

      cell.setAttribute("data-level", level(count));
      cell.setAttribute("data-date", key);
      cell.setAttribute("data-count", String(count));
      cell.setAttribute("aria-label", key + "：" + count + " 次提交");
      cell.title = key + "：" + count + " 次提交";

      table.appendChild(cell);
      d.setDate(d.getDate() + 1);
    }

    details.appendChild(table);
    return details;
  }

  function render() {
    var host = document.getElementById("contrib-heatmap");
    if (!host || !window.CONTRIB_DATA) return;

    var data = window.CONTRIB_DATA;
    var byYear = data.by_year || {};
    // 年份倒序：最新年在上
    var years = (data.years || Object.keys(byYear)).sort().reverse();
    var currentYear = String(new Date().getFullYear());

    renderStats(data.stats || {});

    host.innerHTML = "";
    if (years.length === 0) {
      var empty = document.createElement("p");
      empty.className = "contrib-empty";
      empty.textContent = "暂无提交数据。";
      host.appendChild(empty);
    } else {
      years.forEach(function (y) {
        // 当前年份默认展开，过去年份默认折叠
        host.appendChild(buildYearTable(y, byYear[y] || {}, y === currentYear));
      });
    }

    // 图例（每个色块对应一个标准范围，点击显示范围）
    var ranges = [
      "0 次",
      "1 次",
      "2–5 次",
      "6–10 次",
      "11–20 次",
      "20 次以上"
    ];
    var legend = document.createElement("div");
    legend.className = "contrib-legend";
    var before = document.createElement("span");
    before.textContent = "少";
    legend.appendChild(before);
    [0, 1, 2, 3, 4, 5].forEach(function (l) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "contrib-legend__item";
      item.setAttribute("data-level", l);
      item.setAttribute("data-range", ranges[l]);
      item.title = ranges[l];
      item.setAttribute("aria-label", ranges[l]);
      legend.appendChild(item);
    });
    var after = document.createElement("span");
    after.textContent = "多";
    legend.appendChild(after);
    host.appendChild(legend);
  }

  function showTip(anchor, text) {
    var existing = document.querySelector(".contrib-tooltip");
    if (existing) existing.remove();

    var tip = document.createElement("div");
    tip.className = "contrib-tooltip";
    tip.textContent = text;

    var rect = anchor.getBoundingClientRect();
    tip.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
    tip.style.top = rect.top + window.scrollY - 8 + "px";
    document.body.appendChild(tip);

    setTimeout(function () {
      tip.remove();
    }, 1600);
  }

  function bindClicks() {
    var host = document.getElementById("contrib-heatmap");
    if (!host || host.dataset.bound) return;
    host.dataset.bound = "1";

    host.addEventListener("click", function (e) {
      var cell = e.target.closest ? e.target.closest(".contrib-day") : null;
      if (cell && cell.getAttribute("data-date")) {
        showTip(
          cell,
          cell.getAttribute("data-date") + "：" +
            cell.getAttribute("data-count") + " 次提交"
        );
        return;
      }

      var legendItem = e.target.closest
        ? e.target.closest(".contrib-legend__item")
        : null;
      if (legendItem) {
        showTip(legendItem, legendItem.getAttribute("data-range"));
      }
    });
  }

  // 鼠标起伏波纹：以鼠标中心为圆心，格子按距离产生起伏，随鼠标滑动
  function bindWave() {
    var host = document.getElementById("contrib-heatmap");
    if (!host || host.dataset.waveBound) return;
    host.dataset.waveBound = "1";

    var cells = [];
    var radius = 120;      // 波纹半径（px）
    var amplitude = 16;    // 最大抬升高度（px）
    var scaleMax = 0.40;   // 最大放大比例
    var mouseX = -9999;
    var mouseY = -9999;
    var raf = null;
    var measuring = false;

    function collectCells() {
      cells = Array.prototype.slice.call(
        host.querySelectorAll(".contrib-day")
      );
    }

    function isVisible(el) {
      return el.offsetParent !== null;
    }

    function measure() {
      if (measuring) return;
      measuring = true;
      var hostRect = host.getBoundingClientRect();
      cells.forEach(function (cell) {
        if (!isVisible(cell)) {
          cell._cx = -99999;
          cell._cy = -99999;
          return;
        }
        var r = cell.getBoundingClientRect();
        cell._cx = r.left - hostRect.left + r.width / 2;
        cell._cy = r.top - hostRect.top + r.height / 2;
      });
      measuring = false;
    }

    function tick() {
      raf = null;
      var scrollLeft = host.scrollLeft;
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var dx = cell._cx - mouseX - scrollLeft;
        var dy = cell._cy - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var t = Math.max(0, 1 - dist / radius);
        var amount = t * t; // 二次衰减，更自然

        if (amount <= 0.0001) {
          cell.style.transform = "";
        } else {
          var lift = -amount * amplitude;
          var scale = 1 + amount * scaleMax;
          cell.style.transform =
            "translateY(" + lift + "px) scale(" + scale + ")";
        }
      }
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    host.addEventListener("mousemove", function (e) {
      var r = host.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      schedule();
    });

    host.addEventListener("mouseenter", function () {
      measure();
      schedule();
    });

    host.addEventListener("mouseleave", function () {
      mouseX = -9999;
      mouseY = -9999;
      schedule();
    });

    // 折叠/展开年份后重新测量可见格子坐标
    host.addEventListener("toggle", function (e) {
      if (e.target && e.target.tagName === "DETAILS") {
        collectCells();
        measure();
      }
    }, true);

    window.addEventListener("resize", function () {
      measure();
    });

    collectCells();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      render();
      bindClicks();
      bindWave();
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      render();
      bindClicks();
      bindWave();
    });
  }
})();
