/* 受注照会画面 [JYU030] */

(function () {
  Common.requireLogin();
  Common.renderSysInfo();

  function $(id) { return document.getElementById(id); }

  var currentResults = [];

  function search() {
    var from = $("date-from").value;
    var to = $("date-to").value;
    var cust = $("filter-customer-code").value.trim().toUpperCase();

    currentResults = DB.getAll().filter(function (o) {
      if (from && o.orderDate < from) return false;
      if (to && o.orderDate > to) return false;
      if (cust && o.customerCode !== cust) return false;
      return true;
    });

    render();
  }

  function render() {
    var tbody = $("orders-body");
    tbody.innerHTML = "";

    currentResults.forEach(function (o) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="center">' + o.orderNo + "</td>" +
        "<td class=\"center\">" + Common.fmtDate(o.orderDate) + "</td>" +
        '<td class="center">' + o.customerCode + "</td>" +
        "<td>" + o.customerName + "</td>" +
        "<td>" + (o.poNumber || "") + "</td>" +
        '<td class="center">' + Common.fmtDate(o.deliveryDate) + "</td>" +
        '<td class="num">' + Common.fmt(o.total) + "</td>" +
        '<td class="center"><a href="order-view.html?no=' + o.orderNo + '" id="link-' + o.orderNo + '">詳細</a></td>';
      tbody.appendChild(tr);
    });

    $("result-count").textContent = "（" + currentResults.length + "件）";
  }

  // ---------- CSV出力 (UTF-8 BOM付き / Excelで開ける) ----------
  function exportCsv() {
    var header = "受注番号,受注日,得意先コード,得意先名,注文書番号,納品希望日,小計,消費税,合計金額";
    var rows = currentResults.map(function (o) {
      return [
        o.orderNo, o.orderDate, o.customerCode, o.customerName,
        o.poNumber || "", o.deliveryDate || "", o.subtotal, o.tax, o.total
      ].map(function (v) {
        var s = String(v);
        return s.indexOf(",") >= 0 ? '"' + s + '"' : s;
      }).join(",");
    });
    var csv = "\uFEFF" + header + "\r\n" + rows.join("\r\n") + "\r\n";

    var blob = new Blob([csv], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "juchu_list.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  $("btn-search").addEventListener("click", search);
  $("btn-search-clear").addEventListener("click", function () {
    $("date-from").value = "";
    $("date-to").value = "";
    $("filter-customer-code").value = "";
    search();
  });
  $("btn-csv").addEventListener("click", exportCsv);
  $("btn-back").addEventListener("click", function () {
    location.href = "menu.html";
  });

  Common.enableEnterMove($("search-form"));
  Common.bindFKeys({ F3: "btn-back", F8: "btn-csv" });

  // 初期表示は全件
  search();
})();
