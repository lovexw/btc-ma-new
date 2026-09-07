import { useEffect, useRef } from 'react';
import { echarts } from '../lib/echarts';

/**
 * 轻量 ECharts 绑定：挂载时初始化，容器尺寸变化时自适应，
 * option 变化时以 merge 模式增量更新。
 */
export function useECharts(option) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const chart = echarts.init(container, null, { renderer: 'canvas', useDirtyRect: true });
    chartRef.current = chart;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && option) {
      chartRef.current.setOption(option);
    }
  }, [option]);

  return containerRef;
}
