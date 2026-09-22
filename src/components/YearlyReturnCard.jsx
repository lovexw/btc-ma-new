import React from 'react';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { formatAhr999, formatPercent, formatUsd, getAhr999Zone } from '../lib/btc';

export default function YearlyReturnCard({ item }) {
  return (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ height: 4, bgcolor: item.isPositive ? 'success.main' : 'error.main' }} />
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>
            {item.year}
          </Typography>
          <Chip
            icon={item.isPositive ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
            label={formatPercent(item.returnRate)}
            size="small"
            sx={{
              bgcolor: item.isPositive ? 'rgba(46, 125, 50, 0.08)' : 'rgba(198, 40, 40, 0.08)',
              color: item.isPositive ? 'success.main' : 'error.main',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
              '& .MuiChip-icon': { fontSize: 14 }
            }}
          />
        </Box>

        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
            买入价
          </Typography>
          <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>
            {formatUsd(item.buyPrice)}
          </Typography>
        </Box>
        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            AHR999
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: getAhr999Zone(item.ahr999).color }}>
            {formatAhr999(item.ahr999)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            {getAhr999Zone(item.ahr999).label}
          </Typography>
        </Box>
        <Box sx={{ mt: 0.75, pt: 0.75, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ color: item.isPositive ? 'success.main' : 'error.main', fontWeight: 700, fontSize: '0.75rem' }}
          >
            {item.isPositive ? '累计盈利' : '累计亏损'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {formatUsd(Math.abs(item.currentPrice - item.buyPrice), { decimals: 0 })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
