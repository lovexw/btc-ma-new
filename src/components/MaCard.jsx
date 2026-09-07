import React from 'react';
import { Box, Card, CardContent, Chip, Skeleton, Typography } from '@mui/material';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { formatPercent, formatUsd } from '../lib/btc';

export default function MaCard({ day, color, maValue, dailyChange, currentPrice }) {
  if (maValue == null || currentPrice == null) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2 }}>
          <Skeleton width="60%" />
          <Skeleton width="85%" height={32} sx={{ my: 0.75 }} />
          <Skeleton width="45%" />
        </CardContent>
      </Card>
    );
  }

  const diffPercent = ((currentPrice - maValue) / maValue) * 100;
  const isAbove = currentPrice > maValue;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, '&:last-child': { pb: { xs: 1.75, sm: 2.25 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flex: 'none' }} />
            <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
              MA{day}
            </Typography>
          </Box>
          {dailyChange != null && (
            <Chip
              icon={dailyChange >= 0 ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
              label={formatPercent(dailyChange)}
              size="small"
              sx={{
                bgcolor: dailyChange >= 0 ? 'rgba(46, 125, 50, 0.08)' : 'rgba(198, 40, 40, 0.08)',
                color: dailyChange >= 0 ? 'success.main' : 'error.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-icon': { fontSize: 14 }
              }}
            />
          )}
        </Box>

        <Typography
          component="div"
          sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.25rem' }, mb: 0.75, letterSpacing: '-0.01em' }}
        >
          {formatUsd(maValue, { decimals: 2 })}
        </Typography>

        <Typography
          variant="caption"
          component="div"
          sx={{ color: isAbove ? 'success.main' : 'error.main', fontWeight: 700, fontSize: '0.75rem' }}
        >
          {isAbove ? '▲' : '▼'} 现价{isAbove ? '高于' : '低于'}均线 {formatPercent(Math.abs(diffPercent), { sign: false })}
        </Typography>
      </CardContent>
    </Card>
  );
}
