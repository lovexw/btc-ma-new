import React, { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

import { theme } from './theme';
import { useBtcData } from './hooks/useBtcData';
import {
  MA_DAYS,
  MA_COLORS,
  buildPriceMap,
  computeMovingAverages,
  getDailyChange,
  getLatestValue,
  getYearlyInvestmentReturns
} from './lib/btc';

import Hero from './components/Hero';
import MaToggles from './components/MaToggles';
import PriceChart from './components/PriceChart';
import MaCard from './components/MaCard';
import YearlyReturnCard from './components/YearlyReturnCard';
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

  const mas = useMemo(() => (data.length ? computeMovingAverages(data) : null), [data]);
  const priceMap = useMemo(() => buildPriceMap(data), [data]);
  const yearlyReturns = useMemo(() => getYearlyInvestmentReturns(data, priceMap), [data, priceMap]);

  const currentPrice = data.length ? data[data.length - 1].price : null;

  const handleToggle = useCallback((day) => {
    setMaVisible((prev) => ({ ...prev, [day]: !prev[day] }));
  }, []);

  const handleShowAll = useCallback(() => {
    setMaVisible(Object.fromEntries(MA_DAYS.map((day) => [day, true])));
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

              <Section title="历年定投回测" subtitle={`假设自 2017 年起，每年在今日买入并持有至今（以最新数据日 ${data.length ? data[data.length - 1].date : ''} 为基准）`}>
                <Box
                  sx={{
                    display: 'grid',
                    gap: { xs: 1.5, sm: 2 },
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }
                  }}
                >
                  {loading && data.length === 0
                    ? Array.from({ length: 9 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={104} sx={{ borderRadius: 3 }} />
                      ))
                    : yearlyReturns.map((item) => <YearlyReturnCard key={item.year} item={item} />)}
                </Box>
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
