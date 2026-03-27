import requests
from bs4 import BeautifulSoup
import json
import os
import time

# 設定目標網址 (Slam Jam 的特價頁面)
TARGET_URL = "https://slamjam.com/en-hk/collections/sale"
# 每件商品加價的金額
MARKUP_HKD = 200
# 存儲結果的檔名
OUTPUT_FILE = "products.json"

def clean_text(text):
    """
    過濾掉所有提及 Slam Jam 的字眼，確保來源隱蔽
    """
    if not text:
        return ""
    forbidden_words = ["Slam Jam", "SlamJam", "SJ", "slamjam.com"]
    for word in forbidden_words:
        text = text.replace(word, "Exclusive Select") # 替換成你的店名或通用稱呼
    return text.strip()

def scrape_slamjam_sale():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7"
    }

    print(f"正在開始抓取: {TARGET_URL}...")
    
    try:
        response = requests.get(TARGET_URL, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        products = []

        # 注意：這裡的 CSS Selector 需要根據 Slam Jam 實際網頁結構微調
        # 通常商品包裝在特定的 div 內
        items = soup.select('.product-card') # 這是假設的 class 名稱

        for item in items:
            try:
                # 1. 提取品牌 (例如 Nike, Jordan)
                brand = item.select_one('.product-card__brand').get_text(strip=True)
                
                # 2. 提取名稱並清洗 (移除 Slam Jam 字樣)
                raw_name = item.select_one('.product-card__title').get_text(strip=True)
                name = clean_text(raw_name)

                # 3. 提取價格 (特價)
                # 假設價格顯示格式為 "HK$ 1,200"
                raw_sale_price = item.select_one('.price--sale').get_text(strip=True)
                # 只保留數字部分
                sale_price_int = int(''.join(filter(str.isdigit, raw_sale_price)))
                
                # 4. 提取原價 (用於計算折扣率)
                raw_original_price = item.select_one('.price--compare').get_text(strip=True)
                original_price_int = int(''.join(filter(str.isdigit, raw_original_price)))

                # 5. 提取圖片網址
                img_element = item.select_one('img')
                img_url = img_element['src'] if img_element else ""
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url

                # 6. 計算你的售價 (Slam Jam 特價 + 200)
                my_display_price = sale_price_int + MARKUP_HKD

                products.append({
                    "id": str(len(products) + 1),
                    "brand": brand,
                    "name": name,
                    "original_price": original_price_int,
                    "sale_price": sale_price_int,
                    "my_price": my_display_price,
                    "image": img_url,
                    "updated_at": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                
            except Exception as e:
                # 跳過抓取失敗的單個商品
                continue

        # 將結果存入 JSON，供 GitHub Pages 的前端讀取
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=4)
            
        print(f"抓取完成！成功獲取 {len(products)} 件商品，已存入 {OUTPUT_FILE}")

    except requests.exceptions.RequestException as e:
        print(f"抓取失敗: {e}")

if __name__ == "__main__":
    scrape_slamjam_sale()
