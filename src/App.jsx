import React, { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

import { theme } from './theme';
import { useBtcData } from './hooks/useBtcData';
import {
  MA_DAYS,
  MA_COLORS,
  PRICE_BAND_STEP,
  buildPriceMap,
  computeMovingAverages,
  getDailyChange,
  getLatestValue,
  getYearlyInvestmentReturns,
  getPriceBandStats
} from './lib/btc';

import Hero from './components/Hero';
import MaToggles from './components/MaToggles';
import PriceChart from './components/PriceChart';
import MaCard from './components/MaCard';
import YearlyReturnCard from './components/YearlyReturnCard';
import PriceBandChart from './components/PriceBandChart';
import Footer from './components/Footer';

function Section({ title, subtitle, action, children }) {
  return (
    <Box component="section" aria-label={title}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography
            component="h2"
            variant="h6"
            sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.3rem'}, pl: 1.25, borderLeft: 4, borderColor: 'primary.main', lineHeight: 1.3 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 0.5, pl: 1.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}

const App = () => {
  const { data, loading, error, retry } = useBtcData();
  const [maVisible, setMaVisible] = useState(() => Object.fromEntries(MA_DAYS.map((day) => [day, true])));
  const [bandMode, setBandMode] = useState('bar');

  const mas = useMemo(() => (data.length ? computeMovingAverages(data) : null), [data]);
  const priceMap = useMemo(() => buildPriceMap(data), [data]);
  const yearlyReturns = useMemo(() => getYearlyInvestmentReturns(data, priceMap), [data, priceMap]);
  // 只统计 1 万美元以上区间，占比基于纳入统计的天数计算
  const priceBandStats = useMemo(
    () => getPriceBandStats(data, PRICE_BAND_STEP, { minPrice: PRICE_BAND_STEP }),
    [data]
  );

  const currentPrice = data.length ? data[data.length - 1].price : null;

  const handleToggle = useCallback((day) => {
    setMaVisible((prev) => ({ ...prev, [day]: !prev[day] }));
  }, []);

  const handleShowAll = useCallback(() => {
    setMaVisible(Object.fromEntries(MA_DAYS.map((day) => [day, true])));
  }, []);

  const handleBandMode = useCallback((_, value) => {
    if (value) setBandMode(value);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: { xs: '100dvh', sm: '100vh' },
          bgcolor: 'background.default',
          px: { xs: 1.5, sm: 3 },
          py: { xs: 2, sm: 4 }
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0.5, sm: 0 }, display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 3.5 } }}>
          {error ? (
            <Alert
              severity="error"
              variant="outlined"
              action={
                <Button color="inherit" size="small" onClick={retry}>
                  重试
                </Button>
              }
              sx={{ bgcolor: 'background.paper', borderRadius: 3 }}
            >
              <AlertTitle>数据加载失败</AlertTitle>
              {error}，请检查网络后重试。
            </Alert>
          ) : (
            <>
              <Hero data={data} loading={loading} />

              <Section title="价格与均线走势" subtitle="拖动或双指缩放查看不同时间范围，点击均线开关控制显示">
                <PriceChart data={data} mas={mas} maVisible={maVisible} />
              </Section>

              <Section title="均线显示">
                <MaToggles maVisible={maVisible} onToggle={handleToggle} onShowAll={handleShowAll} />
              </Section>

              <Section title="均线指标监控" subtitle="各周期均线当前值、日环比涨跌与现价偏离程度">
                <Box
                  sx={{
                    display: 'grid',
                    gap: { xs: 1.5, sm: 2 },
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', xl: 'repeat(7, 1fr)' }
                  }}
                >
                  {MA_DAYS.map((day) => (
                    <MaCard
                      key={day}
                      day={day}
                      color={MA_COLORS[day]}
                      maValue={mas ? getLatestValue(mas[day]) : null}
                      dailyChange={mas ? getDailyChange(mas[day]) : null}
                      currentPrice={currentPrice}
                    />
                  ))}
                </Box>
              </Section>

              <Section title="历年定投回测" subtitle={`假设自 2016 年起，每年在今日买入并持有至今（以最新数据日 ${data.length ? data[data.length - 1].date : ''} 为基准）`}>
                <Box
                  sx={{
                    display: 'grid',
                    gap: { xs: 1.5, sm: 2 },
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }
                  }}
                >
                  {loading && data.length === 0
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={104} sx={{ borderRadius: 3 }} />
                      ))
                    : yearlyReturns.map((item) => <YearlyReturnCard key={item.year} item={item} />)}
                </Box>
              </Section>

              <Section
                title="价格区间停留天数"
                subtitle="比特币价格在 1 万美元以上各 1 万美元区间的停留天数，一眼看懂价格都去过哪儿"
                action={
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={bandMode}
                    onChange={handleBandMode}
                    aria-label="展示方式切换"
                    sx={{ bgcolor: 'background.paper', borderRadius: 2.5, '& .MuiToggleButton-root': { borderRadius: '10px !important', px: 1.5, py: 0.4, fontWeight: 700, fontSize: '0.75rem' } }}
                  >
                    <ToggleButton value="bar" aria-label="条形图视图">条形</ToggleButton>
                    <ToggleButton value="card" aria-label="卡片视图">卡片</ToggleButton>
                  </ToggleButtonGroup>
                }
              >
                {loading && data.length === 0 ? (
                  bandMode === 'card' ? (
                    <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' } }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={124} sx={{ borderRadius: 3 }} />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'grid', gap: 1 }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={22} sx={{ borderRadius: 1.5 }} />
                      ))}
                    </Box>
                  )
                ) : (
                  <PriceBandChart
                    stats={priceBandStats}
                    currentPrice={currentPrice}
                    startDate={data.length ? data[0].date : ''}
                    latestDate={data.length ? data[data.length - 1].date : ''}
                    mode={bandMode}
                  />
                )}
              </Section>
            </>
          )}
        </Container>
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default App;
