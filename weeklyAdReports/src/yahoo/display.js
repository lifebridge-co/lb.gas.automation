/** Yahoo!広告スクリプトにより自動実行される関数 */
function main() {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const report = getDisplayAdStats(date);
  Logger.log(JSON.stringify(report));

  MailApp.sendEmail({
    to: ['tipple5568figure'],
    subject: 'yahoo display report json',
    body: JSON.stringify(report),
  });
}
/**
 * 指定された日のディスプレイリスティング情報を都道府県ごとに収集し、kintone用json形式で返す
 */
function getDisplayAdStats(/** @type Date */date) {
  const queryDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${(date.getDate() - 1).toString().padStart(2, '0')}`;
  const kintoneDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate() - 1).toString().padStart(2, '0')}`;
  /** @type {[string,string,number,number,number,number][]} */
  const report = AdsUtilities.getDisplayReport({
    fields: ['CAMPAIGN_NAME', 'ADGROUP_NAME', 'IMPS', 'CLICK', 'COST', 'CONVERSIONS'], // display広告と検索広告でクリック数のフィールド名が異なる。display広告では'CLICK'
    filters: [{ field: 'COST', filterOperator: 'GREATER_THAN', values: ['0'] }],
    reportDateRangeType: 'CUSTOM_DATE',
    dateRange: { startDate: queryDate, endDate: queryDate },
  }).reports[0].rows;
  return report.map(row => ({
    'CAMPAIGN_NAME': row[0],
    'ADGROUP_NAME': row[1],
    'IMPS': row[2],
    'CLICK': row[3],
    'COST': row[4],
    'CONVERSIONS': row[5]
  })).map(report => {
    let area = (report.ADGROUP_NAME.match(/(北海道|青森|岩手|宮城|秋田|山形|福島|茨城|栃木|群馬|埼玉|千葉|東京|神奈川|新潟|富山|石川|福井|山梨|長野|岐阜|静岡|愛知|三重|滋賀|京都|大阪|兵庫|奈良|和歌山|鳥取|島根|岡山|広島|山口|徳島|香川|愛媛|高知|福岡|佐賀|長崎|熊本|大分|宮崎|鹿児島|沖縄)/) || ["", ""])[1];
    if (area === "") {
      area = "不明";
    } else if (area === "北海道") {
      // pass
    } else if (area === "東京") {
      area = "東京都";
    } else if (area === "京都" || area === "大阪") {
      area = `${area}府`;
    } else {
      area = `${area}県`;
    }
    return ({
      date: { value: kintoneDate },
      platform: { value: "yahoo" },
      campaign: { value: report.CAMPAIGN_NAME },
      campaign_type: { value: "DISPLAY" },
      area: { value: area },
      cost: { value: report.COST },
      clicks: { value: report.CLICK },
      impressions: { value: report.IMPS },
      conversions: { value: report.CONVERSIONS }
    });
  });
}
