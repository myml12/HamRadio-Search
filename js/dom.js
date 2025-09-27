// DOM要素の管理

// DOM要素の取得
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton'),
    result: document.getElementById('result'),
    resultsSection: document.getElementById('resultsSection'),
    errorSection: document.getElementById('errorSection'),
    errorMessage: document.getElementById('errorMessage'),
    searchLabel: document.getElementById('searchLabel'),
    searchHelp: document.getElementById('searchHelp'),
    areaSelection: document.getElementById('areaSelection'),
    stationTypeSelect: document.getElementById('stationTypeSelect')
};

// DOM要素の初期化
function initializeDOM() {
    // 検索方法変更のイベントリスナー
    const searchTypeRadios = document.querySelectorAll('input[name="searchType"]');
    searchTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateSearchUI);
    });

    // 入力フィールドのイベントリスナー
    elements.searchInput.addEventListener('input', handleInputChange);
    elements.searchInput.addEventListener('keypress', handleKeyPress);

    // 検索ボタンのイベントリスナー
    elements.searchButton.addEventListener('click', searchRadioStation);

    // 無線局種別選択のイベントリスナー
    elements.stationTypeSelect.addEventListener('change', function () {
        elements.searchButton.disabled = !elements.searchInput.value.trim();
    });

    // 初期状態でボタンを無効化
    elements.searchButton.disabled = true;

    // 初期状態でUIを更新
    updateSearchUI();
}

// 入力フィールドの変更処理
function handleInputChange() {
    const searchType = getSelectedSearchType();

    if (searchType === 'callsign' || searchType === 'callsignToJCC') {
        // コールサイン検索の場合は大文字に変換
        this.value = this.value.toUpperCase();
        // 半角英数以外の文字を除去
        this.value = this.value.replace(/[^A-Z0-9]/g, '');
        // 最大文字数制限
        if (this.value.length > CONFIG.MAX_CALLSIGN_LENGTH) {
            this.value = this.value.substring(0, CONFIG.MAX_CALLSIGN_LENGTH);
        }
    } else if (searchType === 'area') {
        // 地域検索の場合は数字とひらがな・カタカナ・漢字を許可
        // 数字のみの場合は5桁に制限
        if (/^[0-9]+$/.test(this.value)) {
            if (this.value.length > 5) {
                this.value = this.value.substring(0, 5);
            }
        }
    }

    // ボタンの有効/無効を切り替え
    elements.searchButton.disabled = !this.value.trim();
}

// 検索UIの更新
function updateSearchUI() {
    const searchType = getSelectedSearchType();

    switch (searchType) {
        case 'callsign':
            elements.searchLabel.textContent = 'コールサイン入力';
            elements.searchInput.placeholder = '例: JL1DMA';
            elements.searchInput.maxLength = 12;
            elements.searchHelp.textContent = '半角英数字12文字以内で入力してください';
            elements.areaSelection.style.display = 'none';
            break;
        case 'name':
            elements.searchLabel.textContent = '免許人名称入力';
            elements.searchInput.placeholder = '例: 中央大学アマチュア無線クラブ';
            elements.searchInput.maxLength = 50;
            elements.searchHelp.textContent = '主に社団局名でヒットします';
            elements.areaSelection.style.display = 'none';
            break;
        case 'area':
            elements.searchLabel.textContent = '地域検索';
            elements.searchInput.placeholder = '例: 東京都文京区';
            elements.searchInput.maxLength = 50;
            elements.searchHelp.textContent = '地域名もしくは地方公共団体コード（5桁）を入力してください';
            elements.areaSelection.style.display = 'none';
            break;
        case 'callsignToJCC':
            elements.searchLabel.textContent = 'コールサイン入力';
            elements.searchInput.placeholder = '例: JL1DMA';
            elements.searchInput.maxLength = 12;
            elements.searchHelp.textContent = 'コールサインを入力すると、常置場所からJCC/JCGコードを検索します（β版）';
            elements.areaSelection.style.display = 'none';
            break;
    }

    // 入力フィールドをクリア
    elements.searchInput.value = '';
    elements.searchButton.disabled = true;
}

// 選択された検索タイプを取得
function getSelectedSearchType() {
    const selectedRadio = document.querySelector('input[name="searchType"]:checked');
    return selectedRadio ? selectedRadio.value : 'callsign';
}

// キーボード入力処理
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();

        // 入力値がある場合のみ検索実行
        if (elements.searchInput.value.trim()) {
            // スマホでキーボードを閉じる（検索前に実行）
            elements.searchInput.blur();

            // 少し遅延させてから検索実行（キーボードが完全に閉じるまで待つ）
            setTimeout(() => {
                searchRadioStation();
            }, 100);
        }
    }
}
