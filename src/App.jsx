import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, FormGroup, FormControlLabel, Checkbox, Typography, Paper, Grid } from '@mui/material';

const MA_DAYS = [30, 100, 200, 300, 500, 700];
const MA_COLORS = {
  30: '#FF4444',   // 鲜红色
  100: '#2196F3',  // 蓝色
  200: '#4CAF50',  // 绿色
  300: '#FFA726',  // 橙色
  500: '#E91E63',  // 粉色
  700: '#9C27B0'   // 紫色
};

const App = () => {
  const [data, setData] = useState([]);
  const [maVisible, setMaVisible] = useState(
    Object.fromEntries(MA_DAYS.map(day => [day, true]))
  );

  useEffect(() => {
    fetch('/btc-price.json')
      .then(response => response.json())
      .then(jsonData => {
        const processedData = jsonData.map(item => ({
          date: item['\ufeffdate'],
          price: parseFloat(item['btc price'])
        })).reverse();
        setData(processedData);
      });
  }, []);

  const calculateMA = (dayCount) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < dayCount - 1) {
        result.push('-');
        continue;
      }
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += data[i - j].price;
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  };

  const analyzeTrend = () => {
    if (data.length === 0) return null;

    const maValues = {};
    MA_DAYS.forEach(day => {
      const ma = calculateMA(day);
      maValues[day] = parseFloat(ma[ma.length - 1]);
    });

    const currentPrice = data[data.length - 1].price;
    const ma30 = maValues[30];
    const ma200 = maValues[200];

    // 计算均线斜率
    const calculateSlope = (day) => {
      const ma = calculateMA(day);
      const current = parseFloat(ma[ma.length - 1]);
      const previous = parseFloat(ma[ma.length - 2]);
      return ((current - previous) / previous * 100).toFixed(2);
    };

    const slopes = {};
    MA_DAYS.forEach(day => {
      slopes[day] = calculateSlope(day);
    });

    // 分析均线交叉
    const crossSignal = ma30 > ma200 ? '金叉买入' : '死叉卖出';

    // 分析价格与均线关系
    const priceAboveMA = MA_DAYS.every(day => currentPrice > maValues[day]);
    const priceBelowMA = MA_DAYS.every(day => currentPrice < maValues[day]);

    // 分析均线排列
    const bullishAlignment = MA_DAYS.every((day, index) => {
      if (index === 0) return true;
      return maValues[day] < maValues[MA_DAYS[index - 1]];
    });

    const bearishAlignment = MA_DAYS.every((day, index) => {
      if (index === 0) return true;
      return maValues[day] > maValues[MA_DAYS[index - 1]];
    });

    // 分析均线密集程度
    const maRange = Math.max(...Object.values(maValues)) - Math.min(...Object.values(maValues));
    const maRangePercent = (maRange / currentPrice * 100).toFixed(2);
    const maCongestion = maRangePercent < 5 ? '均线密集' : '均线分散';

    // 趋势强度分析
    const trendStrength = () => {
      const ma30Slope = parseFloat(slopes[30]);
      const ma200Slope = parseFloat(slopes[200]);
      
      if (ma30Slope > 1 && ma200Slope > 0.3) return '强势上涨';
      if (ma30Slope < -1 && ma200Slope < -0.3) return '强势下跌';
      return '趋势平缓';
    };

    return {
      crossSignal,
      pricePosition: priceAboveMA ? '强势上涨' : priceBelowMA ? '强势下跌' : '震荡整理',
      alignment: bullishAlignment ? '多头排列' : bearishAlignment ? '空头排列' : '无明显排列',
      maCongestion,
      slopes,
      trendStrength: trendStrength(),
      trend: bullishAlignment ? '可能大涨' : bearishAlignment ? '可能大跌' : '观望'
    };
  };

  const [dataZoomState, setDataZoomState] = useState({ start: 0, end: 100 });

  const getOption = () => {
    const dates = data.map(item => item.date);
    const prices = data.map(item => item.price);

    const series = [
      {
        name: '比特币价格',
        type: 'line',
        data: prices,
        symbol: 'none',
        lineStyle: {
          color: '#1890ff'
        }
      }
    ];

    // 添加均线
    MA_DAYS.forEach(day => {
      if (maVisible[day]) {
        series.push({
          name: `${day}日均线`,
          type: 'line',
          data: calculateMA(day),
          symbol: 'none',
          lineStyle: {
            color: MA_COLORS[day]
          },
          itemStyle: {
            color: MA_COLORS[day]
          }
        });
      }
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside',
          start: dataZoomState.start,
          end: dataZoomState.end
        },
        {
          show: true,
          type: 'slider',
          bottom: 10,
          start: dataZoomState.start,
          end: dataZoomState.end
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '价格 (USD)',
        splitLine: {
          show: true
        }
      },
      series
    };
  };

  const handleMAToggle = (day) => {
    setMaVisible(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const onChartChange = (params) => {
    if (params.type === 'datazoom') {
      setDataZoomState({
        start: params.start,
        end: params.end
      });
    }
  };

  const trendAnalysis = analyzeTrend();

  const renderAnalysis = () => {
    if (!trendAnalysis) return <Typography>加载中...</Typography>;

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography>均线交叉: {trendAnalysis.crossSignal}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>价格位置: {trendAnalysis.pricePosition}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>均线排列: {trendAnalysis.alignment}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>均线密集度: {trendAnalysis.maCongestion}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>趋势强度: {trendAnalysis.trendStrength}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle1">
            建议操作: {trendAnalysis.trend}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderDeepSeekAnalysis = () => {
    if (!trendAnalysis) return <Typography>加载中...</Typography>;

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography>均线斜率:</Typography>
          {Object.entries(trendAnalysis.slopes).map(([day, slope]) => (
            <Typography key={day} sx={{ pl: 2 }}>
              {day}日均线: {slope}%
            </Typography>
          ))}
        </Grid>
        <Grid item xs={12}>
          <Typography>趋势分析:</Typography>
          <Typography sx={{ pl: 2 }}>
            {trendAnalysis.pricePosition === '强势上涨' && '价格站上所有均线，多头强势'}
            {trendAnalysis.pricePosition === '强势下跌' && '价格跌破所有均线，空头强势'}
            {trendAnalysis.pricePosition === '震荡整理' && '价格在均线间震荡，等待方向选择'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle1">
            AI建议: 
            {trendAnalysis.trendStrength === '强势上涨' && '可以考虑逢低买入'}
            {trendAnalysis.trendStrength === '强势下跌' && '建议观望或者谨慎做空'}
            {trendAnalysis.trendStrength === '趋势平缓' && '建议等待更明确的方向'}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderQianwenAnalysis = () => {
    if (!trendAnalysis) return <Typography>加载中...</Typography>;

    // 计算均线趋势强度
    const calculateTrendStrength = () => {
      const slopes = trendAnalysis.slopes;
      const shortTermStrength = parseFloat(slopes[30]);
      const midTermStrength = parseFloat(slopes[200]);
      const longTermStrength = parseFloat(slopes[500]);

      if (shortTermStrength > 1.5 && midTermStrength > 0.5 && longTermStrength > 0.2) {
        return '强势上涨 - 多头趋势确立';
      } else if (shortTermStrength < -1.5 && midTermStrength < -0.5 && longTermStrength < -0.2) {
        return '强势下跌 - 空头趋势确立';
      } else if (Math.abs(shortTermStrength) < 0.5 && Math.abs(midTermStrength) < 0.3) {
        return '趋势平缓 - 建议观望';
      } else if (shortTermStrength > 0 && midTermStrength > 0) {
        return '温和上涨 - 逢低买入';
      } else {
        return '温和下跌 - 谨慎观望';
      }
    };

    // 分析均线密集程度
    const analyzeMACongestion = () => {
      const maValues = MA_DAYS.map(day => {
        const ma = calculateMA(day);
        return parseFloat(ma[ma.length - 1]);
      });
      const maxMA = Math.max(...maValues);
      const minMA = Math.min(...maValues);
      const currentPrice = data[data.length - 1].price;
      const range = ((maxMA - minMA) / currentPrice) * 100;

      if (range < 3) return '极度密集 - 可能突破';
      if (range < 5) return '中度密集 - 蓄势待发';
      if (range < 10) return '分散 - 趋势明确';
      return '高度分散 - 波动剧烈';
    };

    // 分析突破信号
    const analyzeBreakoutSignals = () => {
      const currentPrice = data[data.length - 1].price;
      const ma30 = parseFloat(calculateMA(30)[calculateMA(30).length - 1]);
      const ma200 = parseFloat(calculateMA(200)[calculateMA(200).length - 1]);
      const ma500 = parseFloat(calculateMA(500)[calculateMA(500).length - 1]);

      const signals = [];
      if (currentPrice > ma500 && ma30 > ma200) {
        signals.push('长期突破 - 牛市信号');
      }
      if (currentPrice < ma500 && ma30 < ma200) {
        signals.push('长期跌破 - 熊市信号');
      }
      if (Math.abs((currentPrice - ma200) / ma200) < 0.02) {
        signals.push('关键位置 - 200日均线争夺');
      }
      return signals.length > 0 ? signals.join('\n') : '无明显突破信号';
    };

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography>趋势强度分析:</Typography>
          <Typography sx={{ pl: 2, color: 'primary.main' }}>
            {calculateTrendStrength()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>均线密集度分析:</Typography>
          <Typography sx={{ pl: 2 }}>
            {analyzeMACongestion()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>突破信号分析:</Typography>
          <Typography sx={{ pl: 2 }} style={{ whiteSpace: 'pre-line' }}>
            {analyzeBreakoutSignals()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle1">
            AI建议: 
            {trendAnalysis.pricePosition === '强势上涨' && '多头趋势确立，可分批建仓'}
            {trendAnalysis.pricePosition === '强势下跌' && '空头趋势确立，建议观望'}
            {trendAnalysis.pricePosition === '震荡整理' && '等待趋势确认，可少量试探'}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderDouBaoAnalysis = () => {
    if (!trendAnalysis) return <Typography>加载中...</Typography>;

    // 分析均线排列
    const analyzeMAAlignment = () => {
      const maValues = MA_DAYS.map(day => {
        const ma = calculateMA(day);
        return parseFloat(ma[ma.length - 1]);
      });
      
      const isAscending = maValues.every((val, i) => i === 0 || val <= maValues[i - 1]);
      const isDescending = maValues.every((val, i) => i === 0 || val >= maValues[i - 1]);
      
      if (isAscending) return '多头排列 - 上升趋势强劲';
      if (isDescending) return '空头排列 - 下降趋势明显';
      return '均线交织 - 趋势不明';
    };

    // 分析黄金/死亡交叉
    const analyzeCrossSignals = () => {
      const ma30 = calculateMA(30);
      const ma200 = calculateMA(200);
      const currentMA30 = parseFloat(ma30[ma30.length - 1]);
      const prevMA30 = parseFloat(ma30[ma30.length - 2]);
      const currentMA200 = parseFloat(ma200[ma200.length - 1]);
      const prevMA200 = parseFloat(ma200[ma200.length - 2]);

      if (prevMA30 <= prevMA200 && currentMA30 > currentMA200) {
        return '形成黄金交叉 - 可能上涨';
      }
      if (prevMA30 >= prevMA200 && currentMA30 < currentMA200) {
        return '形成死亡交叉 - 注意风险';
      }
      return '无明显交叉信号';
    };

    // 分析700日均线支撑/压力
    const analyzeLongTermMA = () => {
      const currentPrice = data[data.length - 1].price;
      const ma700 = parseFloat(calculateMA(700)[calculateMA(700).length - 1]);
      const priceDeviation = ((currentPrice - ma700) / ma700) * 100;

      if (priceDeviation > 5) {
        return '价格远高于700日均线 - 注意回调风险';
      }
      if (priceDeviation < -5) {
        return '价格远低于700日均线 - 可能超跌';
      }
      if (Math.abs(priceDeviation) <= 2) {
        return '价格在700日均线附近徘徊 - 关键支撑压力位';
      }
      return '价格与700日均线保持适中距离';
    };

    // 分析均线斜率趋势强度
    const analyzeSlopeStrength = () => {
      const slopes = trendAnalysis.slopes;
      const shortTermSlope = parseFloat(slopes[30]);
      const longTermSlope = parseFloat(slopes[700]);

      if (shortTermSlope > 2) {
        return '短期均线斜率陡峭 - 上涨动能强';
      }
      if (shortTermSlope < -2) {
        return '短期均线斜率陡峭 - 下跌动能强';
      }
      if (Math.abs(shortTermSlope) < 0.5 && Math.abs(longTermSlope) < 0.2) {
        return '均线斜率平缓 - 趋势动能弱';
      }
      return '均线斜率适中 - 趋势延续中';
    };

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography>均线排列分析:</Typography>
          <Typography sx={{ pl: 2 }}>
            {analyzeMAAlignment()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>均线交叉信号:</Typography>
          <Typography sx={{ pl: 2 }}>
            {analyzeCrossSignals()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>700日均线分析:</Typography>
          <Typography sx={{ pl: 2 }}>
            {analyzeLongTermMA()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>趋势强度分析:</Typography>
          <Typography sx={{ pl: 2 }}>
            {analyzeSlopeStrength()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography color="primary" variant="subtitle1">
            豆包建议: 
            {trendAnalysis.alignment === '多头排列' && '均线多头排列，可以考虑逢低买入'}
            {trendAnalysis.alignment === '空头排列' && '均线空头排列，建议观望或轻仓'}
            {trendAnalysis.alignment === '无明显排列' && '等待趋势明朗后再做决策'}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        比特币价格走势图
      </Typography>
      <Box sx={{ mb: 2 }}>
        <FormGroup row sx={{ justifyContent: 'center' }}>
          {MA_DAYS.map(day => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={maVisible[day]}
                  onChange={() => handleMAToggle(day)}
                  sx={{ color: MA_COLORS[day], '&.Mui-checked': { color: MA_COLORS[day] } }}
                />
              }
              label={`${day}日均线`}
            />
          ))}
        </FormGroup>
      </Box>
      <ReactECharts 
        option={getOption()} 
        style={{ height: '400px' }} 
        notMerge={true} 
        opts={{ renderer: 'svg' }}
        onEvents={{
          datazoom: onChartChange
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <Paper sx={{ p: 2, width: '25%' }}>
          <Typography variant="h6" gutterBottom align="center">
            Grok策略分析
          </Typography>
          {renderAnalysis()}
        </Paper>
        <Paper sx={{ p: 2, width: '25%' }}>
          <Typography variant="h6" gutterBottom align="center">
            DeepSeek策略分析
          </Typography>
          {renderDeepSeekAnalysis()}
        </Paper>
        <Paper sx={{ p: 2, width: '25%' }}>
          <Typography variant="h6" gutterBottom align="center">
            阿里千问策略分析
          </Typography>
          {renderQianwenAnalysis()}
        </Paper>
        <Paper sx={{ p: 2, width: '25%' }}>
          <Typography variant="h6" gutterBottom align="center">
            豆包策略分析
          </Typography>
          {renderDouBaoAnalysis()}
        </Paper>
      </Box>
    </Box>
  );
};

export default App;