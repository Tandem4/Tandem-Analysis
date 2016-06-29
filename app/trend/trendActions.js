export const REQUEST_TRENDS = 'REQUEST_TRENDS'

export function requestTrends(trends) {
  return {
    type: REQUEST_TRENDS,
    trends
  }
}
