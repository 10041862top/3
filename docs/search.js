let books = [];
let searchTimeout = null;
const MAX_RESULTS = 100; // 最多顯示100條結果

async function loadBooks() {
  console.log("🔄 開始加載書籍數據...");
  
  try {
    // 優先加載 all-books.json（包含所有 md 文件的數據）
    console.log("📥 嘗試加載 all-books.json...");
    const res = await fetch("all-books.json");
    
    if (res.ok) {
      const data = await res.json();
      books = data;
      console.log(`✅ 已加載 ${books.length} 本書籍（來自 all-books.json）`);
      
      // 顯示加載成功的提示
      const searchBox = document.querySelector('input[type="text"]');
      if (searchBox) {
        const originalPlaceholder = searchBox.placeholder;
        searchBox.placeholder = `已加載 ${books.length.toLocaleString()} 本書，開始搜索...`;
        setTimeout(() => {
          searchBox.placeholder = originalPlaceholder;
        }, 3000);
      }
      return;
    } else {
      console.warn(`⚠️  all-books.json 返回狀態碼: ${res.status}`);
    }
  } catch (e) {
    console.warn("⚠️  all-books.json 加載失敗:", e);
  }
  
  // 降級到 books.json（metadata 數據）
  try {
    console.log("📥 嘗試加載 books.json...");
    const res = await fetch("books.json");
    if (res.ok) {
      books = await res.json();
      console.log(`✅ 已加載 ${books.length} 本書籍（來自 books.json，metadata 數據）`);
      console.warn("💡 提示：建議運行 'python scripts/parse_md_to_json.py' 生成完整的 all-books.json");
    } else {
      console.error(`❌ books.json 返回狀態碼: ${res.status}`);
    }
  } catch (e) {
    console.error("❌ 無法加載書籍數據", e);
    alert("⚠️ 無法加載書籍數據，請檢查網絡連接或刷新頁面重試");
  }
}

function searchBooks(keyword) {
  if (!keyword || keyword.trim() === "") {
    return [];
  }
  
  const k = keyword.toLowerCase().trim();
  const keywords = k.split(/\s+/); // 支持多關鍵詞搜索

  return books.filter(b => {
    const title = (b.title || "").toLowerCase();
    const author = (b.author || "").toLowerCase();
    const category = (b.category || "").toLowerCase();
    
    // 多關鍵詞匹配：所有關鍵詞都要匹配
    return keywords.every(keyword => 
      title.includes(keyword) ||
      author.includes(keyword) ||
      category.includes(keyword)
    );
  }).slice(0, MAX_RESULTS); // 限制結果數量
}

// HTML 轉義函數
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 正則表達式特殊字符轉義
function escapeRegex(str) {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, keyword) {
  if (!keyword || !text) return escapeHtml(text);
  
  // 轉義正則表達式特殊字符，防止正則表達式注入
  const escapedKeyword = escapeRegex(keyword);
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  
  // 先轉義 HTML，再添加高亮標記
  const escapedText = escapeHtml(text);
  return escapedText.replace(regex, '<mark>$1</mark>');
}

function renderResults(results, keyword) {
  const box = document.getElementById("search-results");
  box.innerHTML = "";

  if (results.length === 0) {
    box.innerHTML = "<p style='padding: 20px; text-align: center; color: #93a1a1; background: #073642; border-radius: 6px; border: 1px solid #586e75;'>❌ 沒有找到相關書籍</p>";
    return;
  }

  const keywordLower = keyword.toLowerCase();
  
  // 顯示結果數量
  const countDiv = document.createElement("div");
  countDiv.style.cssText = "padding: 12px 16px; background: #073642; border-radius: 6px; margin-bottom: 16px; border: 1px solid #586e75; color: #2aa198; font-family: 'SF Mono', 'Monaco', monospace;";
  countDiv.innerHTML = `<strong>找到 ${results.length}${results.length === MAX_RESULTS ? '+' : ''} 條結果</strong>`;
  box.appendChild(countDiv);

  results.forEach(b => {
    const div = document.createElement("div");
    div.style.cssText = "padding: 16px; margin: 12px 0; background: #073642; border: 1px solid #586e75; border-left: 4px solid #268bd2; border-radius: 6px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);";
    
    // 添加 hover 效果
    div.addEventListener('mouseenter', function() {
      this.style.borderLeftColor = '#2aa198';
      this.style.background = '#002b36';
      this.style.transform = 'translateX(4px)';
      this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });
    div.addEventListener('mouseleave', function() {
      this.style.borderLeftColor = '#268bd2';
      this.style.background = '#073642';
      this.style.transform = 'translateX(0)';
      this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    });
    
    const highlightedTitle = highlightText(b.title || "未知", keywordLower);
    const highlightedAuthor = highlightText(b.author || "未知", keywordLower);
    const highlightedCategory = highlightText(b.category || "", keywordLower);
    
    // 驗證和轉義鏈接 URL，防止 javascript: 協議等 XSS 攻擊
    let safeLink = "#";
    if (b.link) {
      try {
        const url = new URL(b.link, window.location.origin);
        // 只允許 http、https 協議
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          safeLink = url.href;
        }
      } catch (e) {
        // 如果 URL 解析失敗，使用原始鏈接（可能是相對路徑）
        // 但需要轉義 HTML 特殊字符
        safeLink = escapeHtml(b.link);
      }
    }
    
    div.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong style="font-size: 16px; color: #93a1a1; font-weight: 600;">${highlightedTitle}</strong>
      </div>
      <div style="color: #657b83; font-size: 14px; margin-bottom: 10px; font-family: 'SF Mono', 'Monaco', monospace;">
        <span>👤 ${highlightedAuthor}</span>
        <span style="margin: 0 10px; color: #586e75;">|</span>
        <span>📂 ${highlightedCategory}</span>
      </div>
      <div>
        <a href="${safeLink}" target="_blank" rel="noopener" style="
          display: inline-block;
          padding: 6px 14px;
          background: #268bd2;
          color: #002b36;
          text-decoration: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'SF Mono', 'Monaco', monospace;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        " onmouseover="this.style.background='#2aa198'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(42, 161, 152, 0.4)';" 
           onmouseout="this.style.background='#268bd2'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0, 0, 0, 0.2)';"
        >📥 下載</a>
      </div>
    `;
    box.appendChild(div);
  });
  
  // 添加樣式
  if (!document.getElementById('search-results-style')) {
    const style = document.createElement('style');
    style.id = 'search-results-style';
    style.textContent = `
      #search-results mark {
        background: #b58900;
        color: #002b36;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}

function onSearch(e) {
  const keyword = e.target.value.trim();
  
  // 檢查數據是否已加載
  if (books.length === 0) {
    const box = document.getElementById("search-results");
    box.innerHTML = "<p style='padding: 20px; text-align: center; color: #d73a49;'>⏳ 正在加載書籍數據，請稍候...</p>";
    return;
  }
  
  // 清除之前的定時器
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // 如果輸入為空，清空結果
  if (!keyword) {
    document.getElementById("search-results").innerHTML = "";
    return;
  }
  
  // 防抖：300ms 後執行搜索
  searchTimeout = setTimeout(() => {
    const results = searchBooks(keyword);
    console.log(`🔍 搜索 "${keyword}" 找到 ${results.length} 條結果`);
    renderResults(results, keyword);
  }, 300);
}

// 頁面加載完成後加載數據
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBooks);
  } else {
    loadBooks();
  }
})();
