// 地域検索関連の機能

let allCities = [];

// 市区町村データの読み込み
async function loadCityData() {
    try {
        const response = await fetch('cityCode.csv');
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
    }
}

// 地域入力の変換（完全一致のみ）
function convertAreaInput(input) {
    if (!input) return '';

    console.log('地域検索入力:', input);

    // 5桁の数字の場合はそのまま返す
    if (/^[0-9]{5}$/.test(input)) {
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
