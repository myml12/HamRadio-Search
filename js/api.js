// API通信関連の機能

// 無線局情報の検索
async function fetchRadioStationData(searchValue, searchType, stationType) {
    const params = new URLSearchParams();

    // 検索パラメータの設定
    switch (searchType) {
        case 'callsign':
            params.append('callsign', searchValue);
            break;
        case 'name':
            params.append('name', searchValue);
            break;
        case 'area':
            params.append('area', searchValue);
            break;
    }

    // 無線局種別の設定
    if (stationType && stationType !== 'ALL') {
        params.append('stationType', stationType);
    }

    const url = `${CONFIG.API_BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': CONFIG.USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // APIエラーのチェック
        if (data && data.errs && data.errs.errPost === 'ERR') {
            const errorCode = data.errs.err.errCd;
            const errorMessage = data.errs.err.errMsg;

            // エラーコードに応じた詳細なメッセージ（仕様書Ver.1.6.0に基づく）
            let detailedMessage = errorMessage;
            switch (errorCode) {
                case 'EQ00001':
                    detailedMessage = '検索パターン（ST）は1又は2を設定してください。';
                    break;
                case 'EQ00002':
                    detailedMessage = '出力形式（OF）は1～3の範囲で設定してください。';
                    break;
                case 'EQ00003':
                    detailedMessage = '詳細情報付加（DA）には0又は1を設定してください。';
                    break;
                case 'EQ00005':
                    detailedMessage = 'スタートカウント（SC）は9桁以内で設定してください。';
                    break;
                case 'EQ00006':
                    detailedMessage = '取得件数（DC）には1～3の範囲で設定してください。';
                    break;
                case 'EQ00007':
                    detailedMessage = '詳細情報付加（DA）に1が設定されている場合は、取得件数（DC）に3は指定できません。';
                    break;
                case 'EQ00008':
                    detailedMessage = '無線局の種別（OW）に存在しない無線局の種別が設定されています。';
                    break;
                case 'EQ00009':
                    detailedMessage = '無線設備の規格（OW2）に存在しない無線設備の規格が設定されています。';
                    break;
                case 'EQ00041':
                    detailedMessage = '並べ替えキー（SK）は1～4の範囲で設定してください。';
                    break;
                case 'EQ00043':
                    detailedMessage = '設定値に不正な値が含まれています。';
                    break;
                case 'EQ00044':
                    detailedMessage = '周波数等の一括表示記号（FC）に存在しない周波数等の一括表示記号が設定されています。';
                    break;
                case 'EQ00429':
                    detailedMessage = 'ただいま混み合っております。しばらく時間をおいてから再度お試しください。';
                    break;
                case 'EQ90000':
                    detailedMessage = 'システムエラーが発生しました。';
                    break;
            }

            throw new Error(`APIエラー (${errorCode}): ${detailedMessage}`);
        }

        return data;
    } catch (error) {
        console.error('API通信エラー:', error);
        throw error;
    }
}
