// 地域検索関連の機能

let allCities = [];
let allJCC = [];

// 市区町村データの読み込み
async function loadCityData() {
    try {
        const response = await fetch('cityCode.csv');
        if (!response.ok) throw new Error('市区町村データを読み込めませんでした。');
        const csvText = await response.text();
        const lines = csvText.split('\n');

        allCities = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const [code, name] = line.split(',');
                if (code && name) {
                    allCities.push({
                        code: code.trim(),
                        name: name.trim()
                    });
                }
            }
        }

        console.log(`市区町村データを読み込みました: ${allCities.length}件`);
    } catch (error) {
        console.error('市区町村データの読み込みに失敗しました:', error);
        throw error;
    }
}

// JARL の現存する市・郡・区番号と、対応する所在地の一覧
async function loadJCCData() {
    const response = await fetch('contest-numbers.json');
    if (!response.ok) throw new Error('市郡区番号データを読み込めませんでした。');
    allJCC = await response.json();
}

// 地域入力の変換（完全一致のみ）
function convertAreaInput(input) {
    if (!input) return '';

    console.log('地域検索入力:', input);

    // 5桁の数字の場合はそのまま返す
    if (/^[0-9]{5}$/.test(input) && allCities.some(city => city.code === input)) {
        console.log('5桁コードとして処理:', input);
        return input;
    }

    // 完全一致で検索
    const found = allCities.find(city => city.name === input);

    if (found) {
        console.log('完全一致:', found.name, '→', found.code);
        return found.code;
    }

    console.log('マッチする地域が見つかりませんでした');
    return '';
}

// 郡名の有無による表記差を吸収する。都道府県と自治体名は省略しない。
function normalizeLocation(text) {
    return text.normalize('NFKC').replace(/\s+/g, '')
        .replace(/^(北海道|東京都|京都府|大阪府|.{2,3}県)[^市区町村]+郡(?=[^市区町村]+[町村])/, '$1');
}

function matchLocationWithJCC(locationText) {
    if (!locationText || !allJCC.length) return [];
    const location = normalizeLocation(locationText);
    // 複数地点や移動範囲を一つの運用場所とみなさない。
    if (/[、,，・/]|及び|又は|から|まで|全国/.test(location)) return [];
    let matches = allJCC.filter(item => location.startsWith(normalizeLocation(item.name)));
    if (!matches.length) return [];
    const longest = Math.max(...matches.map(item => normalizeLocation(item.name).length));
    matches = matches.filter(item => normalizeLocation(item.name).length === longest);
    // 区名まで書かれていても対応する区番号がない場合、市番号を代用しない。
    if (matches[0].type === 'JCC' && /市[^市区町村]*区/.test(location)) return [];
    return new Set(matches.map(item => item.code)).size === 1 ? [matches[0]] : [];
}
