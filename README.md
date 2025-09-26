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