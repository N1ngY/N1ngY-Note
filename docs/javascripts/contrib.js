// 贡献热力图：读取 hooks 生成的 window.CONTRIB_DATA，渲染 GitHub 风格周历
(function () {
  function level(count) {
    if (!count) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }

  function render() {
    var host = document.getElementById("contrib-heatmap");
    if (!host || !window.CONTRIB_DATA) return;

    var data = window.CONTRIB_DATA;
    var counts = data.counts || {};
    var stats = data.stats || {};

    // ---- 统计 ----
    var statsHost = document.getElementById("contrib-stats");
    if (statsHost) {
      var items = [
        [stats.total_commits || 0, "总提交"],
        [stats.active_days || 0, "活跃天数"],
        [stats.current_streak || 0, "当前连续"],
        [stats.longest_streak || 0, "最长连续"]
      ];
      statsHost.innerHTML = items
        .map(function (kv) {
          return (
            '<div class="contrib-stat"><div class="num">' +
            kv[0] +
            '</div><div class="label">' +
            kv[1] +
            "</div></div>"
          );
        })
        .join("");
    }

    // ---- 日历网格 ----
    var start = new Date(data.start + "T00:00:00");
    var end = new Date(data.end + "T00:00:00");

    // 对齐到周日开头
    var cursor = new Date(start);
    cursor.setDate(cursor.getDate() - cursor.getDay());

    var graph = document.createElement("div");
    graph.className = "contrib-graph";

    var monthRow = document.createElement("div");
    monthRow.className = "contrib-months";

    var lastMonth = -1;
    var today = new Date();
    today.setHours(23, 59, 59, 999);

    while (cursor <= end) {
      var week = document.createElement("div");
      week.className = "contrib-week";

      var firstDay = new Date(cursor);
      var label = document.createElement("span");
      if (firstDay.getMonth() !== lastMonth) {
        label.textContent = (firstDay.getMonth() + 1) + "月";
        lastMonth = firstDay.getMonth();
      } else {
        label.textContent = "";
      }
      // 宽度与一列对齐（11px + 3px gap）
      label.style.width = "14px";
      monthRow.appendChild(label);

      for (var i = 0; i < 7; i++) {
        var cell = document.createElement("div");
        cell.className = "contrib-day";
        if (cursor > end || cursor > today) {
          cell.setAttribute("data-future", "");
        } else {
          var key = cursor.toISOString().slice(0, 10);
          var c = counts[key] || 0;
          cell.setAttribute("data-level", level(c));
          cell.title = key + "：" + c + " 次提交";
        }
        week.appendChild(cell);
        cursor.setDate(cursor.getDate() + 1);
      }
      graph.appendChild(week);
    }

    host.innerHTML = "";
    host.appendChild(monthRow);
    host.appendChild(graph);

    // ---- 图例 ----
    var legend = document.createElement("div");
    legend.className = "contrib-legend";
    legend.innerHTML =
      "少 " +
      [0, 1, 2, 3, 4]
        .map(function (l) {
          return '<div class="contrib-day" data-level="' + l + '"></div>';
        })
        .join("") +
      " 多";
    host.appendChild(legend);
  }

  // MkDocs Material 的即时加载（instant navigation）下也要重渲染
  if (typeof document$ !== "undefined") {
    document$.subscribe(render);
  } else {
    document.addEventListener("DOMContentLoaded", render);
  }
})();
