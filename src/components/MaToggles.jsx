import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { MA_DAYS, MA_COLORS } from '../lib/btc';

export default function MaToggles({ maVisible, onToggle, onShowAll }) {
  const allVisible = MA_DAYS.every((day) => maVisible[day]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      {MA_DAYS.map((day) => {
        const visible = maVisible[day];
        return (
          <Tooltip key={day} title={`${day}日简单移动平均线`} arrow>
            <Chip
              label={
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                  <Box
                    component="span"
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: visible ? '#fff' : MA_COLORS[day], flex: 'none' }}
                  />
                  MA{day}
                </Box>
              }
              onClick={() => onToggle(day)}
              aria-pressed={visible}
              aria-label={`${visible ? '隐藏' : '显示'} ${day}日均线`}
              size="medium"
              clickable
              sx={{
                borderWidth: 1.5,
                borderColor: visible ? MA_COLORS[day] : '#D0D5DD',
                bgcolor: visible ? MA_COLORS[day] : 'transparent',
                color: visible ? '#fff' : 'text.secondary',
                fontWeight: 700,
                fontSize: '0.8rem',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  bgcolor: visible ? MA_COLORS[day] : `${MA_COLORS[day]}14`,
                  borderColor: MA_COLORS[day],
                  color: visible ? '#fff' : MA_COLORS[day]
                }
              }}
            />
          </Tooltip>
        );
      })}
      {!allVisible && (
        <Chip
          label="全部显示"
          onClick={onShowAll}
          size="medium"
          variant="outlined"
          sx={{ borderStyle: 'dashed', color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}
        />
      )}
    </Box>
  );
}
