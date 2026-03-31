# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import json
import re
import time

# 設定
BASE_URL = "https://slamjam.com/en-hk/collections/sale"
PROFIT = 200
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

def parse_price(text):
    """暴力解法：提取所有數字並除以 100"""
    digits = re.sub(r'[^\d]', '', text)
    if not digits: return 0
    return int(digits) // 100

def get_data():
    all_products = []
    page = 1
    
    print("--- 開始執行 1955 件商品全自動抓取任務 ---")

    while True:
        print(f"正在分析第 {page} 頁...")
        url = f"{BASE_URL}?page={page}"
        
        try:
            res = requests.get(url, headers=HEADERS, timeout=20)
            if res.status_code != 200:
                print(f"停止：連線異常或已到達末頁 (Status: {res.status_code})")
                break
                
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # 尋找所有商品卡片 (Slam Jam 的 class 通常包含 product-card)
            items = soup.find_all('div', class_=re.compile(r'product-card|grid-item', re.I))
            
            if not items:
                print("此頁已無商品，任務圓滿完成！")
                break
            
            for item in items:
                # 1. 抓取名稱與品牌
                # 通常品牌會放在特定的 vendor class 裡，若沒有則從名稱前綴嘗試提取
                brand_tag = item.find('div', class_=re.compile(r'vendor|brand', re.I))
                brand = brand_tag.get_text(strip=True) if brand_tag else "Premium"
                
                name_tag = item.find(re.compile(r'h2|h3|a'), class_=re.compile(r'title|name', re.I))
                name = name_tag.get_text(strip=True) if name_tag else "Unknown Item"
                
                # 2. 抓取尺寸 (Sizes)
                # Slam Jam 通常在 hover 或隱藏層中有尺寸清單
                # 我們嘗試尋找所有看起像尺寸的標籤 (例如包含 'size' 的屬性)
                sizes = []
                size_elements = item.find_all(re.compile(r'span|div|li'), class_=re.compile(r'size|variant', re.I))
                for s in size_elements:
                    val = s.get_text(strip=True)
                    if val and len(val) < 8: # 過濾掉太長的說明文字
                        sizes.append(val)
                
                # 如果沒抓到具體標籤，嘗試找有沒有 'available-sizes' 類似的內容
                if not sizes:
                    # 某些佈局尺寸直接寫在文字裡
                    size_text = item.find(string=re.compile(r'Sizes:', re.I))
                    if size_text:
                        sizes = [s.strip() for s in size_text.split(':')[-1].split(',')]

                # 3. 處理價格 (除以 100 暴力解法)
                all_text = item.get_text("|", strip=True).split("|")
                prices = []
                is_sold_out = False
                
                for t in all_text:
                    if 'SOLD OUT' in t.upper():
                        is_sold_out = True
                    if 'HK$' in t or 'HKD' in t:
                        p = parse_price(t)
                        if p > 0: prices.append(p)
                
                # 4. 只有「非 SOLD OUT」且「有價格」的才加入
                if not is_sold_out and len(prices) >= 1:
                    prices.sort()
                    sale_p = prices[0]
                    old_p = prices[-1] if len(prices) > 1 else int(sale_p * 1.3)
                    
                    # 抓取圖片
                    img = item.find('img')
                    img_url = ""
                    if img:
                        img_url = img.get('data-src') or img.get('src') or ""
                        if img_url.startswith('//'): img_url = "https:" + img_url

                    all_products.append({
                        "brand": brand,
                        "name": name,
                        "original_price": old_p,
                        "my_price": sale_p + PROFIT,
                        "image": img_url,
                        "sizes": sizes if sizes else ["F"], # 沒抓到尺寸則標示 F (Free Size)
                        "status": "AVAILABLE"
                    })

            print(f"第 {page} 頁抓取成功，目前累計商品: {len(all_products)} 件")
            
            # 延時以保護 IP
            time.sleep(1.2)
            page += 1
            
            # 如果你要測試前幾頁，可以取消下行註解
            # if page > 3: break

        except Exception as e:
            print(f"發生異常: {e}")
            break

    # 儲存
    if all_products:
        with open('products.json', 'w', encoding='utf-8') as f:
            json.dump(all_products, f, ensure_ascii=False, indent=4)
        print(f"\n--- 抓取結束 ---")
        print(f"總計成功保存: {len(all_products)} 件商品")
    else:
        print("未抓取到任何有效商品，請檢查網站結構是否變更。")

if __name__ == "__main__":
    get_data()