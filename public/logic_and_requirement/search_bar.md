1) 元件目標與範圍
	•	提供一個首頁/Explore 共用的搜尋入口，外觀類似 OpenRice：
	•	上方一條搜尋列（Search Bar）
	•	點擊後開啟「快速篩選面板」
	•	面板內提供「進階搜尋」入口，進階頁提供更完整條件
	•	Demo scope：只需 UI + mock state + 篩選結果（可用假資料），不需真正地圖/後端搜尋。

⸻

2) 路由與顯示形態
	•	Search Bar 顯示在：
	•	/explore 頁頂部（主要）
	•	（可選）/ai 頁頂部（同一套元件重用）
	•	點擊 Search Bar → 開啟 Bottom Sheet / Modal（shadcn Sheet 或 Dialog）
	•	在 Bottom Sheet 內：
	•	顯示快速篩選（Quick Filters）
	•	顯示「進階搜尋」按鈕/入口
	•	點擊「進階搜尋」→ 進入新路由頁：/search/advanced

⸻

3) Search Bar（收合狀態 UI）
	•	位置：頁面頂部，sticky（可選）
	•	結構：
	•	左側：搜尋 icon
	•	中間：placeholder 文字（可顯示已選條件摘要）
	•	右側：進階 icon（slider/filter）或 chevron（可選）
	•	Placeholder 文案（未選任何條件）：
	•	「餐廳、地區/地址、菜式/食品…」
	•	已選條件摘要顯示規則：
	•	顯示最多 2 個條件 + “+N”
	•	例如：「附近 • 火鍋 +2」
	•	互動：
	•	點擊整條 → 打開 Bottom Sheet
-（可選）長按/右側按鈕 → 直接進入進階搜尋

⸻

4) Bottom Sheet：快速篩選面板（Quick Search Panel）
	•	標題：
	•	「搜尋」或「快速搜尋」
	•	內容區塊（按順序）：
	1.	Keyword Input（可選，demo 建議保留）
	•	用戶可輸入關鍵字：餐廳名/菜名/用戶名
	2.	快捷 chips row（模仿 OpenRice）
	•	「附近」
	•	「進階搜尋」入口（按鈕）
	•	「新餐廳」（可選）
	3.	快速篩選 Dropdown / Pill selectors（3 個核心下拉）
	•	地區（Area）
	•	菜式（Cuisine）
	•	熱門/排序（Sort）
	•	底部固定 CTA：
	•	「顯示結果」/「搜尋」按鈕
	•	次要按鈕：「清除條件」

⸻

5) 快速篩選的資料結構（state）
	•	Quick Search state fields：
	•	keyword: string
	•	area: string | null（例：中環、旺角、尖沙咀）
	•	cuisine: string | null（例：火鍋、燒肉、甜品、咖啡）
	•	sort: "熱門" | "最新" | "高評分" | "高回贈" | "附近"
	•	serviceMode: "堂食" | "外賣" | "全部"（可放在 quick 或 advanced，建議 quick 也有）
	•	Default（打開面板時）：
	•	area = "附近"（或 null + use geolocation label）
	•	sort = "熱門"
	•	serviceMode = 全部（或跟頁面模式一致）

⸻

6) 「進階搜尋」入口與路由（/search/advanced）
	•	進階搜尋為獨立頁面（類似 OpenRice 進階搜尋），包含更完整 filters：
	•	地點（Location）
	•	地區 chips（例如：尖沙咀、銅鑼灣、旺角、灣仔、中環）
-（可選）距離 slider（1km / 3km / 5km）
	•	菜式/食物類型（Cuisine / Food Type）
	•	chips（自助餐、火鍋、甜品、燒烤、麵包店…）
	•	服務（Service）
	•	堂食點餐
	•	外賣自取
	•	訂座
-（可選）搶位
	•	價格（Price Range）
	•	$ $$ $$$（chips 或 segmented）
	•	時段（Time）
	•	今日可訂 / 即時有位（toggle）
	•	外賣可取餐時間（可選）
	•	偏好（Preference）
	•	已驗證評論（固定為 true，不需要 toggle）
	•	高回贈（toggle：只顯示回贈 ≥ X%）
	•	Top reviewers 推薦（toggle：只顯示高可信評論加權）
	•	頁面底部固定 CTA：
	•	「套用篩選」
	•	「清除」

⸻

7) 結果頁 / 結果呈現（Demo 最低要求）
	•	方式 A（最簡單）：
	•	Quick/Advanced 選好條件後，回到 /explore 並以 query string 帶回條件
	•	例如：/explore?area=中環&cuisine=火鍋&sort=熱門
	•	方式 B（較清晰）：
	•	導向到 /search/results 顯示結果列表/網格
	•	Demo 建議：用方式 A（減少路由與頁面數量）
	•	Explore 內結果呈現：
	•	頂部顯示「已套用篩選條件 chips」（可刪除/單個清除）
	•	結果為 review feed（或餐廳卡 + review snippet）
	•	篩選只需在前端 mock data 做 filter/sort

⸻

8) 與現有 App 模式整合（堂食/外賣）
	•	若 app 有「堂食/外賣」segmented control（如你截圖右上）：
	•	Search state 應讀取該模式作 default serviceMode
	•	規則：
	•	堂食：結果優先餐廳/訂座相關
	•	外賣：結果優先菜式/外賣自取相關
	•	Advanced Search 的 Service filters 需與模式一致，並允許切換到另一模式（擴展性）

⸻

9) 可用性與互動細節
	•	Bottom Sheet 交互：
	•	點擊背景或左上 X 可關閉（不套用變更）
	•	點擊「顯示結果」→ 套用條件並關閉
	•	Advanced Search：
	•	右上返回箭頭返回（保留已選條件）
	•	套用後回到上一頁並更新結果
	•	清除條件：
	•	一鍵 reset 到 default（附近 + 熱門 + 全部）

⸻

10) 元件拆分建議（工程）
	•	SearchBar（收合狀態）
	•	SearchQuickSheet（Bottom Sheet：Keyword + 3 下拉 + CTA）
	•	AdvancedSearchPage（/search/advanced）
	•	FilterChipsRow（已套用條件 chips）
	•	useSearchFilters() hook（集中管理 state + query string 同步）
	•	applyFilters(data, filters)（mock filter/sort function）

⸻

11) 驗收標準（Acceptance Criteria）
	•	點擊搜尋列會打開 Bottom Sheet。
	•	Bottom Sheet 內可選地區/菜式/排序，按「顯示結果」後 Explore 內容會更新。
	•	點擊「進階搜尋」進入 advanced page，可選更多條件並套用後回到 Explore。
	•	Search Bar 會顯示已選條件摘要（最多 2 個 +N）。
	•	清除條件可回復到 default（附近/熱門/全部）。
	•	整個流程可用 mock data 完成 filter/sort，無需後端。