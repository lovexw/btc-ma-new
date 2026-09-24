import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ACCENT, PRICE_BAND_STEP } from '../lib/btc';
import PriceBandCards from './PriceBandCards';

const formatDays = (days) => days.toLocaleString('en-US');

function BandBars({ stats, currentBand }) {
  const maxShare = stats.reduce((m, s) => Math.max(m, s.share), 0);

  return (
    <Box component="div" role="img" aria-label="比特币价格区间停留天数分布图" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, sm: 0.75 } }}>
      {stats.map((band) => {
        const isCurrent = band.index === currentBand;
        const width = maxShare ? Math.max((band.share / maxShare) * 100, band.days > 0 ? 1.5 : 0) : 0;
        return (
          <Box
            key={band.index}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '58px 1fr', sm: '72px 1fr' },
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              py: 0.25,
              borderRadius: 1.5,
              ...(isCurrent && { bgcolor: 'rgba(255, 153, 0, 0.07)' })
            }}
            title={
              band.days > 0 && band.firstDate
                ? `${band.label}：${formatDays(band.days)} 天（${band.share.toFixed(1)}%）\n首次进入 ${band.firstDate}，最近一次 ${band.lastDate}`
                : `${band.label}：0 天`
            }
          >
            <Typography
              component="div"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.78rem' },
                fontWeight: isCurrent ? 800 : 600,
                color: isCurrent ? 'text.primary' : 'text.secondary',
                textAlign: 'right',
                whiteSpace: 'nowrap'
              }}
            >
              {band.label}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 }, minWidth: 0 }}>
              <Box
                sx={{
                  flex: 1,
                  height: { xs: 16, sm: 20 },
                  minWidth: 0,
                  bgcolor: 'rgba(102, 112, 133, 0.07)',
                  borderRadius: 1.5,
                  overflow: 'hidden'
                }}
              >
                {band.days > 0 && (
                  <Box
                    sx={{
                      width: `${width}%`,
                      height: '100%',
                      borderRadius: 1.5,
                      background: isCurrent
                        ? `linear-gradient(90deg, ${ACCENT} 0%, #FFB84D 100%)`
                        : 'linear-gradient(90deg, rgba(255, 153, 0, 0.78) 0%, rgba(255, 184, 77, 0.92) 100%)',
                      boxShadow: isCurrent ? `0 0 0 1.5px ${ACCENT}` : 'none',
                      transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                )}
              </Box>

              {isCurrent && (
                <Chip
                  label="现价在此"
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 153, 0, 0.12)', color: '#B36B00', fontWeight: 700, fontSize: '0.65rem', height: 20, flex: 'none', display: { xs: 'none', sm: 'inline-flex' } }}
                />
              )}

              <Box sx={{ width: { xs: 86, sm: 108 }, flex: 'none', textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Typography component="span" sx={{ fontWeight: 800, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                  {formatDays(band.days)}
                </Typography>
                <Typography component="span" sx={{ color: 'text.secondary', fontSize: { xs: '0.65rem', sm: '0.72rem' }, ml: 0.25 }}>
                  {' '}天
                </Typography>
                <Typography component="span" sx={{ color: 'text.secondary', fontSize: { xs: '0.65rem', sm: '0.72rem' }, ml: 0.75 }}>
                  {band.share.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * 比特币价格停留天数：按 step 美元区间（1 万或 5 千）统计每日价格分布。
 * mode = 'bar' 为横向条形图，'card' 为卡片网格，两种视图共用同一份统计数据。
 */
export default function PriceBandChart({ stats, currentPrice, latestDate, startDate, mode = 'bar', step = PRICE_BAND_STEP }) {
  const currentBand = useMemo(() => {
    if (currentPrice == null) return -1;
    const found = stats.find((s) => currentPrice >= s.low && currentPrice < s.high);
    return found ? found.index : -1;
  }, [stats, currentPrice]);
  const totalDays = useMemo(() => stats.reduce((sum, s) => sum + s.days, 0), [stats]);

  if (!stats.length) return null;

  return (
    <>
      {mode === 'card' ? (
        <PriceBandCards stats={stats} currentBand={currentBand} />
      ) : (
        <Paper
          elevation={0}
          sx={{ p: { xs: 1.5, sm: 2.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
        >
          <BandBars stats={stats} currentBand={currentBand} />
        </Paper>
      )}

      <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 1.5, px: 0.25, fontSize: '0.7rem', lineHeight: 1.6 }}>
        共 {formatDays(totalDays)} 天价格在 {step === PRICE_BAND_STEP ? '1 万' : '5 千'}美元以上（{startDate} ~ {latestDate}），区间宽 {step === PRICE_BAND_STEP ? '1 万' : '5 千'}美元，占比为各区间天数之比
        {mode === 'card' ? '；卡片内为该区间首次进入与最近出现的日期。' : '；悬停条形可查看首次进入日期。'}
      </Typography>
    </>
  );
}
