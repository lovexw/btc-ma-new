import pandas as pd
import requests
from datetime import datetime, timedelta
import pytz
import sys

def get_btc_price():
    try:
        # 获取前一天的日期
        tz = pytz.timezone('Asia/Shanghai')
        yesterday = datetime.now(tz) - timedelta(days=1)
        date = yesterday.strftime('%Y-%m-%d')
        
        # 使用 CoinGecko API 获取比特币价格
        url = f"https://api.coingecko.com/api/v3/coins/bitcoin/history?date={date}"
        response = requests.get(url, timeout=30)  # 添加超时设置
        response.raise_for_status()  # 检查响应状态
        
        data = response.json()
        if 'market_data' not in data or 'current_price' not in data['market_data']:
            raise ValueError("Invalid API response format")
            
        price = data['market_data']['current_price']['usd']
        
        # 读取现有的 CSV 文件
        csv_path = '../public/btc-price.csv'
        df = pd.read_csv(csv_path)
        
        # 检查是否已存在该日期的数据
        if date in df['Date'].values:
            print(f"Data for {date} already exists")
            return
            
        # 创建新的数据行
        new_row = pd.DataFrame({
            'Date': [date],
            'Price': [price]
        })
        
        # 添加新数据并按日期排序
        df = pd.concat([df, new_row], ignore_index=True)
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.sort_values('Date')
        
        # 保存更新后的数据
        df.to_csv(csv_path, index=False)
        print(f"Successfully updated BTC price for {date}: ${price}")
        
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    get_btc_price()