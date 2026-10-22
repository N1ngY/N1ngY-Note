/* =============================================================
   受保护文章访问校验（Popconfirm 气泡确认框）
   - 页面通过 <meta name="page-password"> 携带 SHA-256 密码哈希。
   - 输入密码 -> WebCrypto 计算 SHA-256 -> 与哈希比对。
   - 校验成功后解除正文锁定；每次进入受保护文章都重新要求输入密码。
   ============================================================= */
(function () {
  "use strict";

  function run() {
    var meta = document.querySelector('meta[name="page-password"]');
    if (!meta) return;

    var expected = (meta.getAttribute("content") || "").trim();
    if (!expected) return;

    var pop = buildPopconfirm();
    var host = document.querySelector(".md-content") || document.body;
    host.insertBefore(pop, host.firstChild);

    var input = pop.querySelector(".md-protected-input");
    var form = pop.querySelector(".md-protected-form");
    var error = pop.querySelector(".md-protected-error");
    var submit = pop.querySelector(".md-protected-submit");
    var cancel = pop.querySelector(".md-protected-cancel");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      submit.disabled = true;
      error.textContent = "";
      error.hidden = true;

      var value = input.value;
      sha256(value).then(function (hex) {
        submit.disabled = false;
        if (hex === expected) {
          pop.remove();
          unlock();
        } else {
          error.textContent = "密码错误，请重试";
          error.hidden = false;
          input.value = "";
          input.focus();
        }
      }).catch(function () {
        submit.disabled = false;
        error.textContent = "校验失败，请重试";
        error.hidden = false;
      });
    });

    cancel.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "./";
      }
    });

    input.focus();
  }

  function unlock() {
    document.documentElement.classList.remove("md-protected-locked");
  }

  function buildPopconfirm() {
    var pop = document.createElement("div");
    pop.className = "md-protected-popconfirm";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", "访问密码确认");
    pop.innerHTML =
      '<div class="md-protected-icon">' +
      '  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '    <path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 0 1 6 0v3H9Zm3 4a2 2 0 0 1 1 3.73V18a1 1 0 0 1-2 0v-1.27A2 2 0 0 1 12 13Z"/>' +
      '  </svg>' +
      '</div>' +
      '<div class="md-protected-body">' +
      '  <div class="md-protected-title">⚠警告⚠</div>' +
      '  <div class="md-protected-desc">妄想窥探主人的秘密，必须上交足够的token喵~</div>' +
      '  <form class="md-protected-form">' +
      '    <input class="md-protected-input" type="password" autocomplete="current-password" placeholder="eng?eng!eng~" required>' +
      '    <div class="md-protected-error" hidden></div>' +
      '    <div class="md-protected-actions">' +
      '      <button class="md-protected-cancel" type="button">逃走</button>' +
      '      <button class="md-protected-submit" type="submit">上交</button>' +
      '    </div>' +
      '  </form>' +
      '</div>';
    return pop;
  }

  function sha256(text) {
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      var data = new TextEncoder().encode(text);
      return crypto.subtle.digest("SHA-256", data).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      });
    }
    // 不支持 WebCrypto 时退化为同步的简单哈希（仅兜底）
    return Promise.resolve(fallbackHash(text));
  }

  function fallbackHash(text) {
    var hash = 5381;
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) + hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    return ("00000000" + (hash >>> 0).toString(16)).slice(-8);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
