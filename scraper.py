# -*- coding: utf-8 -*-
import requests
import json
import time

# 設定
PROFIT = 200 # 你的利潤 (單位：港幣)
EXCHANGE_RATE = 8.5 # 匯率轉換：SlamJam 預設回傳可能是歐元(EUR)。1 EUR ≒ 8.5 HKD。若確定 API 已回傳港幣，請改為 1.0
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

def get_data():
    all_products = []
    page = 1
    
    # 💡 關鍵修正：移除了 URL 中的 '/en-hk/'
    # Shopify 的隱藏 JSON API 通常不支援多國語系前綴，帶上前綴會導致回傳空陣列 []
    BASE_URL = "https://slamjam.com/collections/sale.json"
    
    print("🚀 啟動終極修復版抓取模式（移除語系干擾）...")

    while True:
        print(f"📦 正在請求第 {page} 頁數據...")
        
        params = {
            "page": page,
            "limit": 250
        }
        
        try:
            res = requests.get(BASE_URL, headers=HEADERS, params=params, timeout=30)
            
            if res.status_code != 200:
                print(f"🛑 停止抓取 (Status: {res.status_code})")
                break
                
            data = res.json()
            products = data.get('products', [])
            
            # 如果主要 API 失敗，啟動備用全站掃描 API
            if not products and page == 1:
                print("⚠️ Collection API 回傳為空，自動啟動 [全站透視備用方案]...")
                all_products = fallback_global_scrape()
                return # 結束主流程，交給備用方案
                
            if not products:
                print("🏁 所有分頁已掃描完畢。")
                break

            for item in products:
                brand = item.get('vendor', 'Premium').upper()
                name = item.get('title', 'Unknown Item')
                
                variants = item.get('variants', [])
                if not variants: continue
                
                v = variants[0]
                sale_p_raw = v.get('price')
                if not sale_p_raw: continue
                
                # 乘上匯率轉換為港幣
                sale_p = int(float(sale_p_raw) * EXCHANGE_RATE)
                compare_p_raw = v.get('compare_at_price')
                
                old_p = int(float(compare_p_raw) * EXCHANGE_RATE) if compare_p_raw else int(sale_p * 1.5)

                sizes = []
                for var in variants:
                    if var.get('available'):
                        s = var.get('title')
                        if s and s != "Default Title":
                            sizes.append(s)
                
                images = item.get('images', [])
                img_url = images[0].get('src') if images else ""
                if img_url.startswith('//'):
                    img_url = "https:" + img_url

                if sizes:
                    all_products.append({
                        "brand": brand,
                        "name": name,
                        "original_price": old_p,
                        "my_price": sale_p + PROFIT,
                        "image": img_url,
                        "sizes": sizes,
                        "status": "AVAILABLE"
                    })

            print(f"✅ 第 {page} 頁處理完成，目前累計：{len(all_products)} 件")
            
            # 修正矛盾：limit 為 250，因此小於 250 才代表到達最後一頁
            if len(products) < 250: 
                break
                
            page += 1
            time.sleep(1.5)

        except Exception as e:
            print(f"❌ 執行時發生錯誤: {e}")
            break

    if all_products:
        save_products(all_products)
    else:
        print("😭 未能獲取資料，請檢查網路或稍後再試。")

def fallback_global_scrape():
    # 備用方案：直接掃描全站商品並自行過濾出特價品
    all_products = []
    page = 1
    fallback_url = "https://slamjam.com/products.json"
    
    while True:
        print(f"🔍 正在進行全站深度掃描，第 {page} 頁...")
        try:
            res = requests.get(fallback_url, headers=HEADERS, params={"page": page, "limit": 250}, timeout=30)
            if res.status_code != 200: break
            
            products = res.json().get('products', [])
            if not products: break
            
            for item in products:
                variants = item.get('variants', [])
                if not variants: continue
                
                v = variants[0]
                sale_p_raw = v.get('price')
                compare_p_raw = v.get('compare_at_price')
                if not sale_p_raw: continue
                
                # 備用方案同樣乘上匯率轉換為港幣
                sale_p = float(sale_p_raw) * EXCHANGE_RATE
                old_p = float(compare_p_raw) * EXCHANGE_RATE if compare_p_raw else 0.0
                
                # 只有原價 > 現價，才認定是特價商品
                if old_p <= sale_p:
                    continue
                    
                brand = item.get('vendor', 'Premium').upper()
                name = item.get('title', 'Unknown Item')
                
                sizes = []
                for var in variants:
                    if var.get('available'):
                        s = var.get('title')
                        if s and s != "Default Title":
                            sizes.append(s)
                            
                images = item.get('images', [])
                img_url = images[0].get('src') if images else ""
                if img_url.startswith('//'):
                    img_url = "https:" + img_url
                    
                if sizes:
                    all_products.append({
                        "brand": brand,
                        "name": name,
                        "original_price": int(old_p),
                        "my_price": int(sale_p) + PROFIT,
                        "image": img_url,
                        "sizes": sizes,
                        "status": "AVAILABLE"
                    })
                    
            print(f"✅ 全站第 {page} 頁掃描完成，累計找出：{len(all_products)} 件特價品")
            # 修正矛盾：limit 為 250
            if len(products) < 250: break
            page += 1
            time.sleep(1.5)
        except Exception as e:
            print(f"❌ 備用方案發生錯誤: {e}")
            break
            
    if all_products:
        save_products(all_products)
    else:
        print("😭 備用方案也未能獲取資料。網站可能已開啟最高級別的反爬蟲防護。")
    return all_products

def save_products(products_list):
    # 去重處理，避免抓到重複商品
    unique_products = {p['name']: p for p in products_list}.values()
    with open('products.json', 'w', encoding='utf-8') as f:
        json.dump(list(unique_products), f, ensure_ascii=False, indent=4)
    print(f"\n🎉 任務大功告成！共抓取 {len(unique_products)} 件不重複商品，已存入 products.json。")

if __name__ == "__main__":
    get_data()