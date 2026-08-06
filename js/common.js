/* =====================================================
   共通処理 (セッション管理・ヘッダ表示・書式)
   ===================================================== */

var Common = (function () {

  var SESSION_KEY = "soms.user";

  function today() {
    var d = new Date();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function todayJp() {
    var d = new Date();
    return d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2);
  }

  return {
    // ログインセッション
    login: function (userId) {
      sessionStorage.setItem(SESSION_KEY, userId);
    },
    logout: function () {
      sessionStorage.removeItem(SESSION_KEY);
      location.href = "index.html";
    },
    currentUser: function () {
      return sessionStorage.getItem(SESSION_KEY);
    },
    // 未ログインならログイン画面へ戻す (各画面の先頭で呼ぶ)
    requireLogin: function () {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        location.href = "index.html";
      }
    },
    // タイトルバー右側のシステム情報を表示
    renderSysInfo: function () {
      var el = document.getElementById("sys-info");
      if (el) {
        var user = sessionStorage.getItem(SESSION_KEY) || "-";
        el.textContent = "ログイン: " + user + "　端末: TRM01　" + todayJp();
      }
    },
    today: today,
    // 数値を 3桁カンマ区切りにする
    fmt: function (n) {
      return Number(n).toLocaleString("ja-JP");
    },
    // "2026-08-06" -> "2026/08/06"
    fmtDate: function (s) {
      return s ? s.replace(/-/g, "/") : "";
    },
    // Enterキーで次の入力欄へフォーカス移動 (レガシー端末風の操作感)
    enableEnterMove: function (formEl) {
      var fields = Array.prototype.slice.call(
        formEl.querySelectorAll("input:not([readonly]):not([type=hidden]), select")
      );
      formEl.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        if (e.target.tagName === "BUTTON") return;
        e.preventDefault();
        var idx = fields.indexOf(e.target);
        if (idx >= 0 && idx < fields.length - 1) {
          e.target.blur();
          fields[idx + 1].focus();
        } else if (e.target.blur) {
          e.target.blur();
        }
      });
    },
    // ファンクションキーを画面下部のボタンに割り当てる
    // 例: Common.bindFKeys({ F9: "btn-submit", F3: "btn-back" })
    bindFKeys: function (map) {
      document.addEventListener("keydown", function (e) {
        var btnId = map[e.key];
        if (btnId) {
          var btn = document.getElementById(btnId);
          if (btn && !btn.disabled) {
            e.preventDefault();
            btn.click();
          }
        }
      });
    }
  };
})();
