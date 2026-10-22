/* =============================================================
   卡片跟随鼠标 3D 倾斜（上下 / 左右，有界）+ 闪耀光斑
   - 作用于个人信息卡片以及所有友链卡片。
   - 使用 requestAnimationFrame 做插值（lerp），让反转更丝滑。
   - rotateX / rotateY 均有最大角度限制，不做无限制旋转。
   ============================================================= */
(function () {
  "use strict";

  function bind(card) {
    var maxAngle = 20; // 最大倾斜角度（度）

    var target = { rx: 0, ry: 0, mx: 50, my: 50 };
    var current = { rx: 0, ry: 0, mx: 50, my: 50 };
    var rafId = null;

    card.addEventListener("mousemove", function (ev) {
      var rect = card.getBoundingClientRect();
      var x = (ev.clientX - rect.left) / rect.width;   // 0..1
      var y = (ev.clientY - rect.top) / rect.height;   // 0..1
      var mx = x * 2 - 1; // -1..1
      var my = y * 2 - 1; // -1..1

      target.rx = -my * maxAngle;
      target.ry = mx * maxAngle;
      target.mx = x * 100;
      target.my = y * 100;

      start();
    });

    card.addEventListener("mouseleave", function () {
      target.rx = 0;
      target.ry = 0;
      start();
    });

    // 点击卡片空白处切换翻转；点击链接/按钮/QQ 时不翻转
    card.addEventListener("click", function (ev) {
      if (ev.target.closest("a, button, input, .qq-chip")) return;
      card.classList.toggle("is-flipped");
    });

    function start() {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function tick() {
      var lerp = 0.16; // 越小越丝滑（收敛越慢）
      current.rx += (target.rx - current.rx) * lerp;
      current.ry += (target.ry - current.ry) * lerp;
      current.mx += (target.mx - current.mx) * lerp;
      current.my += (target.my - current.my) * lerp;

      card.style.setProperty("--rx", current.rx.toFixed(2) + "deg");
      card.style.setProperty("--ry", current.ry.toFixed(2) + "deg");
      card.style.setProperty("--mx", current.mx.toFixed(2) + "%");
      card.style.setProperty("--my", current.my.toFixed(2) + "%");

      var done =
        Math.abs(target.rx - current.rx) < 0.01 &&
        Math.abs(target.ry - current.ry) < 0.01 &&
        Math.abs(target.mx - current.mx) < 0.05 &&
        Math.abs(target.my - current.my) < 0.05;

      if (done) {
        rafId = null;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }
  }

  function init() {
    document.querySelectorAll(".profile-right, .friend-card").forEach(bind);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
