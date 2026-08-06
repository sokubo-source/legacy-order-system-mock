/* 受注詳細画面 [JYU031] */

(function () {
  Common.requireLogin();
  Common.renderSysInfo();

  function $(id) { return document.getElementById(id); }

  var REP_NAMES = {
    "E01": "E01 営業一課 相田",
    "E02": "E02 営業一課 木下",
    "E03": "E03 営業二課 浜田"
  };

  var params = new URLSearchParams(location.search);
  var orderNo = params.get("no");
  var order = orderNo ? DB.get(orderNo) : null;

  if (!order) {
    var el = $("error-message");
    el.textContent = "★指定された受注番号「" + (orderNo || "") + "」は存在しません。(E301)";
    el.classList.remove("hidden");
  } else {
    $("view-order-no").value = order.orderNo;
    $("view-order-date").value = Common.fmtDate(order.orderDate);
    $("view-po-number").value = order.poNumber || "";
    $("view-customer-code").value = order.customerCode;
    $("view-customer-name").value = order.customerName;
    $("view-delivery-date").value = Common.fmtDate(order.deliveryDate);
    $("view-rep").value = REP_NAMES[order.repCode] || "";
    $("view-note").value = order.note || "";

    var tbody = $("view-detail-body");
    order.lines.forEach(function (line, idx) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="center">' + ("0" + (idx + 1)).slice(-2) + "</td>" +
        '<td class="center">' + line.itemCode + "</td>" +
        "<td>" + line.itemName + "</td>" +
        '<td class="num">' + Common.fmt(line.qty) + "</td>" +
        '<td class="center">' + line.unit + "</td>" +
        '<td class="num">' + Common.fmt(line.unitPrice) + "</td>" +
        '<td class="num">' + Common.fmt(line.amount) + "</td>";
      tbody.appendChild(tr);
    });

    $("view-subtotal").textContent = Common.fmt(order.subtotal);
    $("view-tax").textContent = Common.fmt(order.tax);
    $("view-total").textContent = Common.fmt(order.total);
  }

  $("btn-back").addEventListener("click", function () {
    location.href = "orders.html";
  });

  Common.bindFKeys({ F3: "btn-back" });
})();
