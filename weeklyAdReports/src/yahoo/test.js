const basic = 'YOUR_BASIC_AUTH';

const testToken="0IRdOO0uWb8MessD5cUM3GNY8a8NPFSFuyOH28r7";
/** Yahoo!広告スクリプトにより自動実行される関数 */
function main() {

  const options = {
    muteHttpExceptions: true, // 200番台以外でも例外にならないようにする
    headers: {
      'Host': 'lifebridge.cybozu.com:443',
      'Authorization': basic,
      'X-Cybozu-API-Token': testToken,
    },
    payload: body,
  };
  const resp = UrlFetchApp.fetch('https://lifebridge.cybozu.com/k/v1/record.json?app=505&id=3184', options);
  if (resp.getResponseCode() < 299) {
    Logger.log('ok.');
  } else {
    Logger.log('oops.');
  }
  Logger.log(resp.getContentText());
}
