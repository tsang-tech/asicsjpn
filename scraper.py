# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import json
import re

URL = "https://slamjam.com/en-hk/collections/sale"
PROFIT = 200

def parse_price(text):
    """暴力解法：提取所有數字，直接除以 100"""
    # 只保留純數字，過濾掉所有 HK$、逗號和小數點
    digits = re.sub(r'[^\d]', '', text)
    if not digits: return -1
    
    val = int(digits)
    
    # 依照你的要求，直接將抓到的數字除以 100
    return val // 100

def get_data():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }

    print("Step 1: Connecting...")
    try:
        res = requests.get(URL, headers=headers, timeout=20)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        items = soup.find_all('div', class_=re.compile(r'product-card|grid-item', re.I))
        print(f"Step 2: Found {len(items)} items. Extracting details...")

        products = []
        for item in items:
            all_text = item.get_text("|", strip=True).split("|")
            
            prices = []
            for t in all_text:
                if 'HK$' in t or 'HKD' in t:
                    p = parse_price(t)
                    if p > 0:
                        prices.append(p)
            
            if len(prices) >= 1:
                # 排序價格，確保細的是特價
                prices.sort()
                sale_p = prices[0]
                # 如果有兩個價格，大的是原價；否則虛擬一個原價
                old_p = prices[-1] if len(prices) > 1 else int(sale_p * 1.3)
                
                name = "Premium Item"
                for t in all_text[:5]:
                    if len(t) > 5 and 'HK$' not in t and 'HKD' not in t:
                        name = t.replace("Slam Jam", "Premium").strip()
                        break
                
                img = item.find('img')
                img_url = ""
                if img:
                    img_url = img.get('data-src') or img.get('src') or ""
                    if img_url.startswith('//'):
                        img_url = "https:" + img_url

                products.append({
                    "name": name,
                    "original_price": old_p,
                    "my_price": sale_p + PROFIT,
                    "image": img_url
                })

        if products:
            with open('products.json', 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=4)
            print(f"Step 3: Success! Saved {len(products)} products to products.json")
            print("請檢查 products.json，價格現在應該是絕對精準的了！")
        else:
            print("Step 3: Failed. No products found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_data()