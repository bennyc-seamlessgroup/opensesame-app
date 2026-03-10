UI/UX 規格（首頁 /ai）
顯示位置：固定出現在「個人化餐廳推薦」標題區塊 上方（介於搜尋框/模式切換與推薦列表之間）。


呈現形式：一個可點擊的 彩色提示框（Banner / Callout box），非卡片內容的一部分。


文案：


主文案（繁中）：你有 {X} 則評論尚未回應


次文案（可選）：回應可獲得 $OSM 獎勵 或 每次回應 +0.2 $OSM


行為：


點擊 Banner（非關閉按鈕）→ 導航到 Pending Responses 頁（見下）


右側提供 關閉/稍後（X icon）→ 本次 session 隱藏 Banner


可選提供 不再提示（ellipsis menu）→ 設定層級長期隱藏（可在設定恢復）



顯示邏輯
觸發條件：存在未回應投票任務（pending vote tasks）時才顯示。


計數 X 定義：X = pendingVoteTasks.length


優先級：Banner 在首頁只顯示 一條匯總，不逐條展開內容。


多任務情況：


Banner 只顯示總數 X


點進去後用列表逐一處理


關閉後顯示規則：


方案 A（建議）：Dismiss 僅在當前 session 隱藏；下次開 app 或隔天再出現（如仍有 pending）


方案 B：Dismiss 隱藏 24 小時（需要 localStorage 記錄 dismissUntil）



導航與頁面（Pending Responses）
新路由：/review/pending（或 /pending，但建議放 review 節點下）


頁面目的：展示「導致用戶上一次消費/訂位/外賣決策的那條評論」，讓用戶逐一回應 Agree/Disagree。


頁面內容（每個 pending item 一張卡）：


關聯餐廳資訊：餐廳名、地點（可選）、封面縮圖


關聯交易資訊：訂位/外賣、日期時間、訂單摘要（可選）


當初展示給用戶的那條 review snippet（完整可展開）


評論作者（顯示 credibility badge 可選）


回應獎勵提示：回應 +0.2 $OSM（示例）


兩個 CTA：同意 / 不同意


操作後行為：


用戶按同意/不同意 → 該 pending item 立即從列表移除（optimistic UI）


顯示 toast：已回應，獲得 +0.2 $OSM


回到首頁後 Banner 計數 X 應即時更新（X-1）


當 X=0 → Banner 不顯示



資料結構（前端 mock/狀態層）
新增資料模型：pendingVoteTasks[]


欄位建議：


id（task id）


userId


contextType：TAKEAWAY | BOOKING


contextId：orderId / bookingId


restaurantId


foodItemId（可選；若 takeaway 以菜式為主體）


reviewId（當初 AI 選中的那條評論）


rewardForVote（e.g. 0.2）


createdAt


status：PENDING | RESPONDED


Banner 計數來源：只計算 status=PENDING



狀態更新規則
生成 pendingVoteTask 的時機：


訂單完成（picked up）或到訪完成（verified visit）後，若該交易當初有「AI 推薦評論」→ 生成一條 pending vote task


回應後的狀態：


任務狀態變為 RESPONDED（或從列表移除）


寫入 wallet transaction history 一筆：type=REWARD_VOTE（或你現有命名）


若選 同意：同時觸發 reviewer credibility + reviewer reward（mock 記錄即可）



視覺規格（不改現有設計語言）
Banner 使用現有設計系統的 color token：


背景：品牌強調色的淡色版本（例如 orange/amber tint）


文字：高對比，主文案較粗


右側 icon：chevron（表示可點）+ close（dismiss）


Banner 高度不超過 1.5 行文字，避免擠壓內容。



可驗收標準（Acceptance Criteria）
有 pending 時：首頁「個人化餐廳推薦」上方顯示 Banner，文案含正確 X。


點擊 Banner：進入 /review/pending，看到對應交易的那條評論。


關閉 Banner：當前 session 不再出現（或按你採用的時間策略）。


在 pending 頁完成同意/不同意：


立即移除該 item


顯示獲得 $OSM 的提示


返回首頁 Banner 計數同步減少


當 pending 清零：首頁不再顯示 Banner。



