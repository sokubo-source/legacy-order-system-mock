# legacy-order-system-mock

RPA の入力先ターゲット用「レガシー風基幹システム（販売管理 SOMS-21）」モック。

- **構成**: 静的 HTML/CSS/JS のみ（ビルド・サーバー不要）。データは localStorage。
- **起動**: `index.html` をブラウザで開く（demo / demo でログイン）。または GitHub Pages。
- **公開先**: github.com/sokubo-source/legacy-order-system-mock（public・GitHub Pages 有効）
- **画面**: ログイン(LGN001) → メニュー(MNU001) → 受注入力(JYU010)・受注照会(JYU030)・受注詳細(JYU031)
- **RPA向け**: 全入力要素に固定 id/name。要素ID一覧・シナリオ例は README.md 参照。
- **注意**: マスタは架空データ。実顧客名・実データを入れて公開しないこと（public リポジトリ）。
