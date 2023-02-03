export type Utilities = GoogleAppsScript.Utilities.Utilities
export type Accounts = GoogleAppsScript.Adsense.Schema.Accounts

export class ReportService {
  private util = Utilities;
/**
 * Generates a spreadsheet report for a specific ad client in an account.
 * @param {string} accountName The resource name of the account.
 * @param {string} adClientReportingDimensionId The reporting dimension ID
 *     of the ad client.
 */
generateReport(accountId: string, adClientReportingDimensionId: string): void {
  // Prepare report.
  const startDate = this.util.formatDate(oneWeekAgo, Session.getScriptTimeZone(),
    'yyyy-MM-dd');
  const endDate = this.util.formatDate(today, Session.getScriptTimeZone(),
    'yyyy-MM-dd');

  const account = AdsApp
  const report=


    .Reports.generate(accountName, {
    // Specify the desired ad client using a filter.
    filters: ['AD_CLIENT_ID==' + escapeFilterParameter(adClientReportingDimensionId)],
    metrics: ['PAGE_VIEWS', 'AD_REQUESTS', 'AD_REQUESTS_COVERAGE', 'CLICKS',
      'AD_REQUESTS_CTR', 'COST_PER_CLICK', 'AD_REQUESTS_RPM',
      'ESTIMATED_EARNINGS'],
    dimensions: ['DATE'],
    ...dateToJson('startDate', oneWeekAgo),
    ...dateToJson('endDate', today),
    // Sort by ascending date.
    orderBy: ['+DATE']
  });

  if (report.rows) {
    const spreadsheet = SpreadsheetApp.create('AdSense Report');
    const sheet = spreadsheet.getActiveSheet();

    // Append the headers.
    sheet.appendRow(report.headers.map((header) => header.name));

    // Append the results.
    sheet.getRange(2, 1, report.rows.length, report.headers.length)
      .setValues(report.rows.map((row) => row.cells.map((cell) => cell.value)));

    Logger.log('Report spreadsheet created: %s',
      spreadsheet.getUrl());
  } else {
    Logger.log('No rows returned.');
  }
}
}
