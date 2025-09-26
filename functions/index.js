const functions = require('firebase-functions');
const cors = require('cors');
const fetch = require('node-fetch');

// CORS設定
const corsHandler = cors({
    origin: true,
    credentials: true
});

// レート制限用の変数
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1秒間隔

// APIプロキシ関数
exports.api = functions.https.onRequest((req, res) => {
    // CORS処理
    corsHandler(req, res, async () => {
        try {
            // パスが /api/musen/search でない場合は404
            if (req.path !== '/api/musen/search') {
                return res.status(404).json({ error: 'Not Found' });
            }

            const callsign = req.query.callsign;
            const name = req.query.name;
            const area = req.query.area;
            const stationType = req.query.stationType || 'AT'; // デフォルトはアマチュア局

            // 検索パラメータの検証
            if (!callsign && !name && !area) {
                return res.status(400).json({ error: '検索パラメータが必要です。' });
            }

            // 総務省APIへのパラメータ構築
            const params = new URLSearchParams({
                ST: '1',    // 免許情報検索
                OF: '2',    // JSON形式
                DA: '1',    // 詳細情報付加
                OW: stationType,   // 無線局種別（選択された値）
                DC: '1',    // 取得件数100件
                SK: '2',    // 並べ替えキー（2: 局名）
                SC: '1'     // スタートカウント（1件目から開始）
            });

            // 検索パラメータの設定
            if (callsign) {
                params.append('MA', callsign); // 呼出符号
            } else if (name) {
                params.append('NA', name); // 局名
            } else if (area) {
                // 地方公共団体コードをそのまま使用
                params.append('HCV', area); // 都道府県/市区町村
            }

            const apiUrl = `https://www.tele.soumu.go.jp/musen/list?${params.toString()}`;

            // レート制限チェック
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime;
            if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
                const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
                console.log(`Rate limiting: waiting ${waitTime}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            lastRequestTime = Date.now();

            console.log(`API Request: ${apiUrl}`);

            // 総務省APIへのリクエスト
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Referer': 'https://www.tele.soumu.go.jp/',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                }
            });

            if (!response.ok) {
                console.error(`API Error: ${response.status} ${response.statusText}`);
                console.error('Response headers:', Object.fromEntries(response.headers.entries()));

                // レスポンスボディを取得してエラー詳細を確認
                const errorText = await response.text();
                console.error('Response body:', errorText);

                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API Response received successfully');
            console.log('Response structure:', JSON.stringify(data, null, 2));

            // レスポンスをそのまま返す
            res.json(data);

        } catch (error) {
            console.error('Cloud Function Error:', error);

            // エラーレスポンス
            res.status(500).json({
                error: 'プロキシサーバーエラーが発生しました。',
                details: error.message
            });
        }
    });
});
