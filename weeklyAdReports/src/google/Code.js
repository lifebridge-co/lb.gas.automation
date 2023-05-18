/**
 * 昨日の各種リスティング情報を都道府県ごとに収集し、kintoneに送信する
 */
function main() {
  /** @type {[{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}]} */
  const dataCollection = [];
  const now = new Date();
  const yesterday = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${(now.getDate()).toString().padStart(2, '0')}`; // NOTE なぜか昨日の日付になります（UTCというわけでもない）

  dataCollection.push(...getAllPrefStats(yesterday));
  dataCollection.push(...getAllNationalStats(yesterday));
  dataCollection.push(...getAllYoutubeStats(yesterday));

  for (let offset = 0; offset < dataCollection.length; offset += 100) { // 100件ずつ送信(kintone一括登録上限)
    Utilities.sleep(50); // rate limit避け
    postToKintone(
      {
        app: 505,
        records: dataCollection.slice(offset, offset + 100)
      },
      basic,
      token
    );
  }
}

/** 都道府県リスティングの情報収集 */
function getAllPrefStats(date) {
  /** @type {{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}[]} */
  const dataCollection = [];
  for (
    const campaign of AdsApp.campaigns()
      .withCondition("campaign.name REGEXP_MATCH '[0-9]\{2\}_.*[県府都道]リスティング'")
      .withCondition("campaign.status = ENABLED")
      .get()
  ) {
    dataCollection.push(getPrefStats(campaign, date));
  }
  return dataCollection;
}

function getPrefStats(campaign, date) {
  const _stat = campaign.getStatsFor(date.replaceAll("-", ""), date.replaceAll("-", ""));
  const name = campaign.getName();
  const area = /\d\d_(.{2,3}[県府都道])リスティング/.exec(name)?.[1] ?? "";
  return {
    date: { value: date },
    platform: { value: "google" },
    campaign: { value: name },
    campaign_type: { value: "都道府県別リスティング" },
    area: { value: area },
    cost: { value: _stat.getCost() },
    clicks: { value: _stat.getClicks() },
    impressions: { value: _stat.getImpressions() },
    conversions: { value: _stat.getConversions() }
  };
}
/** 全国リスティングの情報収集
 */
function getAllNationalStats(date) {
  /** @type {{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}[]} */
  const dataCollection = [];
  for (
    const campaign of AdsApp.campaigns()
      .withCondition("campaign.name REGEXP_MATCH '.*全国.*リスティング'")
      .withCondition("campaign.status = ENABLED")
      .get()
  ) {
    dataCollection.push(...getNationalStats(campaign, date));
  }
  return dataCollection;
}
function getNationalStats(campaign, date) {
  const _date = date.replaceAll("-", "");
  /** @type {{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}[]} */
  const stats = [];
  for ( // 都道府県別の情報収集（名前ありの場所）
    const location of campaign.targeting().targetedLocations().forDateRange(_date, _date).withCondition("metrics.impressions > 0").get()
  ) {
    const _stat = location.getStatsFor(_date, _date);
    const locationId = location.getId();
    const area = GeoTargets?.[locationId] ?? "不明(" + locationId + ")";
    stats.push({
      date: { value: date },
      platform: { value: "google" },
      campaign: { value: campaign.getName() },
      campaign_type: { value: "全国リスティング" },
      area: { value: area },
      cost: { value: _stat.getCost() },
      clicks: { value: _stat.getClicks() },
      impressions: { value: _stat.getImpressions() },
      conversions: { value: _stat.getConversions() }
    });
  }
  for ( // 都道府県別の情報収集（緯度経度指定の場所）
    const location of campaign.targeting().targetedProximities().forDateRange(_date, _date).withCondition("metrics.impressions > 0").get()
  ) {
    const _stat = location.getStatsFor(_date, _date);
    const latLon = `${location.getLatitude()},${location.getLongitude()}`;
    const area = Proximities?.[latLon] ?? "不明(" + latLon + ")";
    stats.push({
      date: { value: date },
      platform: { value: "google" },
      campaign: { value: campaign.getName() },
      campaign_type: { value: "全国リスティング" },
      area: { value: area },
      cost: { value: _stat.getCost() },
      clicks: { value: _stat.getClicks() },
      impressions: { value: _stat.getImpressions() },
      conversions: { value: _stat.getConversions() }
    });
  }
  return stats;
}
/** Youtube広告の情報収集
 */
function getAllYoutubeStats(date) {
  /** @type {{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}[]} */
  const dataCollection = [];
  for (
    const campaign of AdsApp.videoCampaigns()
      .withCondition("campaign.name REGEXP_MATCH 'YoutubeTVR.*'")
      .withCondition("campaign.status = ENABLED")
      .get()
  ) {
    dataCollection.push(...getYoutubeStats(campaign, date));
  }
  return dataCollection;
}
function getYoutubeStats(campaign, date) {
  const _date = date.replaceAll("-", "");
  /** @type {{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}[]} */
  const stats = [];
  for ( // 都道府県別の情報収集（名前ありの場所）
    const location of campaign.targeting().targetedLocations().forDateRange(_date, _date).withCondition("metrics.impressions > 0").get()
  ) {
    const _stat = location.getStatsFor(_date, _date);
    const locationId = location.getId();
    const area = GeoTargets?.[locationId] ?? "不明(" + locationId + ")";
    stats.push({
      date: { value: date },
      platform: { value: "google" },
      campaign: { value: campaign.getName() },
      campaign_type: { value: "Youtube" },
      area: { value: area },
      cost: { value: _stat.getCost() },
      clicks: { value: _stat.getClicks() },
      impressions: { value: _stat.getImpressions() },
      conversions: { value: _stat.getConversions() }
    });
  }
  for ( // 都道府県別の情報収集（緯度経度指定の場所）
    const location of campaign.targeting().targetedProximities().forDateRange(_date, _date).withCondition("metrics.impressions > 0").get()
  ) {
    const _stat = location.getStatsFor(_date, _date);
    const latLon = `${location.getLatitude()},${location.getLongitude()}`;
    const area = Proximities?.[latLon] ?? "不明(" + latLon + ")";
    stats.push({
      date: { value: date },
      platform: { value: "google" },
      campaign: { value: campaign.getName() },
      campaign_type: { value: "Youtube" },
      area: { value: area },
      cost: { value: _stat.getCost() },
      clicks: { value: _stat.getClicks() },
      impressions: { value: _stat.getImpressions() },
      conversions: { value: _stat.getConversions() }
    });
  }
  return stats;
}

/** kintoneにデータを送信 */
function postToKintone(/** @type {{"app":number,"records":{"date": {"value":string},"platform": {"value":string},"campaign": {"value":string},"campaign_type":{"value":string},"area": { "value":string},"cost": { "value":number},"clicks": { "value":number},"impressions":{"value":number},"conversions":{"value":number}}[]}} */body, basic, token) {
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {
      "X-Cybozu-API-Token": token,
      "Authorization": basic,
    },
    'payload': JSON.stringify(body),
    "muteHttpExceptions": true, // 200番台以外でも例外にならないようにする
  };
  const resp = UrlFetchApp.fetch('https://lifebridge.cybozu.com/k/v1/records.json', options);
  if (resp.getResponseCode() < 299) {
    Logger.log('ok.');
  } else {
    Logger.log('oops.');
  }
  Logger.log(resp.getContentText());
}
