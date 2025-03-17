import pandas as pd
import requests
from datetime import datetime, timedelta
import pytz
import sys
import os

def get_btc_price():
    try:
        # 使用实时价格 API 替代历史价格 API
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            "ids": "bitcoin",
            "vs_currencies": "usd"
        }
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        if 'bitcoin' not in data:
            raise ValueError("Invalid API response format")
            
        price = data['bitcoin']['usd']
        
        # 获取当前日期（上海时区）
        tz = pytz.timezone('Asia/Shanghai')
        current_date = datetime.now(tz).strftime('%Y-%m-%d')
        
        # 修改文件路径为相对路径
        script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        csv_path = os.path.join(script_dir, 'public', 'btc-price.csv')
        
        try:
            # 读取现有的 CSV 文件
            existing_df = pd.read_csv(csv_path)
            
            # 确保日期格式统一
            existing_df['Date'] = pd.to_datetime(existing_df['Date']).dt.strftime('%Y-%m-%d')
        except FileNotFoundError:
            # 如果文件不存在，创建新的 DataFrame
            existing_df = pd.DataFrame(columns=['Date', 'Price'])
        
        # 检查是否已存在该日期的数据
        if current_date in existing_df['Date'].values:
            print(f"Data for {current_date} already exists")
            return
            
        # 创建新的数据行
        new_row = pd.DataFrame({
            'Date': [current_date],
            'Price': [price]
        })
        
        # 添加新数据并按日期排序
        df = pd.concat([existing_df, new_row], ignore_index=True)
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.sort_values('Date', ascending=False)  # 按日期降序排序
        
        # 保存更新后的数据
        df.to_csv(csv_path, index=False, date_format='%Y-%m-%d')
        print(f"Successfully updated BTC price for {current_date}: ${price}")
        
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    get_btc_price()