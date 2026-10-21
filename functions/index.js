const functions = require('firebase-functions');
const cors = require('cors');
const fetch = require('node-fetch');

// CORS設定
const corsHandler = cors({
    origin: true,
    credentials: true
});

// レート制限用の変数
let nextRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1秒間隔
const REQUEST_TIMEOUT = 15000;
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function reserveRequestSlot() {
    const now = Date.now();
    const start = Math.max(now, nextRequestTime);
    nextRequestTime = start + MIN_REQUEST_INTERVAL;
    return new Promise(resolve => setTimeout(resolve, start - now));
}

async function fetchUpstream(apiUrl) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        await reserveRequestSlot();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        try {
            const response = await fetch(apiUrl, {
                signal: controller.signal,
                headers: { Accept: 'application/json' }
            });
            if (response.ok) return response.json();

            const body = (await response.text()).slice(0, 500);
            console.error('Upstream response', { status: response.status, attempt, body });
            if (!RETRYABLE_STATUS.has(response.status) || attempt === MAX_ATTEMPTS) {
                const error = new Error(`Upstream HTTP ${response.status}`);
                error.status = RETRYABLE_STATUS.has(response.status) ? 503 : 502;
                throw error;
            }
        } catch (error) {
            if (error.status || attempt === MAX_ATTEMPTS) {
                if (!error.status) error.status = 503;
                throw error;
            }
            console.warn('Upstream request failed; retrying', { attempt, message: error.message });
        } finally {
            clearTimeout(timer);
        }
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
}

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

            console.log(`API Request: ${apiUrl}`);
            const data = await fetchUpstream(apiUrl);
            console.log('API Response received successfully');

            // レスポンスをそのまま返す
            res.json(data);

        } catch (error) {
            console.error('Cloud Function Error:', error);

            // エラーレスポンス
            res.status(error.status || 500).json({
                error: error.status === 503
                    ? '総務省の検索サービスが一時的に利用できません。時間をおいて再度お試しください。'
                    : '検索サービスとの通信に失敗しました。',
                details: error.message
            });
        }
    });
});
