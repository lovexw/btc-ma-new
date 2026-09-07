import { ACCENT, MA_COLORS, MA_DAYS, PRICE_SERIES_NAME } from './btc';

const priceGradient = {
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: 'rgba(255, 153, 0, 0.18)' },
    { offset: 1, color: 'rgba(255, 153, 0, 0.01)' }
  ]
};

const formatTooltipValue = (value) => {
  if (value == null || value === '-') return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return (
    '$' +
    num.toLocaleString('en-US', {
      maximumFractionDigits: Math.abs(num) >= 1000 ? 0 : 2
    })
  );
};

/**
 * 构建图表 option。所有均线序列始终保留，通过隐藏 legend 的 selected
 * 控制显隐（merge 模式），切换均线时不会重置缩放与提示状态。
 */
export function buildChartOption({ data, mas, maVisible, isMobile }) {
  const selected = { [PRICE_SERIES_NAME]: true };
  MA_DAYS.forEach((day) => {
    selected[`MA${day}`] = Boolean(maVisible[day]);
  });

  const series = [
    {
      name: PRICE_SERIES_NAME,
      type: 'line',
      data: data.map((d) => d.price),
      symbol: 'none',
      smooth: 0.2,
      sampling: 'lttb',
      z: 10,
      lineStyle: {
        color: ACCENT,
        width: 2.5,
        shadowColor: 'rgba(255, 153, 0, 0.25)',
        shadowBlur: 8,
        shadowOffsetY: 3
      },
      areaStyle: { color: priceGradient }
    }
  ];

  MA_DAYS.forEach((day) => {
    series.push({
      name: `MA${day}`,
      type: 'line',
      data: mas[day],
      symbol: 'none',
      smooth: 0.15,
      sampling: 'lttb',
      z: 5,
      lineStyle: { color: MA_COLORS[day], width: isMobile ? 1.4 : 1.8 },
      itemStyle: { color: MA_COLORS[day] }
    });
  });

  return {
    backgroundColor: 'transparent',
    animationDuration: 500,
    animationDurationUpdate: 200,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: isMobile ? 'line' : 'cross',
        crossStyle: { color: ACCENT, opacity: 0.6 },
        lineStyle: { color: ACCENT, type: 'dashed', opacity: 0.5 }
      },
      backgroundColor: 'rgba(26, 26, 26, 0.94)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#fff', fontSize: 13 },
      formatter: (params) => {
        if (!params || !params.length) return '';
        let html = `<div style="font-weight:700;margin-bottom:6px;">${params[0].axisValue}</div>`;
        params.forEach((p) => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:3px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${p.color};flex:none;"></span>
            <span style="opacity:.85;">${p.seriesName}</span>
            <span style="margin-left:auto;font-weight:600;padding-left:12px;">${formatTooltipValue(p.value)}</span>
          </div>`;
        });
        return html;
      }
    },
    legend: {
      show: false,
      data: [PRICE_SERIES_NAME, ...MA_DAYS.map((d) => `MA${d}`)],
      selected
    },
    grid: {
      left: 4,
      right: isMobile ? 20 : 12,
      top: 24,
      bottom: isMobile ? 4 : 52,
      containLabel: true
    },
    dataZoom: [
      { type: 'inside' },
      ...(isMobile
        ? []
        : [
            {
              type: 'slider',
              height: 28,
              bottom: 10,
              borderColor: '#E7E9EE',
              fillerColor: 'rgba(255, 153, 0, 0.12)',
              handleStyle: {
                color: ACCENT,
                borderColor: ACCENT,
                shadowColor: 'rgba(255, 153, 0, 0.3)',
                shadowBlur: 4
              },
              textStyle: { color: '#667085', fontSize: 11 },
              dataBackground: {
                lineStyle: { color: 'rgba(255,153,0,0.4)' },
                areaStyle: { color: 'rgba(255,153,0,0.08)' }
              },
              selectedDataBackground: {
                lineStyle: { color: ACCENT },
                areaStyle: { color: 'rgba(255,153,0,0.15)' }
              }
            }
          ])
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.date),
      axisLine: { lineStyle: { color: '#E7E9EE' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#667085',
        fontSize: 11,
        hideOverlap: true,
        formatter: isMobile ? (value) => value.slice(0, 4) : undefined
      }
    },
    yAxis: {
      type: 'value',
      name: isMobile ? '' : '价格 (USD)',
      nameTextStyle: { color: '#667085', fontSize: 12, fontWeight: 600, padding: [0, 0, 6, 0] },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#667085',
        fontSize: 11,
        formatter: (value) => (Math.abs(value) >= 1000 ? `${value / 1000}k` : value)
      },
      splitLine: { show: true, lineStyle: { color: '#EDEFF3', type: 'dashed' } }
    },
    series
  };
}
