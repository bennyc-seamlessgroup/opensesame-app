Explore Page UI Spec（配合現有 App UI）

Page Purpose

Explore Page 的目標是讓用戶發現新的餐廳、食物與 Foodie，同時維持現在 App 的設計語言：大圖卡片、內容流、簡潔 UI。

Explore Page 的核心內容包括：
	•	Top Foodie（達人用戶）
	•	食物排行榜
	•	餐廳排行榜
	•	Foodie 的食物內容分享

整體仍保持內容為主的 feed，而不是傳統列表式目錄。

⸻

1. Header Area（與 Landing Page 保持一致）

Explore Page 的 Header 與現在 Landing Page 設計一致，確保整體 UI 一致性。

包含以下元素：

Location Selector
顯示目前地區，例如 Central 或 香港。
點擊可切換地區。

Search Bar
Placeholder 為：
餐廳・地區/地址・菜式/食品

搜尋結果可包含：
餐廳
食物
Foodie
地區

Filter Icon
右側提供 filter / sort 按鈕。
點擊後可打開篩選面板。

篩選選項包括：
地區
菜式
價格
距離
熱門度

⸻

2. Top Foodie Section（新增）

位置：Search bar 下方。

Section Title
達人用戶

右側 CTA
瀏覽更多 →

Layout
Horizontal scroll 卡片列表。

每張 card 顯示：

Foodie 封面圖片或影片
Foodie 頭像
Username
Credibility 或 Verified badge

可附帶資訊：

Followers
內容觀看數
人氣指標

Interaction
點擊卡片 → 進入 Foodie Profile Page。

⸻

3. Explore Filter Row

位於 Top Foodie Section 下方。

Filter 以圓角 chip style 顯示。

建議包含：

地區
菜式
熱門
排行榜

點擊後可展開選單或 bottom sheet。

⸻

4. Social Food Feed（主內容流）

Explore Page 的主體仍然是內容流。

Layout
兩列卡片布局（類似 IG / 小紅書）。

每張 card 顯示：

食物照片或短影片
Foodie 名稱
餐廳名稱
簡短 caption
影片 icon（如果是影片）

點擊 card 可進入：

Post Detail Page
Restaurant Page
Foodie Profile

⸻

5. Food Ranking Section（食物排行榜）

Food Ranking 以一個 section 形式插入在內容流中，不需要建立完全不同頁面。

Section Title
食物排行榜

右側 CTA
查看全部 →

Filter Pills
可在 section 下方顯示排行分類，例如：

最多收藏
本週熱門
最高瀏覽
甜品榜
火鍋榜

Ranking Card Layout
每張卡片顯示：

排名編號（#1 #2 #3）
食物圖片（大圖）
食物名稱
所屬餐廳
地區
人氣數據（例如收藏數）

Example card structure：

排名 badge
食物圖片
食物名稱
餐廳名稱
地區
收藏數或人氣

Layout
保持目前 UI：

大圖
圓角卡片
簡潔資訊

Interaction
點擊卡片 → 進入 Food Detail Page。

⸻

6. Restaurant Ranking Section（餐廳排行榜）

位置：Food Ranking 下方。

Section Title
餐廳排行榜

右側 CTA
查看全部 →

Ranking Card Layout
每張卡片顯示：

排名編號
餐廳主圖
餐廳名稱
菜系
地區
價格範圍
人氣數據

可加入：

排名上升 / 下降箭頭
Trending indicator

Interaction
點擊卡片 → 進入 Restaurant Page。

⸻

7. Ranking Card Style

為了與目前 App UI 保持一致：

卡片設計應維持：

大圖片
圓角卡片
少量文字
乾淨 layout

避免使用列表式設計。

⸻

8. Sponsored / Boost（未來）

未來餐廳可購買 Boost 提升曝光。

UI 呈現方式：

自然出現在內容流中
或標示 Sponsored / Boost

不應破壞原有 UI 風格。

⸻

9. Scan Entry（保持現有設計）

Explore Page 不新增掃碼入口。

掃碼功能保持在 Bottom Navigation 中央按鈕。

掃碼用途：

確認到店
建立 Visit Session
解鎖評論資格

評論不需要立即完成，用戶可以稍後寫評論。

⸻

10. Bottom Navigation

保持目前 App 結構：

AI
Explore
Orders
Wallet
Profile

Explore tab 為 active。

⸻

11. Ranking Logic（後端）

Food Ranking 計算因素：

收藏數
瀏覽數
評論數
分享數
Verified dining

Restaurant Ranking 計算因素：

收藏數
到店次數
評論數
評分
人氣指標

排行榜可提供不同時間維度：

今日
本週
30 天
3 個月

⸻

12. UX Design Principles

Explore Page 應呈現為：

內容探索平台

設計風格接近：

Instagram
OpenRice
小紅書

而不是 Yelp 或 Tripadvisor 的傳統列表。

⸻

13. Content Priority

Explore Page 建議比例：

70% Social food content
20% Ranking content
10% Top foodie

避免讓排行榜過多影響內容流。

⸻

14. Final Page Structure

Explore Page 整體結構：

Header（Location + Search）

Top Foodies（horizontal scroll）

Filter row

Social content feed

Food ranking section

更多 content feed

Restaurant ranking section

更多 content feed