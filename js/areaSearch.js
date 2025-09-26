// 地域検索関連の機能

let allCities = [];

// 市区町村データの読み込み
async function loadCityData() {
    try {
        const response = await fetch('cityCode.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');

        allCities = [];

        for (let i = 1; i < lines.length; i++) { // ヘッダー行をスキップ
            const line = lines[i].trim();
            if (line) {
                const [code, prefecture, name] = line.split(',');
                if (code && prefecture && name) {
                    allCities.push({
                        code: code.trim(),
                        prefecture: prefecture.trim(),
                        name: name.trim()
                    });
                }
            }
        }

        console.log(`市区町村データを読み込みました: ${allCities.length}件`);
    } catch (error) {
        console.error('市区町村データの読み込みに失敗しました:', error);
    }
}

// 地域入力の変換（都道府県名・市区町村名 → コード）
function convertAreaInput(input) {
    if (!input) return '';

    console.log('地域検索入力:', input);

    // 5桁の数字の場合はそのまま返す
    if (/^[0-9]{5}$/.test(input)) {
        console.log('5桁コードとして処理:', input);
        return input;
    }

    // 都道府県名のみの入力かどうかを判定
    const isPrefectureOnly = (input.includes('都') || input.includes('道') || input.includes('府') || input.includes('県')) &&
        !input.includes('区') && !input.includes('市') && !input.includes('町') && !input.includes('村');

    if (isPrefectureOnly) {
        console.log('都道府県名のみの入力のため、市区町村名検索をスキップ');
    } else {
        // 1. 市区町村名で検索（都道府県名のみでない場合のみ）
        const found = allCities.find(city => {
            // 完全一致を優先
            if (city.name === input) {
                console.log('完全一致:', city.name);
                return true;
            }

            // 都道府県名付きの入力の場合（例：「東京都渋谷区」）
            if (input.includes('都') || input.includes('道') || input.includes('府') || input.includes('県')) {
                // 市区町村名が入力に含まれる場合のみマッチ
                if (input.includes(city.name) && city.name.length >= 2) {
                    console.log('都道府県名付き入力でマッチ:', city.name, 'in', input);
                    return true;
                }
            } else {
                // 都道府県名なしの入力の場合（例：「渋谷区」）
                // 入力が市区町村名に含まれる場合（部分一致）
                if (city.name.includes(input) && input.length >= 2) {
                    console.log('部分一致:', input, 'in', city.name);
                    return true;
                }
            }

            return false;
        });

        if (found) {
            console.log('市区町村名でマッチ:', found.name, '→', found.code);
            return found.code;
        }
    }

    // 2. 都道府県名で検索（市区町村名で見つからない場合のみ）
    for (const [prefectureName, code] of Object.entries(prefectureCodes)) {
        if (prefectureName.includes(input) || input.includes(prefectureName)) {
            console.log('都道府県名でマッチ:', prefectureName, '→', code);
            return code;
        }
    }

    console.log('マッチする地域が見つかりませんでした');
    return '';
}
