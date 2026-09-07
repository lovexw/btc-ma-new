export const MA_DAYS = [50, 200, 350, 700, 1000, 1400, 2411];

export const MA_COLORS = {
  50: '#FF6B6B',
  200: '#4ECDC4',
  350: '#45B7D1',
  700: '#FFA07A',
  1000: '#98D8C8',
  1400: '#B794F4',
  2411: '#FF69B4'
};

export const ACCENT = '#FF9900';
export const PRICE_SERIES_NAME = 'BTC价格';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 解析 CSV（date,btc price）。兼容新旧两种行序，统一返回时间升序数组。
 */
export function parseCsv(text) {
  const rows = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const commaIdx = line.indexOf(',');
    if (commaIdx < 0) continue;
    const date = line.slice(0, commaIdx).trim();
    const price = parseFloat(line.slice(commaIdx + 1).trim());
    if (!DATE_RE.test(date) || !Number.isFinite(price)) continue;
    rows.push({ date, price });
  }
  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return rows;
}

/**
 * 用前缀和一次性算出所有周期均线，O(n × 周期数)。
 * 窗口未填满时为 null（ECharts 视为断点）。
 */
export function computeMovingAverages(data, days = MA_DAYS) {
  const n = data.length;
  const cum = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) cum[i + 1] = cum[i] + data[i].price;

  const result = {};
  for (const d of days) {
    const arr = new Array(n).fill(null);
    if (n >= d) {
      for (let i = d - 1; i < n; i++) {
        arr[i] = Math.round(((cum[i + 1] - cum[i + 1 - d]) / d) * 100) / 100;
      }
    }
    result[d] = arr;
  }
  return result;
}

export function buildPriceMap(data) {
  const map = new Map();
  for (const row of data) map.set(row.date, row.price);
  return map;
}

export function getLatestValue(series) {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] != null) return series[i];
  }
  return null;
}

/** 均线最新一日相对前一日的涨跌幅（%）。 */
export function getDailyChange(series) {
  if (!series || series.length < 2) return null;
  const cur = series[series.length - 1];
  const prev = series[series.length - 2];
  if (cur == null || prev == null) return null;
  return ((cur - prev) / prev) * 100;
}

/**
 * 历年定投回测：以最新数据日为基准，计算 2017 年起每年同日买入、
 * 持有到现在的收益率。同日无数据时最多向前找 3 天。
 */
export function getYearlyInvestmentReturns(data, priceMap, startYear = 2017) {
  if (!data.length) return [];
  const anchor = data[data.length - 1];
  const anchorYear = Number(anchor.date.slice(0, 4));
  const monthDay = anchor.date.slice(5);

  const results = [];
  for (let year = startYear; year < anchorYear; year++) {
    let targetDate = `${year}-${monthDay}`;
    let buyPrice = priceMap.get(targetDate);
    if (buyPrice == null) {
      const [y, m, d] = targetDate.split('-').map(Number);
      for (let delta = 1; delta <= 3 && buyPrice == null; delta++) {
        const prev = new Date(Date.UTC(y, m - 1, d - delta));
        targetDate = prev.toISOString().slice(0, 10);
        buyPrice = priceMap.get(targetDate);
      }
    }
    if (buyPrice != null) {
      const returnRate = ((anchor.price - buyPrice) / buyPrice) * 100;
      results.push({
        year,
        date: targetDate,
        buyPrice,
        currentPrice: anchor.price,
        returnRate,
        isPositive: returnRate >= 0
      });
    }
  }
  return results.reverse();
}

export function formatUsd(value, { decimals } = {}) {
  if (value == null || !Number.isFinite(value)) return '—';
  const maximumFractionDigits = decimals ?? (Math.abs(value) >= 1000 ? 0 : 2);
  return '$' + value.toLocaleString('en-US', { maximumFractionDigits });
}

export function formatPercent(value, { sign = true } = {}) {
  if (value == null || !Number.isFinite(value)) return '—';
  const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(2);
  return `${sign && value >= 0 ? '+' : ''}${rounded}%`;
}
