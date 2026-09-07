import { useCallback, useEffect, useRef, useState } from 'react';
import { parseCsv } from '../lib/btc';

/**
 * 加载比特币每日价格 CSV，带加载中 / 错误 / 重试状态。
 */
export function useBtcData() {
  const [state, setState] = useState({ data: [], loading: true, error: null });
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}btc-price.csv`, {
        cache: 'no-cache'
      });
      if (!response.ok) throw new Error(`数据请求失败 (HTTP ${response.status})`);
      const data = parseCsv(await response.text());
      if (!data.length) throw new Error('价格数据为空');
      if (requestId !== requestIdRef.current) return;
      setState({ data, loading: false, error: null });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setState({ data: [], loading: false, error: err?.message || '未知错误' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, retry: load };
}
