name: Auto Update Inventory

on:
  schedule:
    - cron: '0 0 * * *' # 每天香港時間早上 8 點執行一次
  workflow_dispatch: # 讓你可以隨時手動點擊執行

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: 下載專案程式碼
        uses: actions/checkout@v3

      - name: 設定 Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'

      - name: 安裝工具
        run: pip install requests beautifulsoup4

      - name: 執行爬蟲
        run: python scraper.py

      - name: 儲存結果並推送到 GitHub
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add products.json
          git commit -m "Update products.json" || exit 0
          git push
