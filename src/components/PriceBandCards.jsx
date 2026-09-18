import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { ACCENT } from '../lib/btc';

const formatDays = (days) => days.toLocaleString('en-US');

/**
 * 价格区间停留天数的卡片视图：每个区间一张卡片，
 * 展示区间标签、停留天数、占比与首次/最近出现的日期。
 */
export default function PriceBandCards({ stats, currentBand }) {
  return (
    <Box
      component="div"
      role="img"
      aria-label="比特币价格区间停留天数卡片"
      sx={{
        display: 'grid',
        gap: { xs: 1.5, sm: 2 },
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' }
      }}
    >
      {stats.map((band) => {
        const isCurrent = band.index === currentBand;
        return (
          <Card
            key={band.index}
            sx={{ height: '100%', ...(isCurrent && { boxShadow: `0 0 0 2px ${ACCENT}, 0 1px 3px rgba(16, 24, 40, 0.06)` }) }}
          >
            <Box sx={{ height: 4, bgcolor: isCurrent ? ACCENT : 'rgba(255, 153, 0, 0.35)' }} />
            <CardContent sx={{ p: { xs: 1.5, sm: 1.75 }, '&:last-child': { pb: { xs: 1.5, sm: 1.75 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, mb: 0.75, minHeight: 22 }}>
                <Typography
                  component="h3"
                  sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: isCurrent ? '#B36B00' : 'text.primary' }}
                >
                  {band.label}
                </Typography>
                {isCurrent && (
                  <Chip
                    label="现价在此"
                    size="small"
                    sx={{ bgcolor: 'rgba(255, 153, 0, 0.12)', color: '#B36B00', fontWeight: 700, fontSize: '0.65rem', height: 20, flex: 'none' }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.3rem' }, letterSpacing: '-0.01em' }}>
                  {formatDays(band.days)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  天
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, ml: 'auto', fontSize: '0.72rem' }}
                >
                  {band.share.toFixed(1)}%
                </Typography>
              </Box>

              {band.firstDate && (
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: 'text.secondary', fontSize: '0.65rem', mt: 0.75, pt: 0.75, borderTop: '1px dashed', borderColor: 'divider', lineHeight: 1.6 }}
                >
                  首次 {band.firstDate}
                  <br />
                  最近 {band.lastDate}
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
