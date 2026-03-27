# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import json
import re

URL = "https://slamjam.com/en-hk/collections/sale"
PROFIT = 200

def get_data():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }

    print("Step 1: Connecting...")
    try:
        res = requests.get(URL, headers=headers, timeout=20)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # 尋找所有包含商品資訊的 div
        items = soup.find_all('div', class_=re.compile(r'product-card|grid-item', re.I))
        print(f"Step 2: Found {len(items)} items. Extracting details...")

        products = []
        for item in items:
            # 獲取該區塊內所有的純文字
            all_text = item.get_text("|", strip=True).split("|")
            
            # 尋找價格 (包含 HK$ 的數字)
            prices = []
            for t in all_text:
                if 'HK$' in t:
                    num = re.sub(r'[^\d]', '', t)
                    if num: prices.append(int(num))
            
            # 只有找到價格的才算有效商品
            if len(prices) >= 1:
                # 通常較小的數字是特價，較大的是原價
                sale_p = min(prices)
                old_p = max(prices) if len(prices) > 1 else int(sale_p * 1.3)
                
                # 獲取名稱 (通常是前幾段文字中比較長的)
                name = "Item"
                for t in all_text[:5]:
                    if len(t) > 5 and 'HK$' not in t:
                        name = t.replace("Slam Jam", "Premium")
                        break
                
                # 獲取圖片
                img = item.find('img')
                img_url = ""
                if img:
                    img_url = img.get('data-src') or img.get('src') or ""
                    if img_url.startswith('//'): img_url = "https:" + img_url

                products.append({
                    "name": name,
                    "original_price": old_p,
                    "my_price": sale_p + PROFIT,
                    "image": img_url
                })

        # 儲存結果
        if products:
            with open('products.json', 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=4)
            print(f"Step 3: Success! Saved {len(products)} products to products.json")
        else:
            print("Step 3: Failed to extract. Please check if the website structure changed.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_data()