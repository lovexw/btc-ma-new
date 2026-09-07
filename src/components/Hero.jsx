import React from 'react';
import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import { formatUsd } from '../lib/btc';

const StatItem = ({ label, value, loading, valueSx, sx }) => (
  <Box sx={{ minWidth: 0, ...sx }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
      {label}
    </Typography>
    {loading ? (
      <Skeleton width={96} height={34} />
    ) : (
      <Typography component="div" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, lineHeight: 1.25, ...valueSx }}>
        {value}
      </Typography>
    )}
  </Box>
);

export default function Hero({ data, loading }) {
  const latest = data.length ? data[data.length - 1] : null;
  const earliest = data.length ? data[0] : null;

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ height: 4, background: 'linear-gradient(90deg, #FF9900 0%, #FFB84D 45%, #4ECDC4 100%)' }} />
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 44, sm: 52 },
              height: { xs: 44, sm: 52 },
              borderRadius: '50%',
              flex: 'none',
              background: 'linear-gradient(135deg, #FF9900, #F7931A)',
              boxShadow: '0 4px 14px rgba(255, 153, 0, 0.35)'
            }}
          >
            <CurrencyBitcoinRoundedIcon sx={{ color: '#fff', fontSize: { xs: 26, sm: 32 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" variant="h1" sx={{ fontSize: { xs: '1.45rem', sm: '2rem', md: '2.4rem' }, lineHeight: 1.2 }}>
              比特币价格与均线分析
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 0.5, fontSize: { xs: '0.82rem', sm: '0.95rem' } }}>
              50 ~ 2411 日长周期均线走势 · 历年定投回测 · 数据每日自动更新
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 5, md: 8 }}
          sx={{ mt: { xs: 2.5, sm: 3.5 }, pt: { xs: 2, sm: 3 }, borderTop: '1px dashed', borderColor: 'divider', flexWrap: 'wrap', rowGap: 2 }}
        >
          <StatItem
            label="最新价格 (USD)"
            value={formatUsd(latest?.price)}
            loading={loading}
            valueSx={{ color: 'primary.main', fontSize: { xs: '1.45rem', sm: '1.8rem' } }}
          />
          <StatItem label="最新日期" value={latest?.date ?? '—'} loading={loading} />
          <StatItem
            label="历史数据"
            value={loading ? undefined : `${data.length.toLocaleString('en-US')} 天`}
            loading={loading}
          />
          <StatItem
            label="数据起点"
            value={earliest?.date ?? '—'}
            loading={loading}
            sx={{ display: { xs: 'none', md: 'block' } }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
