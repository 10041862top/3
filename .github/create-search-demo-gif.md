# 如何創建搜索功能演示 GIF

> **注意**：當前 `.github/search-demo.gif` 是一個佔位符。請按照以下步驟創建真實的演示 GIF。

## 🚀 方法 0: 使用自動化腳本（推薦）

我們提供了一個自動化腳本，可以自動訪問 GitHub Pages 並生成演示 GIF：

```bash
# 1. 安裝依賴
pip install playwright Pillow
playwright install chromium

# 2. 運行腳本
python scripts/generate_search_demo_gif.py
```

腳本會自動：
- ✅ 訪問 GitHub Pages 頁面
- ✅ 等待數據加載
- ✅ 執行多個搜索操作（"文學"、"歷史"、"溝通 勵志"）
- ✅ 截圖並生成 GIF 動畫
- ✅ 保存到 `.github/search-demo.gif`

**優點**：完全自動化，無需手動操作，可重複執行

## 方法 1: 使用 Kap（推薦，macOS）

1. 下載並安裝 [Kap](https://getkap.co/)
2. 打開 GitHub Pages 頁面：https://jbiaojerry.github.io/ebook-treasure-chest/
3. 使用 Kap 錄製以下操作：
   - 展示頁面加載和統計信息
   - 在搜索框輸入關鍵詞（如"文學"、"歷史"）
   - 展示實時搜索結果
   - 展示點擊下載鏈接
4. 導出為 GIF，保存為 `.github/search-demo.gif`

## 方法 2: 使用 macOS 屏幕錄製 + ffmpeg 轉換

1. 打開 GitHub Pages 頁面：https://jbiaojerry.github.io/ebook-treasure-chest/
2. 使用 macOS 內置的屏幕錄製功能（Command+Shift+5）錄製搜索演示
3. 安裝 gifsicle（如果未安裝）：
   ```bash
   brew install gifsicle
   ```
4. 將錄製的視頻轉換為 GIF：
   ```bash
   ffmpeg -i input.mov -vf "fps=10,scale=1280:-1:flags=lanczos" -c:v gif - | \
   gifsicle --optimize=3 --delay=10 > .github/search-demo.gif
   ```

## 方法 3: 使用其他工具

- **Gifox** (macOS): https://gifox.io/
- **ScreenToGif** (Windows): https://www.screentogif.com/
- **Peek** (Linux): https://github.com/phw/peek

## 錄製內容建議

- ✅ 展示頁面加載和統計信息（總書籍數、分類數）
- ✅ 在搜索框輸入關鍵詞（如"文學"、"歷史"、"溝通"）
- ✅ 展示實時搜索結果（高亮關鍵詞）
- ✅ 展示多關鍵詞搜索（用空格分隔）
- ✅ 展示點擊下載鏈接
- ⏱️ 總時長：10-15 秒
- 📐 分辨率：1280x720 或更高
- 🎨 保持與頁面 Solarized Dark 主題一致
