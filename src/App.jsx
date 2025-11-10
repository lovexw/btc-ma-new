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

const HAB_COLORS = {
  primary: '#1A1A1A',
  accent: '#FF9900',
  background: '#FAFAFA',
  text: '#222222',
  border: '#E0E0E0',
  white: '#FFFFFF'
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
        smooth: 0.2,
        sampling: 'lttb',
        lineStyle: {
          color: HAB_COLORS.accent,
          width: 2.5,
          shadowColor: 'rgba(255, 153, 0, 0.25)',
          shadowBlur: 8,
          shadowOffsetY: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 153, 0, 0.2)' },
              { offset: 1, color: 'rgba(255, 153, 0, 0.02)' }
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
          smooth: 0.15,
          sampling: 'lttb',
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
      backgroundColor: HAB_COLORS.white,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: HAB_COLORS.accent,
            opacity: 0.6
          },
          lineStyle: {
            color: HAB_COLORS.accent,
            type: 'dashed',
            opacity: 0.5
          }
        },
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        borderColor: HAB_COLORS.border,
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
          color: HAB_COLORS.text
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
          borderColor: HAB_COLORS.border,
          fillerColor: 'rgba(255, 153, 0, 0.12)',
          handleStyle: {
            color: HAB_COLORS.accent,
            borderColor: HAB_COLORS.accent,
            shadowColor: 'rgba(255, 153, 0, 0.3)',
            shadowBlur: 4
          },
          textStyle: {
            color: HAB_COLORS.text
          },
          emphasis: {
            handleStyle: {
              shadowColor: 'rgba(255, 153, 0, 0.5)',
              shadowBlur: 6
            }
          }
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: {
          lineStyle: {
            color: HAB_COLORS.border
          }
        },
        axisLabel: {
          color: HAB_COLORS.text,
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
          color: HAB_COLORS.text,
          fontSize: 12,
          fontWeight: 600
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: HAB_COLORS.text,
          fontSize: 11,
          formatter: (value) => `${(value / 1000).toFixed(0)}k`
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: HAB_COLORS.border,
            type: 'dashed',
            opacity: 0.6
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
          elevation={0}
          sx={{ 
            height: '100%',
            bgcolor: HAB_COLORS.white,
            border: `1px solid ${HAB_COLORS.border}`,
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              borderColor: HAB_COLORS.accent
            }
          }}
        >
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: HAB_COLORS.text }} gutterBottom>
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
        elevation={0}
        sx={{ 
          height: '100%',
          bgcolor: HAB_COLORS.white,
          border: `1px solid ${HAB_COLORS.border}`,
          borderLeft: `4px solid ${MA_COLORS[day]}`,
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            borderLeftWidth: '5px'
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: HAB_COLORS.primary,
                fontSize: '1rem'
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
                  backgroundColor: change >= 0 ? 'rgba(46, 125, 50, 0.08)' : 'rgba(198, 40, 40, 0.08)',
                  color: change >= 0 ? '#2e7d32' : '#c62828',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  border: `1px solid ${change >= 0 ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)'}`
                }}
              />
            )}
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              mb: 1.5,
              color: HAB_COLORS.primary
            }}
          >
            ${maValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
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
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: HAB_COLORS.text, opacity: 0.7 }}>
              vs 当前价格
            </Typography>
          </Box>

          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${HAB_COLORS.border}` }}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: HAB_COLORS.text, opacity: 0.8 }}>
              {isAbove ? '价格在均线上方' : '价格在均线下方'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      bgcolor: HAB_COLORS.background,
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        maxWidth: '1600px', 
        mx: 'auto',
        bgcolor: HAB_COLORS.white,
        borderRadius: '16px',
        p: { xs: 3, sm: 4, md: 5 },
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${HAB_COLORS.border}`
      }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              color: HAB_COLORS.primary,
              mb: 1.5,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            比特币价格走势分析
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: HAB_COLORS.text,
              opacity: 0.7,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            实时追踪比特币价格趋势与多周期均线指标
          </Typography>
        </Box>

        <Box sx={{ 
          mb: 4, 
          p: 3, 
          bgcolor: HAB_COLORS.background, 
          borderRadius: '12px',
          border: `1px solid ${HAB_COLORS.border}`
        }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 2, 
              fontWeight: 700,
              color: HAB_COLORS.primary,
              fontSize: '0.95rem'
            }}
          >
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
                      },
                      '&:hover': {
                        bgcolor: `${MA_COLORS[day]}15`
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 500,
                    color: HAB_COLORS.text
                  }}>
                    {day}日均线
                  </Typography>
                }
                sx={{
                  bgcolor: maVisible[day] ? HAB_COLORS.white : 'transparent',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                  border: `2px solid ${maVisible[day] ? MA_COLORS[day] : HAB_COLORS.border}`,
                  m: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: MA_COLORS[day],
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 8px ${MA_COLORS[day]}20`
                  }
                }}
              />
            ))}
          </FormGroup>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            mb: 5,
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${HAB_COLORS.border}`,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
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

        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: HAB_COLORS.primary,
              fontSize: { xs: '1.3rem', sm: '1.5rem' }
            }}
          >
            均线指标监控面板
          </Typography>
          <Grid container spacing={2.5}>
            {MA_DAYS.map(day => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={day}>
                {renderMACard(day)}
              </Grid>
            ))}
          </Grid>
        </Box>

        {data.length > 0 && (
          <Box sx={{ 
            mt: 5, 
            p: 4, 
            bgcolor: HAB_COLORS.background, 
            borderRadius: '12px',
            border: `1px solid ${HAB_COLORS.border}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: HAB_COLORS.white,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.8rem',
                      color: HAB_COLORS.text,
                      opacity: 0.7,
                      fontWeight: 500
                    }}
                  >
                    当前价格
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: HAB_COLORS.accent, 
                      mt: 1,
                      fontSize: { xs: '1.8rem', sm: '2rem' }
                    }}
                  >
                    ${getCurrentPrice()?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: HAB_COLORS.white,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.8rem',
                      color: HAB_COLORS.text,
                      opacity: 0.7,
                      fontWeight: 500
                    }}
                  >
                    数据点数
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: HAB_COLORS.primary, 
                      mt: 1,
                      fontSize: { xs: '1.8rem', sm: '2rem' }
                    }}
                  >
                    {data.length.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: HAB_COLORS.white,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.8rem',
                      color: HAB_COLORS.text,
                      opacity: 0.7,
                      fontWeight: 500
                    }}
                  >
                    最新日期
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: HAB_COLORS.primary, 
                      mt: 1, 
                      fontSize: { xs: '1.3rem', sm: '1.5rem' }
                    }}
                  >
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
