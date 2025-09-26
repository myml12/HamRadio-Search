// ユーティリティ関数

// HTMLエスケープ関数
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 改行文字をHTMLの改行に変換する関数
function formatTextWithLineBreaks(text) {
    if (!text) return '';
    // 改行を<br>に変換してから、<br>タグを保護してHTMLエスケープ
    const withBreaks = text.replace(/\n/g, '<br>');
    const protected = withBreaks.replace(/<br>/g, '___BR___');
    const escaped = protected
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    return escaped.replace(/___BR___/g, '<br>');
}

// 日付フォーマット関数
function formatDate(dateString) {
    if (!dateString) return '情報なし';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// デバッグ用のログ関数
function debugLog(message, data = null) {
    if (console && console.log) {
        console.log(`[HamRadioSearch] ${message}`, data || '');
    }
}

// ローディング状態の設定
function setLoadingState(isLoading) {
    const buttonText = elements.searchButton.querySelector('.button-text');
    const loadingSpinner = elements.searchButton.querySelector('.loading-spinner');

    if (isLoading) {
        elements.searchButton.disabled = true;
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline';
        // 検索中は入力フィールドを無効化しない（白くならないように）
        elements.searchInput.style.opacity = '0.8';
        elements.searchInput.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
    } else {
        elements.searchButton.disabled = false;
        buttonText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
        // 通常状態に戻す
        elements.searchInput.style.opacity = '1';
        elements.searchInput.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
    }
}

// セクション非表示関数
function hideSections() {
    elements.resultsSection.style.display = 'none';
    elements.errorSection.style.display = 'none';
}

// エラー表示関数
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorSection.style.display = 'block';
}
