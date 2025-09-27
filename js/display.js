// 表示関連の機能

// 検索結果の表示
function displayResults(data, searchValue, searchType) {
    if (!data || !data.musenInformation) {
        showError('予期しない応答形式です。');
        return;
    }

    const totalCount = data.musenInformation.totalCount;

    if (totalCount === 0) {
        // 検索結果が0件の場合
        let noResultsMessage = '';
        switch (searchType) {
            case 'callsign':
                noResultsMessage = `コールサイン「${escapeHtml(searchValue)}」に一致する無線局は見つかりませんでした。`;
                break;
            case 'name':
                noResultsMessage = `免許人名称「${escapeHtml(searchValue)}」に一致する無線局は見つかりませんでした。`;
                break;
            case 'area':
                const originalInput = elements.searchInput.value.trim();
                noResultsMessage = `「${escapeHtml(originalInput)}」に一致する無線局は見つかりませんでした。`;
                break;
            default:
                noResultsMessage = '検索条件に一致する無線局は見つかりませんでした。';
        }

        const noResultsOutput = `
            <div class="row">
                <div class="col-12">
                    <div class="alert alert-info border-0">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-search me-3 fs-4"></i>
                            <div>
                                <h5 class="alert-heading mb-1">検索結果なし</h5>
                                <p class="mb-0">${escapeHtml(noResultsMessage)}</p>
                                <small class="text-muted mt-2 d-block">
                                    <i class="bi bi-lightbulb me-1"></i>
                                    別のキーワードで検索してみてください。
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        elements.result.innerHTML = noResultsOutput;
        elements.resultsSection.style.display = 'block';
        return;
    }

    // musenは配列なので、全ての要素を処理
    const musenArray = data.musen;

    if (Array.isArray(musenArray) && musenArray.length > 0) {
        // バナー表示
        const bannerElement = document.getElementById('result-banner');
        const summaryElement = document.getElementById('result-summary');
        summaryElement.textContent = `全 ${totalCount} 件の無線局情報が見つかりました`;
        bannerElement.style.display = 'block';

        // カード群の出力
        let output = '';

        // 各無線局情報をカード形式で表示
        musenArray.forEach((musenData, index) => {
            if (musenData) {
                // データ構造を確認して適切にアクセス
                const listInfo = musenData.listInfo || {};
                const detailInfo = musenData.detailInfo || {};

                output += `
                    <div class="card border-0 shadow-sm mb-3">
                        <div class="card-header bg-primary text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0 fw-light" style="font-size: 0.9rem; letter-spacing: 0.5px;">
                                    <i class="bi bi-broadcast me-1"></i>
                                    無線局情報 #${index + 1}
                                </h5>
                                <span class="badge bg-light text-dark">${index + 1}/${totalCount}</span>
                            </div>
                        </div>
                        <div class="card-body" style="padding: 1rem 1.5rem;">
                            <div class="row">
                                <!-- 基本情報 -->
                                <div class="col-md-6 mb-3">
                                    <h6 class="fw-semibold mb-2" style="font-size: 0.85rem; letter-spacing: 0.3px; color: #cccccc;">
                                        <i class="bi bi-info-circle me-1"></i>基本情報
                                    </h6>
                                    <div class="row g-2" style="font-size: 0.8rem;">
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">名称:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(listInfo.name) || '情報なし'}</div>
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">目的:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(listInfo.radioStationPurpose) || '情報なし'}</div>
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">免許日:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(listInfo.licenseDate) || '情報なし'}</div>
                                    </div>
                                </div>

                                <!-- 詳細情報 -->
                                <div class="col-md-6 mb-3">
                                    <h6 class="fw-semibold mb-2" style="font-size: 0.85rem; letter-spacing: 0.3px; color: #cccccc;">
                                        <i class="bi bi-person me-1"></i>詳細情報
                                    </h6>
                                    <div class="row g-2" style="font-size: 0.8rem;">
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">種別:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(detailInfo.radioStationCategory) || '情報なし'}</div>
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">有効期間:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(detailInfo.validTerms) || '情報なし'}</div>
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">運用時間:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(detailInfo.permittedOperatingHours) || '情報なし'}</div>
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">通信事項:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(detailInfo.commMatter) || '情報なし'}</div>
                                        <div class="col-4"><strong style="color: #cccccc; font-weight: 500;">識別信号:</strong></div>
                                        <div class="col-8" style="color: #ffffff;">${escapeHtml(detailInfo.identificationSignals) || '情報なし'}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- 電波情報 -->
                            ${detailInfo.radioSpec1 ? `
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <h6 class="fw-semibold mb-2" style="font-size: 0.85rem; letter-spacing: 0.3px; color: #cccccc;">
                                            <i class="bi bi-wifi me-1"></i>電波の形式、周波数及び空中線電力
                                        </h6>
                                            <p class="mb-0" style="color: #ffffff; font-weight: 400; font-size: 0.8rem; background: rgba(255, 255, 255, 0.05); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);">${formatTextWithLineBreaks(detailInfo.radioSpec1)}</p>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- 設備場所と移動範囲 -->
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <h6 class="fw-semibold mb-2" style="font-size: 0.85rem; letter-spacing: 0.3px; color: #cccccc;">
                                        <i class="bi bi-geo-alt me-1"></i>無線設備の場所
                                    </h6>
                                        <p class="mb-0" style="color: #ffffff; font-weight: 400; font-size: 0.8rem;">${formatTextWithLineBreaks(detailInfo.radioEuipmentLocation) || '情報なし'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-semibold mb-2" style="font-size: 0.85rem; letter-spacing: 0.3px; color: #cccccc;">
                                        <i class="bi bi-globe me-1"></i>移動範囲
                                    </h6>
                                        <p class="mb-0" style="color: #ffffff; font-weight: 400; font-size: 0.8rem;">${formatTextWithLineBreaks(detailInfo.movementArea) || '情報なし'}</p>
                                </div>
                            </div>
                            
                            <!-- 備考 -->
                            ${detailInfo.note ? `
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <h6 class="fw-semibold mb-2" style="font-size: 0.85rem; letter-spacing: 0.3px; color: #cccccc;">
                                            <i class="bi bi-sticky me-1"></i>備考
                                        </h6>
                                            <p class="mb-0" style="color: #ffffff; font-weight: 400; font-size: 0.8rem; background: rgba(255, 255, 255, 0.05); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);">${formatTextWithLineBreaks(detailInfo.note)}</p>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
        });

        // データ更新日
        if (data.musenInformation.lastUpdateDate) {
            output += `
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="text-center">
                            <small style="color: #cccccc; opacity: 0.7;">
                                <i class="bi bi-calendar me-1"></i>
                                データ更新日: ${escapeHtml(data.musenInformation.lastUpdateDate)}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }

        // 結果の表示
        elements.result.innerHTML = output;
        elements.resultsSection.style.display = 'block';
    } else {
        // 検索結果が0件の場合
        let noResultsMessage = '';
        switch (searchType) {
            case 'callsign':
                noResultsMessage = `コールサイン「${escapeHtml(searchValue)}」に一致する無線局は見つかりませんでした。`;
                break;
            case 'name':
                noResultsMessage = `免許人名称「${escapeHtml(searchValue)}」に一致する無線局は見つかりませんでした。`;
                break;
            case 'area':
                const originalInput = elements.searchInput.value.trim();
                noResultsMessage = `「${escapeHtml(originalInput)}」に一致する無線局は見つかりませんでした。`;
                break;
            default:
                noResultsMessage = '検索条件に一致する無線局は見つかりませんでした。';
        }

        const noResultsOutput = `
            <div class="row">
                <div class="col-12">
                    <div class="alert alert-info border-0">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-search me-3 fs-4"></i>
                            <div>
                                <h5 class="alert-heading mb-1">検索結果なし</h5>
                                <p class="mb-0">${escapeHtml(noResultsMessage)}</p>
                                <small class="text-muted mt-2 d-block">
                                    <i class="bi bi-lightbulb me-1"></i>
                                    別のキーワードで検索してみてください。
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        elements.result.innerHTML = noResultsOutput;
        elements.resultsSection.style.display = 'block';
    }
}

// JCC検索結果の表示
function displayJCCResults(data, searchValue) {
    if (!data || !data.musenInformation) {
        showError('予期しない応答形式です。');
        return;
    }

    const totalCount = data.musenInformation.totalCount;

    if (totalCount === 0) {
        // 検索結果が0件の場合
        const noResultsMessage = `コールサイン「${escapeHtml(searchValue)}」に一致する無線局は見つかりませんでした。`;

        const noResultsOutput = `
            <div class="row">
                <div class="col-12">
                    <div class="alert alert-info border-0">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-search me-3 fs-4"></i>
                            <div>
                                <h5 class="alert-heading mb-1">検索結果なし</h5>
                                <p class="mb-0">${escapeHtml(noResultsMessage)}</p>
                                <small class="text-muted mt-2 d-block">
                                    <i class="bi bi-lightbulb me-1"></i>
                                    別のコールサインで検索してみてください。
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        elements.result.innerHTML = noResultsOutput;
        elements.resultsSection.style.display = 'block';
        return;
    }

    // 検索結果の表示
    let resultsOutput = `
        <div class="row mb-4" style="margin: 0 40px;">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h3 class="mb-0" style="color: #ffffff; font-weight: 700;">
                        <i class="bi bi-broadcast me-2" style="color: #4f46e5;"></i>JCC検索結果
                    </h3>
                    <span class="badge bg-primary fs-5 px-3 py-2" style="border-radius: 25px;">${totalCount}件</span>
                </div>
                <hr class="my-4" style="border-color: #4f46e5; opacity: 0.3;">
            </div>
        </div>
    `;

    // 各無線局のJCC検索結果を表示
    const musenArray = data.musen;

    if (Array.isArray(musenArray) && musenArray.length > 0) {
        musenArray.forEach((musenData, index) => {
            if (musenData) {
                const listInfo = musenData.listInfo || {};
                const detailInfo = musenData.detailInfo || {};

                // 常置場所の取得
                const locationText = detailInfo.radioEuipmentLocation || '';

                // JCC照合
                const jccMatches = matchLocationWithJCC(locationText);

                resultsOutput += `
            <div class="card mb-4" style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); margin: 0 40px;">
                <div class="card-body p-5">
                    <!-- コールサイン表示 -->
                    <div class="text-center mb-4">
                        <h1 class="mb-2" style="color: #ffffff; font-weight: 300; letter-spacing: 3px; font-size: 3rem;">
                            ${escapeHtml(listInfo.callsign)}
                        </h1>
                        <p class="mb-1" style="color: #888; font-size: 1.2rem; font-weight: 300;">
                            ${escapeHtml(listInfo.name) || '情報なし'}
                        </p>
                        <p class="mb-0" style="color: #888; font-size: 1.2rem; font-weight: 300;">
                            ${escapeHtml(locationText) || '情報なし'}
                        </p>
                    </div>

                    <!-- JCC検索結果 -->
                    <div class="mb-3">
                        ${jccMatches.length > 0 ? `
                            <div class="row g-2">
                                ${jccMatches.map(jcc => `
                                    <div class="col-lg-3 col-md-4 col-sm-6">
                                        <div class="card h-100" style="background: #2a2a2a; border: 1px solid #444; border-radius: 6px; transition: all 0.2s ease;" onmouseover="this.style.background='#333'; this.style.borderColor='#666'" onmouseout="this.style.background='#2a2a2a'; this.style.borderColor='#444'">
                                            <div class="card-body text-center p-3">
                                                <h3 class="card-title mb-1" style="color: #ffffff; font-weight: 400; font-size: 1.8rem; letter-spacing: 1px;">
                                                    ${escapeHtml(jcc.code)}
                                                </h3>
                                                <p class="card-text mb-0" style="color: #ccc; font-size: 1rem; line-height: 1.3; font-weight: 300;">
                                                    ${escapeHtml(jcc.name)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center p-4" style="background: #2a2a2a; border-radius: 6px; border: 1px solid #444;">
                                <h5 class="mb-2" style="color: #888; font-weight: 300;">JCC検索結果なし</h5>
                                <p class="mb-0" style="color: #666; font-weight: 300;">JCC.csvに一致する地域が見つかりませんでした</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
            }
        });

        // 最下部に余白を追加
        resultsOutput += `
            <div style="height: 60px;"></div>
        `;

        elements.result.innerHTML = resultsOutput;
        elements.resultsSection.style.display = 'block';
    } else {
        // データが存在しない場合
        const noDataOutput = `
            <div class="row">
                <div class="col-12">
                    <div class="alert alert-warning border-0">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-exclamation-triangle me-3 fs-4"></i>
                            <div>
                                <h5 class="alert-heading mb-1">データなし</h5>
                                <p class="mb-0">無線局の詳細情報が取得できませんでした。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        elements.result.innerHTML = noDataOutput;
        elements.resultsSection.style.display = 'block';
    }
}
