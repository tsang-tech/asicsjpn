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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

def parse_price(text):
    """暴力解法：提取所有數字並除以 100"""
    digits = re.sub(r'[^\d]', '', text)
    if not digits: return 0
    return int(digits) // 100

def get_data():
    all_products = []
    page = 1
    
    print("開始全自動抓取流程...")

    while True:
        print(f"正在抓取第 {page} 頁...")
        # 加上 ?page= 參數來翻頁
        url = f"{BASE_URL}?page={page}"
        
        try:
            res = requests.get(url, headers=HEADERS, timeout=20)
            if res.status_code != 200:
                print(f"停止抓取：連線異常 (Status: {res.status_code})")
                break
                
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # 尋找商品卡片
            items = soup.find_all('div', class_=re.compile(r'product-card|grid-item', re.I))
            
            # 如果這一頁找不到任何商品，代表已經翻到底了
            if not items:
                print("此頁已無商品，抓取任務圓滿結束！")
                break
            
            current_page_count = 0
            for item in items:
                all_text = item.get_text("|", strip=True).split("|")
                
                prices = []
                for t in all_text:
                    if 'HK$' in t:
                        p = parse_price(t)
                        if p > 0: prices.append(p)
                
                if len(prices) >= 1:
                    prices.sort()
                    sale_p = prices[0]
                    old_p = prices[-1] if len(prices) > 1 else int(sale_p * 1.3)
                    
                    name = "Premium Item"
                    for t in all_text[:5]:
                        if len(t) > 5 and 'HK$' not in t:
                            name = t.replace("Slam Jam", "Premium").strip()
                            break
                    
                    img = item.find('img')
                    img_url = ""
                    if img:
                        img_url = img.get('data-src') or img.get('src') or ""
                        if img_url.startswith('//'): img_url = "https:" + img_url

                    all_products.append({
                        "name": name,
                        "original_price": old_p,
                        "my_price": sale_p + PROFIT,
                        "image": img_url
                    })
                    current_page_count += 1

            print(f"第 {page} 頁處理完畢，抓到 {current_page_count} 件商品。目前累計: {len(all_products)}")
            
            # 翻頁間隔 1 秒，保護你的 IP 不被封鎖
            time.sleep(1)
            page += 1
            
            # 安全閥：如果測試時不想等太久，可以取消下面這行的註解來限制只抓前 5 頁
            # if page > 5: break

        except Exception as e:
            print(f"發生錯誤: {e}")
            break

    # 儲存最終結果
    if all_products:
        with open('products.json', 'w', encoding='utf-8') as f:
            json.dump(all_products, f, ensure_ascii=False, indent=4)
        print(f"--- 任務完成 ---")
        print(f"總共抓取商品數: {len(all_products)}")
        print(f"請重新整理 index.html 觀看結果。")

if __name__ == "__main__":
    get_data()