/* ログイン画面 [LGN001] */

(function () {
  var DEMO_USER = "demo";
  var DEMO_PASS = "demo";

  Common.renderSysInfo();

  function showError(msg) {
    var el = document.getElementById("error-message");
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function clearError() {
    var el = document.getElementById("error-message");
    el.textContent = "";
    el.classList.add("hidden");
  }

  document.getElementById("btn-login").addEventListener("click", function () {
    clearError();
    var userId = document.getElementById("user-id").value.trim();
    var password = document.getElementById("password").value;

    if (userId === "") {
      showError("★ユーザーＩＤが未入力です。(E001)");
      document.getElementById("user-id").focus();
      return;
    }
    if (password === "") {
      showError("★パスワードが未入力です。(E002)");
      document.getElementById("password").focus();
      return;
    }
    if (userId !== DEMO_USER || password !== DEMO_PASS) {
      showError("★ユーザーＩＤまたはパスワードが誤っています。(E003)");
      document.getElementById("password").value = "";
      document.getElementById("user-id").focus();
      return;
    }

    Common.login(userId);
    location.href = "menu.html";
  });

  document.getElementById("btn-clear").addEventListener("click", function () {
    clearError();
    document.getElementById("user-id").value = "";
    document.getElementById("password").value = "";
    document.getElementById("user-id").focus();
  });

  Common.enableEnterMove(document.getElementById("login-form"));

  // パスワード欄で Enter → ログイン実行 (enableEnterMove より先に判定)
  document.getElementById("password").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("btn-login").click();
    }
  });
})();
