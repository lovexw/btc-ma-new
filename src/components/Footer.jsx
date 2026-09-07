import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ pb: { xs: 3, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
        <Typography variant="caption" component="p" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
          价格数据每日自动更新，仅供学习参考，不构成任何投资建议。
        </Typography>
        <Typography variant="caption" component="p" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
          作者：
          <Box
            component="a"
            href="https://www.xiaowuleyi.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'text.secondary', textDecoration: 'underline', textUnderlineOffset: 2, mx: 0.25 }}
          >
            小吴乐意
          </Box>
          ·
          <Box
            component="a"
            href={`${import.meta.env.BASE_URL}btc-price.csv`}
            sx={{ color: 'text.secondary', textDecoration: 'underline', textUnderlineOffset: 2, mx: 0.5 }}
          >
            下载数据 (CSV)
          </Box>
        </Typography>
      </Container>
    </Box>
  );
}
