const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { console, fetch: async path => ({ ok: true, text: async () => fs.readFileSync(path, 'utf8'), json: async () => JSON.parse(fs.readFileSync(path, 'utf8')) }) };
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/areaSearch.js', 'utf8'), context);
(async () => {
    await context.loadCityData();
    await context.loadJCCData();
    for (const [place, code] of [
        ['東京都千代田区', '100101'], ['東京都町田市', '1010'],
        ['北海道阿寒郡鶴居村', '01001'], ['神奈川県横浜市鶴見区', '110101'],
        ['静岡県浜松市中央区', '180208'], ['静岡県浜松市天竜区', '180207'],
        ['東京都大島町', '10004']
    ]) assert.equal(context.matchLocationWithJCC(place)[0]?.code, code, place);
    for (const place of ['静岡県浜松市中区', '東京都町田市、八王子市', '東京都', '北海道虻田郡']) {
        assert.equal(context.matchLocationWithJCC(place).length, 0, place);
    }
    assert.equal(context.convertAreaInput('北海道札幌市'), '01100');
    assert.equal(context.convertAreaInput('99999'), '');
    console.log('市郡区番号と地域コードの照合テストに合格しました');
})().catch(error => { console.error(error); process.exitCode = 1; });
