# 無線局情報検索アプリ

## 技術仕様

### アーキテクチャ
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: Firebase Cloud Functions (Node.js)
- **ホスティング**: Firebase Hosting
- **API**: 総務省 無線局等情報検索 Web-API

### ファイル構成
```
/
├── index.html              # メインHTML
├── styles.css              # スタイルシート
├── cityCode.csv            # 市区町村コードデータ
├── js/
│   ├── config.js           # 設定・定数
│   ├── dom.js              # DOM操作
│   ├── utils.js            # ユーティリティ関数
│   ├── areaSearch.js       # 地域検索機能
│   ├── api.js              # API通信
│   ├── display.js          # 表示機能
│   └── main.js             # メインロジック
├── functions/
│   ├── index.js            # Cloud Functions
│   └── package.json        # 依存関係
└── ref/                    # API仕様書
    ├── mw_req_info.md
    ├── mw_req_conditions.md
    └── mw_code.md
```

### 検索機能
- **コールサイン検索**: 部分一致、最大12文字
- **免許人名称検索**: 社団局名での検索
- **地域検索**: 都道府県名・市区町村名・5桁コード対応

### API仕様
- **エンドポイント**: `/api/musen/search`
- **パラメータ**: 
  - `callsign`: コールサイン
  - `name`: 免許人名称
  - `area`: 地域コード
  - `stationType`: 無線局種別
- **レスポンス**: JSON形式

### デプロイ
```bash
firebase deploy
```

### 依存関係
- Bootstrap 5.3.0
- Firebase Functions
- node-fetch
### 市郡区番号の検索

コールサイン検索で得た無線設備の所在地から、JARLの現存する市番号（JCC）、郡番号（JCG）、政令指定都市の区番号を表示します。所在地が曖昧な場合は特定しません。移動運用では登録所在地と実際の運用場所が異なるため、参加するコンテストの規約と実際の運用場所を確認してください。

`contest-numbers.json` は2026年11月25日に取得した [JARL 市郡区番号リスト](https://www.jarl.org/Japanese/A_Shiryo/A-2_jcc-jcg/jcc.htm) と [区番号一覧](https://www.jarl.org/Japanese/A_Shiryo/A-2_jcc-jcg/ku-list.txt) の現存番号に基づき、既存 `JCC.csv` と `cityCode.csv` の名称を照合して作成しています。郡内の町村名は旧CSV由来のため、自治体合併や番号改定の際は公式情報とともに更新してください。都道府県名を含む所在地のみ照合し、データにない自治体や複数候補は特定しません。

照合テストは `node tests/area-search.test.cjs` で実行できます。
