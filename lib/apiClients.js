// yahoo-finance2 v3 requires instantiation via `new YahooFinance()`
// The default export is the YahooFinance class itself.
import YahooFinanceClass from 'yahoo-finance2';
// Create a singleton instance with notice suppression
const yahooFinance = new YahooFinanceClass({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
  validation: { logErrors: false }
});
export { yahooFinance };
