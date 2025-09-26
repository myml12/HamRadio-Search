// メインロジック

// 検索実行関数
async function searchRadioStation() {
    const searchType = getSelectedSearchType();
    const stationType = elements.stationTypeSelect.value;
    let searchValue = '';

    // バナーを非表示にする
    const bannerElement = document.getElementById('result-banner');
    if (bannerElement) {
        bannerElement.style.display = 'none';
    }

    // 検索値の取得
    switch (searchType) {
        case 'callsign':
        case 'name':
            searchValue = elements.searchInput.value.trim();
            break;
        case 'area':
            searchValue = convertAreaInput(elements.searchInput.value.trim());
            break;
    }

    // 入力値の検証
    if (!searchValue) {
        let errorMessage = '';
        switch (searchType) {
            case 'callsign':
                errorMessage = 'コールサインを入力してください。';
                break;
            case 'name':
                errorMessage = '免許人名称を入力してください。';
                break;
            case 'area':
                errorMessage = '地域を入力してください。';
                break;
        }
        showError(errorMessage);
        return;
    }

    // 地域検索の場合、変換結果をチェック
    if (searchType === 'area' && !searchValue) {
        showError('入力された地域が見つかりませんでした。都道府県名、市区町村名、または5桁のコードを入力してください。');
        return;
    }

    try {
        // ローディング状態を設定
        setLoadingState(true);
        hideSections();

        // スマホでキーボードを閉じる
        elements.searchInput.blur();

        // 検索実行
        const data = await fetchRadioStationData(searchValue, searchType, stationType);

        // 結果表示
        displayResults(data, searchValue, searchType);

    } catch (error) {
        console.error('検索エラー:', error);
        showError(`検索中にエラーが発生しました: ${error.message}`);
    } finally {
        // ローディング状態を解除
        setLoadingState(false);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function () {
    // DOM要素の初期化
    initializeDOM();

    // 市区町村データの読み込み
    loadCityData();

    console.log('無線局等情報検索アプリが初期化されました');
});
