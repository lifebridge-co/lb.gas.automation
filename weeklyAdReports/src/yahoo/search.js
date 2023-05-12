const basic = 'YOUR_BASIC_AUTH';
const token = 'YOUR_TOKEN';

/** Yahoo!広告スクリプトにより自動実行される関数 */
function main() {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const report = getSearchAdStats(date);
  Logger.log(JSON.stringify(report));

  MailApp.sendEmail({
    to: ['x_yokoyama@lifebridge.co.jp'], //write one or more.
    subject: 'yahoo report json',
    body: JSON.stringify(report),
  });
}
/**
 * 指定された日の検索リスティング情報を都道府県ごとに収集し、kintone用json形式で返す
 */
function getSearchAdStats(/** @type Date */date) {
  const accountId = AdsUtilities.getCurrentAccountId();
  const queryDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${(date.getDate() - 1).toString().padStart(2, '0')}`;
  const kintoneDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate() - 1).toString().padStart(2, '0')}`;
  /** @type {[string,number,number,number,number][]} */
  const report = AdsUtilities.getSearchReport({
    accountId,
    fields: ['CAMPAIGN_NAME', 'IMPS', 'CLICKS', 'COST', 'CONVERSIONS'], // display広告と検索広告でクリック数のフィールド名が異なる。検索広告では'CLICKS'。
    filters: [{ field: 'COST', filterOperator: 'GREATER_THAN', values: ['0'] }],
    reportDateRangeType: 'CUSTOM_DATE',
    dateRange: { startDate: queryDate, endDate: queryDate },
    reportType: 'CAMPAIGN',
  }).reports[0].rows;
  return report.map(row => ({
    'CAMPAIGN_NAME': row[0],
    'IMPS': row[1],
    'CLICKS': row[2],
    'COST': row[3],
    'CONVERSIONS': row[4]
  })).map(report => ({
    date: { value: kintoneDate },
    platform: { value: "yahoo" },
    campaign: { value: report.CAMPAIGN_NAME },
    campaign_type: { value: "SEARCH" },
    area: { value: (/\d\d_(.{2,3}[県府都道])リスティング/.exec(report.CAMPAIGN_NAME) || ["", ""])[1] }, // ランタイムV202302はオプショナルチェイニングが使えない
    cost: { value: report.COST },
    clicks: { value: report.CLICKS },
    impressions: { value: report.IMPS },
    conversions: { value: report.CONVERSIONS }
  }));
}
/** kintoneにデータを送信 */
function postToKintone(/** @type {{"app":number,"records":{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}[]}} */body, basic, token) {
  const options = {
    'contentType': 'application/json',
    'escaping': true,
    'headers': {
      'Host': 'lifebridge.cybozu.com:443',
      'Authorization': basic,
      'X-Cybozu-API-Token': token,
    },
    'method': 'POST',
    'payload': JSON.stringify(body),
    "muteHttpExceptions": true, // 200番台以外でも例外にならないようにする
    'validateHttpsCertificates': false
  };
  const resp = UrlFetchApp.fetch('https://lifebridge.cybozu.com/k/v1/records.json', options);
  if (resp.getResponseCode() < 299) {
    Logger.log('ok.');
  } else {
    Logger.log('oops.');
  }
  Logger.log(resp.getContentText());
}
