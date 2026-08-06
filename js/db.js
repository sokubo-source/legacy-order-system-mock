/* =====================================================
   疑似データベース (localStorage)
   キー:
     soms.orders : 受注データの配列 (JSON)
     soms.seq    : 受注番号の採番カウンタ
   ===================================================== */

var DB = (function () {
  var ORDERS_KEY = "soms.orders";
  var SEQ_KEY = "soms.seq";

  // 初期データ (デモ用の登録済み受注)
  var SEED_ORDERS = [
    {
      orderNo: "JU000001", orderDate: "2026-07-28", customerCode: "C001",
      customerName: "大空電設株式会社", poNumber: "OD-20260728-01",
      deliveryDate: "2026-08-05", repCode: "E01", note: "",
      lines: [
        { itemCode: "P-1001", itemName: "LEDシーリングライト 8畳用", qty: 10, unit: "台", unitPrice: 12800, amount: 128000 },
        { itemCode: "P-3001", itemName: "埋込スイッチ 片切", qty: 50, unit: "個", unitPrice: 320, amount: 16000 }
      ],
      subtotal: 144000, tax: 14400, total: 158400
    },
    {
      orderNo: "JU000002", orderDate: "2026-07-30", customerCode: "C003",
      customerName: "みどり産業株式会社", poNumber: "M-1152",
      deliveryDate: "2026-08-10", repCode: "E02", note: "午前着指定",
      lines: [
        { itemCode: "P-2001", itemName: "VVFケーブル 2.0mm×3芯 100m巻", qty: 5, unit: "巻", unitPrice: 9800, amount: 49000 }
      ],
      subtotal: 49000, tax: 4900, total: 53900
    },
    {
      orderNo: "JU000003", orderDate: "2026-08-01", customerCode: "C002",
      customerName: "青葉金属工業株式会社", poNumber: "AK-0088",
      deliveryDate: "2026-08-12", repCode: "E01", note: "",
      lines: [
        { itemCode: "P-4001", itemName: "分電盤 主幹50A 分岐12回路", qty: 2, unit: "面", unitPrice: 34500, amount: 69000 },
        { itemCode: "P-9001", itemName: "配送料", qty: 1, unit: "式", unitPrice: 1500, amount: 1500 }
      ],
      subtotal: 70500, tax: 7050, total: 77550
    }
  ];

  function load() {
    var json = localStorage.getItem(ORDERS_KEY);
    if (json === null) {
      seed();
      json = localStorage.getItem(ORDERS_KEY);
    }
    try {
      return JSON.parse(json);
    } catch (e) {
      return [];
    }
  }

  function save(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function seed() {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
    localStorage.setItem(SEQ_KEY, String(SEED_ORDERS.length));
  }

  function nextOrderNo() {
    var seq = parseInt(localStorage.getItem(SEQ_KEY) || "0", 10) + 1;
    localStorage.setItem(SEQ_KEY, String(seq));
    return "JU" + ("000000" + seq).slice(-6);
  }

  return {
    // 全受注を取得 (受注番号の降順)
    getAll: function () {
      return load().sort(function (a, b) {
        return a.orderNo < b.orderNo ? 1 : -1;
      });
    },
    // 受注番号で1件取得
    get: function (orderNo) {
      var hit = load().filter(function (o) { return o.orderNo === orderNo; });
      return hit.length > 0 ? hit[0] : null;
    },
    // 受注を登録し、採番した受注番号を返す
    insert: function (order) {
      var orders = load();
      order.orderNo = nextOrderNo();
      orders.push(order);
      save(orders);
      return order.orderNo;
    },
    // データを初期状態に戻す (RPAテストのやり直し用)
    reset: function () {
      seed();
    }
  };
})();
