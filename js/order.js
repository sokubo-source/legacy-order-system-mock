/* 受注入力画面 [JYU010] */

(function () {
  var LINE_COUNT = 10; // 明細行数
  var TAX_RATE = 0.10;

  Common.requireLogin();
  Common.renderSysInfo();

  // ---------- 明細行の生成 ----------
  var tbody = document.getElementById("detail-body");
  for (var i = 1; i <= LINE_COUNT; i++) {
    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td class="center">' + ("0" + i).slice(-2) + "</td>" +
      '<td><input type="text" id="item-code-' + i + '" name="item-code-' + i + '" size="8" maxlength="6" autocomplete="off"></td>' +
      '<td><input type="text" id="item-name-' + i + '" name="item-name-' + i + '" size="34" readonly tabindex="-1"></td>' +
      '<td><input type="text" id="qty-' + i + '" name="qty-' + i + '" size="6" maxlength="6" class="num" autocomplete="off"></td>' +
      '<td><input type="text" id="unit-' + i + '" name="unit-' + i + '" size="3" readonly tabindex="-1"></td>' +
      '<td><input type="text" id="unit-price-' + i + '" name="unit-price-' + i + '" size="9" maxlength="9" class="num" autocomplete="off"></td>' +
      '<td><input type="text" id="amount-' + i + '" name="amount-' + i + '" size="11" class="num" readonly tabindex="-1"></td>';
    tbody.appendChild(tr);
  }

  function $(id) { return document.getElementById(id); }

  // ---------- 初期値 ----------
  $("order-date").value = Common.today();

  // ---------- メッセージ ----------
  function showErrors(msgs) {
    var el = $("error-message");
    el.innerHTML = msgs.map(function (m) { return "★" + m; }).join("<br>");
    el.classList.remove("hidden");
    $("complete-message").classList.add("hidden");
  }

  function clearMessages() {
    $("error-message").classList.add("hidden");
    $("complete-message").classList.add("hidden");
  }

  // ---------- 得意先コード → 得意先名 ----------
  $("customer-code").addEventListener("blur", function () {
    var code = this.value.trim().toUpperCase();
    this.value = code;
    if (code === "") {
      $("customer-name").value = "";
      return;
    }
    var c = CUSTOMER_MASTER[code];
    $("customer-name").value = c ? c.name : "＊該当なし＊";
  });

  // ---------- 明細行: 商品コード → 商品名・単位・単価 ----------
  function bindLine(i) {
    $("item-code-" + i).addEventListener("blur", function () {
      var code = this.value.trim().toUpperCase();
      this.value = code;
      if (code === "") {
        $("item-name-" + i).value = "";
        $("unit-" + i).value = "";
        $("unit-price-" + i).value = "";
        $("amount-" + i).value = "";
        recalc();
        return;
      }
      var item = ITEM_MASTER[code];
      if (item) {
        $("item-name-" + i).value = item.name;
        $("unit-" + i).value = item.unit;
        $("unit-price-" + i).value = item.price;
        if ($("qty-" + i).value.trim() === "") {
          $("qty-" + i).value = "1";
        }
      } else {
        $("item-name-" + i).value = "＊該当なし＊";
        $("unit-" + i).value = "";
        $("unit-price-" + i).value = "";
      }
      recalc();
    });
    $("qty-" + i).addEventListener("blur", recalc);
    $("unit-price-" + i).addEventListener("blur", recalc);
  }
  for (var j = 1; j <= LINE_COUNT; j++) bindLine(j);

  // ---------- 金額計算 ----------
  function lineAmount(i) {
    var qty = parseInt($("qty-" + i).value.replace(/,/g, ""), 10);
    var price = parseInt($("unit-price-" + i).value.replace(/,/g, ""), 10);
    if (isNaN(qty) || isNaN(price)) return null;
    return qty * price;
  }

  function recalc() {
    var subtotal = 0;
    for (var i = 1; i <= LINE_COUNT; i++) {
      var amt = lineAmount(i);
      $("amount-" + i).value = amt === null ? "" : Common.fmt(amt);
      if (amt !== null) subtotal += amt;
    }
    var tax = Math.floor(subtotal * TAX_RATE);
    $("subtotal").textContent = Common.fmt(subtotal);
    $("tax").textContent = Common.fmt(tax);
    $("total").textContent = Common.fmt(subtotal + tax);
  }

  // ---------- 入力チェック ----------
  function validate() {
    var errors = [];

    if ($("order-date").value === "") {
      errors.push("受注日が未入力です。(E101)");
    }

    var custCode = $("customer-code").value.trim();
    if (custCode === "") {
      errors.push("得意先コードが未入力です。(E102)");
    } else if (!CUSTOMER_MASTER[custCode]) {
      errors.push("得意先コード「" + custCode + "」はマスタに存在しません。(E103)");
    }

    var lineExists = false;
    for (var i = 1; i <= LINE_COUNT; i++) {
      var code = $("item-code-" + i).value.trim();
      if (code === "") continue;
      lineExists = true;
      if (!ITEM_MASTER[code]) {
        errors.push("明細" + ("0" + i).slice(-2) + "行目：商品コード「" + code + "」はマスタに存在しません。(E201)");
        continue;
      }
      var qty = parseInt($("qty-" + i).value.replace(/,/g, ""), 10);
      if (isNaN(qty) || qty <= 0) {
        errors.push("明細" + ("0" + i).slice(-2) + "行目：数量は1以上の数値を入力してください。(E202)");
      }
      var price = parseInt($("unit-price-" + i).value.replace(/,/g, ""), 10);
      if (isNaN(price) || price < 0) {
        errors.push("明細" + ("0" + i).slice(-2) + "行目：単価は0以上の数値を入力してください。(E203)");
      }
    }
    if (!lineExists) {
      errors.push("明細が1行も入力されていません。(E200)");
    }

    return errors;
  }

  // ---------- 登録 ----------
  $("btn-submit").addEventListener("click", function () {
    clearMessages();
    recalc();

    var errors = validate();
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }

    var lines = [];
    var subtotal = 0;
    for (var i = 1; i <= LINE_COUNT; i++) {
      var code = $("item-code-" + i).value.trim();
      if (code === "") continue;
      var qty = parseInt($("qty-" + i).value.replace(/,/g, ""), 10);
      var price = parseInt($("unit-price-" + i).value.replace(/,/g, ""), 10);
      var amount = qty * price;
      subtotal += amount;
      lines.push({
        itemCode: code,
        itemName: ITEM_MASTER[code].name,
        qty: qty,
        unit: ITEM_MASTER[code].unit,
        unitPrice: price,
        amount: amount
      });
    }
    var tax = Math.floor(subtotal * TAX_RATE);

    var custCode = $("customer-code").value.trim();
    var orderNo = DB.insert({
      orderDate: $("order-date").value,
      customerCode: custCode,
      customerName: CUSTOMER_MASTER[custCode].name,
      poNumber: $("po-number").value.trim(),
      deliveryDate: $("delivery-date").value,
      repCode: $("rep-code").value,
      note: $("note").value.trim(),
      lines: lines,
      subtotal: subtotal,
      tax: tax,
      total: subtotal + tax
    });

    clearForm();
    $("registered-order-no").textContent = orderNo;
    $("complete-message").classList.remove("hidden");
    $("customer-code").focus();
  });

  // ---------- クリア・戻る ----------
  function clearForm() {
    $("order-form").reset();
    $("order-date").value = Common.today();
    for (var i = 1; i <= LINE_COUNT; i++) {
      $("item-name-" + i).value = "";
      $("unit-" + i).value = "";
      $("amount-" + i).value = "";
    }
    recalc();
  }

  $("btn-clear").addEventListener("click", function () {
    clearMessages();
    clearForm();
    $("customer-code").focus();
  });

  $("btn-back").addEventListener("click", function () {
    location.href = "menu.html";
  });

  Common.enableEnterMove($("order-form"));
  Common.bindFKeys({ F3: "btn-back", F5: "btn-clear", F9: "btn-submit" });

  $("customer-code").focus();
})();
