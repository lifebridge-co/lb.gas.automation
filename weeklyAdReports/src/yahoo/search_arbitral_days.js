/** Yahoo!広告スクリプトにより自動実行される関数 */
function main() {
  const days = [
    new Date(2023,4,1),
    new Date(2023,4,2),
    new Date(2023,4,3),
    new Date(2023,4,4),
    new Date(2023,4,5),
    new Date(2023,4,6),
    new Date(2023,4,7),
    new Date(2023,4,8),
    new Date(2023,4,9),
    new Date(2023,4,10),
    new Date(2023,4,11),
    new Date(2023,4,12),
  ];

  const report = days.flatMap(date=>getSearchAdStats(date));
  Logger.log(JSON.stringify(report));
  const marker = "\n>>>>>json_data>>>>>\n";
  MailApp.sendEmail({
    to: ['tipple5568figure'],
    subject: 'search yahoo report json',
    body: marker+JSON.stringify(report)+marker,
  });
}
/**
 * 指定された日の検索広告情報を都道府県ごとに収集し、kintone用json形式で返す
 */
function getSearchAdStats(/** @type Date */date) {
  const accountId = AdsUtilities.getCurrentAccountId();
  const queryDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const kintoneDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  /** @type {[string,number,number,number,number][]} */
  const report = AdsUtilities.getSearchReport({
    accountId,
    fields: ['CAMPAIGN_NAME', 'IMPS', 'CLICKS', 'COST', 'CONVERSIONS'], // display広告と検索広告でクリック数のフィールド名が異なる。検索広告では'CLICKS'。
    filters: [{ field: 'IMPS', filterOperator: 'GREATER_THAN', values: ['0'] }],
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
    date: kintoneDate,
    platform: "yahoo",
    campaign: report.CAMPAIGN_NAME,
    campaign_type: "都道府県別リスティング",
    area: (/\d\d_(.{2,3}[県府都道])リスティング/.exec(report.CAMPAIGN_NAME) || ["", ""])[1], // ランタイムV202302はオプショナルチェイニングが使えない
    cost: report.COST,
    clicks: report.CLICKS,
    impressions: report.IMPS,
    conversions: report.CONVERSIONS
  }));
}
