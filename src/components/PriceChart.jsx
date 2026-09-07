import React, { useMemo } from 'react';
import { Box, Paper, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { buildChartOption } from '../lib/chartOption';
import { useECharts } from '../hooks/useECharts';

export default function PriceChart({ data, mas, maVisible }) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const height = isMobile ? 340 : 520;

  const option = useMemo(
    () => (data.length && mas ? buildChartOption({ data, mas, maVisible, isMobile }) : null),
    [data, mas, maVisible, isMobile]
  );

  const containerRef = useECharts(option);
  const ready = Boolean(option);

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 0.5, sm: 1.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
    >
      <Box component="section" aria-label="比特币价格与均线走势图" sx={{ height, minWidth: 0, position: 'relative' }}>
        <Box ref={containerRef} sx={{ height: '100%', width: '100%' }} />
        {!ready && <Skeleton variant="rounded" sx={{ position: 'absolute', inset: 0, borderRadius: 3 }} />}
      </Box>
    </Paper>
  );
}
