import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  Box, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const MA_DAYS = [50, 200, 350, 700, 1000, 1400];
const MA_COLORS = {
  50: '#FF6B6B',    // 红色
  200: '#4ECDC4',   // 青色
  350: '#45B7D1',   // 蓝色
  700: '#FFA07A',   // 橙红色
  1000: '#98D8C8',  // 薄荷绿
  1400: '#B794F4'   // 紫色
};

const App = () => {
  const [data, setData] = useState([]);
  const [maVisible, setMaVisible] = useState(
    Object.fromEntries(MA_DAYS.map(day => [day, true]))
  );

  useEffect(() => {
    fetch('./btc-price.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const processedData = lines.slice(1).map(line => {
          const [date, price] = line.split(',');
          return {
            date: date.trim(),
            price: parseFloat(price.trim())
          };
        }).reverse();
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

  const getCurrentMAValue = (dayCount) => {
    if (data.length === 0) return null;
    const ma = calculateMA(dayCount);
    const lastValue = ma[ma.length - 1];
    return lastValue === '-' ? null : parseFloat(lastValue);
  };

  const getCurrentPrice = () => {
    if (data.length === 0) return null;
    return data[data.length - 1].price;
  };

  const getMAChange = (dayCount) => {
    if (data.length === 0) return null;
    const ma = calculateMA(dayCount);
    const current = parseFloat(ma[ma.length - 1]);
    const previous = parseFloat(ma[ma.length - 2]);
    if (isNaN(current) || isNaN(previous)) return null;
    const change = ((current - previous) / previous * 100).toFixed(2);
    return parseFloat(change);
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
        symbol: 'circle',
        symbolSize: 1,
        smooth: true,
        lineStyle: {
          color: '#1890ff',
          width: 3,
          shadowColor: 'rgba(24, 144, 255, 0.4)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ]
          }
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
          smooth: true,
          lineStyle: {
            color: MA_COLORS[day],
            width: 2
          },
          itemStyle: {
            color: MA_COLORS[day]
          }
        });
      }
    });

    return {
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        backgroundColor: 'rgba(50, 50, 50, 0.95)',
        borderColor: '#333',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 13
        },
        formatter: (params) => {
          let result = `<div style="padding: 8px;">`;
          result += `<div style="margin-bottom: 8px; font-weight: bold;">${params[0].axisValue}</div>`;
          params.forEach(param => {
            result += `<div style="margin: 4px 0;">
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>
              ${param.seriesName}: <strong>$${param.value !== '-' ? Number(param.value).toLocaleString() : '-'}</strong>
            </div>`;
          });
          result += `</div>`;
          return result;
        }
      },
      legend: {
        data: ['比特币价格', ...MA_DAYS.filter(day => maVisible[day]).map(day => `${day}日均线`)],
        top: 10,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
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
          bottom: 30,
          start: dataZoomState.start,
          end: dataZoomState.end,
          borderColor: '#ddd',
          fillerColor: 'rgba(24, 144, 255, 0.15)',
          handleStyle: {
            color: '#1890ff',
            borderColor: '#1890ff'
          },
          textStyle: {
            color: '#666'
          }
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: '价格 (USD)',
        nameTextStyle: {
          color: '#666',
          fontSize: 12
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#666',
          fontSize: 11,
          formatter: (value) => `$${(value / 1000).toFixed(0)}k`
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
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

  const renderMACard = (day) => {
    const maValue = getCurrentMAValue(day);
    const currentPrice = getCurrentPrice();
    const change = getMAChange(day);
    
    if (!maValue || !currentPrice) {
      return (
        <Card 
          elevation={3}
          sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${MA_COLORS[day]}15 0%, ${MA_COLORS[day]}05 100%)`,
            border: `2px solid ${MA_COLORS[day]}40`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 20px ${MA_COLORS[day]}30`
            }
          }}
        >
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              加载中...
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const isAbove = currentPrice > maValue;
    const percentDiff = ((currentPrice - maValue) / maValue * 100).toFixed(2);

    return (
      <Card 
        elevation={3}
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${MA_COLORS[day]}15 0%, ${MA_COLORS[day]}05 100%)`,
          border: `2px solid ${MA_COLORS[day]}40`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 20px ${MA_COLORS[day]}30`
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: MA_COLORS[day],
                fontSize: '1.1rem'
              }}
            >
              MA{day}
            </Typography>
            {change !== null && (
              <Chip
                icon={change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${change >= 0 ? '+' : ''}${change}%`}
                size="small"
                sx={{
                  backgroundColor: change >= 0 ? '#e8f5e9' : '#ffebee',
                  color: change >= 0 ? '#2e7d32' : '#c62828',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              mb: 1.5,
              color: '#333'
            }}
          >
            ${maValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: isAbove ? '#2e7d32' : '#c62828',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {isAbove ? '↑' : '↓'} {Math.abs(parseFloat(percentDiff))}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              vs 当前价格
            </Typography>
          </Box>

          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {isAbove ? '价格在均线上方' : '价格在均线下方'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      p: 4, 
      bgcolor: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        maxWidth: '1600px', 
        mx: 'auto',
        bgcolor: 'white',
        borderRadius: 3,
        p: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            比特币价格走势分析
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            实时追踪比特币价格趋势与多周期均线指标
          </Typography>
        </Box>

        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: '#fafafa', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
            均线显示设置
          </Typography>
          <FormGroup row sx={{ justifyContent: 'center', gap: 1 }}>
            {MA_DAYS.map(day => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    checked={maVisible[day]}
                    onChange={() => handleMAToggle(day)}
                    sx={{ 
                      color: MA_COLORS[day], 
                      '&.Mui-checked': { 
                        color: MA_COLORS[day]
                      } 
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    {day}日均线
                  </Typography>
                }
                sx={{
                  bgcolor: maVisible[day] ? `${MA_COLORS[day]}10` : 'transparent',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  border: `1px solid ${MA_COLORS[day]}40`,
                  m: 0.5
                }}
              />
            ))}
          </FormGroup>
        </Box>

        <Paper 
          elevation={2}
          sx={{ 
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #e0e0e0'
          }}
        >
          <ReactECharts 
            option={getOption()} 
            style={{ height: '550px' }} 
            notMerge={true} 
            opts={{ renderer: 'canvas' }}
            onEvents={{
              datazoom: onChartChange
            }}
          />
        </Paper>

        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
              color: '#333'
            }}
          >
            均线指标监控面板
          </Typography>
          <Grid container spacing={3}>
            {MA_DAYS.map(day => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={day}>
                {renderMACard(day)}
              </Grid>
            ))}
          </Grid>
        </Box>

        {data.length > 0 && (
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: '#f9fafb', 
            borderRadius: 2,
            border: '1px solid #e5e7eb'
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    当前价格
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1890ff', mt: 0.5 }}>
                    ${getCurrentPrice()?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    数据点数
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#52c41a', mt: 0.5 }}>
                    {data.length.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    最新日期
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#722ed1', mt: 0.5, fontSize: '1.5rem' }}>
                    {data[data.length - 1].date}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default App;
