# LINE 雙人記帳機器人 ( Accounting_Linebot )
> _AB制分錢小幫手_

和另一半或朋友一起出門時，通常是其中一人先付款，等到要結帳時才發現很難記得細項；或是雙方輪流付款，也不容易計算誰欠誰多少。  
為了解決這個問題，我設計了這個 LINE 機器人，能夠即時記帳、輕鬆查詢明細與結算金額，還能簡單統計最近三個月的花費狀況。雙方都只需要加入這個Linebot好友就可以直接使用。

When going out with a partner or friend, it's common for one person to pay first. Later, when it’s time to settle up, it can be hard to recall the exact details. Alternating payments also makes it tricky to track who owes whom.  
To solve this, I built a LINE bot that helps with real-time expense tracking, makes it easy to review spending records and calculate balances, and even summarizes the past three months of shared expenses. Both users simply need to add the bot as a LINE friend to start using it.

## Features

- 自動記錄日期、消費項目與金額  
Automatically records date, item, and amount spent
- 可查詢近三個月的花費紀錄  
View expense summaries from the past 3 months
- 自動計算雙方結算結果，誰應該補多少錢  
Automatically calculates how much one person owes the other
- 使用 Google 試算表作為免費雲端資料庫  
Uses Google Spreadsheets as a free, cloud-based database
- 採用 Google Apps Script 開發，無需額外伺服器部署  
Built with Google Apps Script, no need for a separate server

## Prerequisite

1. 註冊一個 [Linebot](https://developers.line.biz/en/) 帳號
2. 在自己的雲端硬碟中建立一個試算表，開啟兩個工作表  
`工作表1` A, B, C 3個 column 格式設定成純文字，D, E 設定成數值

<img width="1081" height="636" alt="Image" src="https://github.com/user-attachments/assets/03b80d16-07d1-41f5-b949-fd64cf093684" /> 

`工作表2`B1, C1, E1 ~ E3 可以自己輸入，A2 ~ A4 的月份不用寫，程式會自己抓  
F1, F2 填入公式(會在試算表內做一些簡單運算)
```
F1 = sumif('工作表1'!B:B, "User2付錢", '工作表1'!D:D)
F2 = sumif('工作表1'!B:B, "User1付錢", '工作表1'!E:E)
F3 = F2 - F1
```

<img width="1397" height="296" alt="Image" src="https://github.com/user-attachments/assets/9fa50aa3-3dde-4ed8-a760-d25a4754c2c6" />

1. 建立一個 Google App Script 專案 (建議把專案跟試算表放在同一個資料夾裡，後續有新增的檔案也可以放一起方便管理)

## How to deploy

1. 將 `main.js` 的內容複製，貼到你的 Google App Script 專案上，在 `CHANNEL_ACCESS_TOKEN` 中填入你的 LINE API Token
```
var CHANNEL_ACCESS_TOKEN = "***"; // Keep this token private. Do not share it with anyone.
```

在 `sheet_url` 的中填入你的 Google 試算表連結
```
var sheet_url = 'https://docs.google.com/spreadsheets/...'
```

2. 左邊服務要添加 sheets v4，點選 App Script 網頁的部署按鈕，選擇「新增佈署作業」

<img width="1767" height="833" alt="Image" src="https://github.com/user-attachments/assets/9c8bc722-4bec-4452-bbdb-0fe801bc2e32" />

3. 種類設定為「網路應用程式」，將存取權限改為「所有人」，再按部署

<img width="750" height="572" alt="Image" src="https://github.com/user-attachments/assets/6d1ad5bd-e4c1-4ee0-a317-47ee24dfcba3" />

4. 接著瀏覽器會出現小視窗，點按「授予存取權」：

<img width="935" height="410" alt="Image" src="https://github.com/user-attachments/assets/7e01b5c0-94ab-47e6-8736-6c52a348b8dc" />

5. 選取 Google 帳號後，點選左下小灰字「顯示進階設定」，並點選左下方的「前往 ***」( 此為正常流程 )

<img width="616" height="423" alt="Image" src="https://github.com/user-attachments/assets/9aa4efff-c7a1-4be3-b8f2-19db9d0a44ee" />

6. 點選允許：

<img width="432" height="622" alt="Image" src="https://github.com/user-attachments/assets/3f9225d2-9e6e-4d3c-84ec-642b262bd7ce" />

7. 將下面的網址複製起來，貼到你的 LINE Bot Console -> Messaging API 的 Webhook(底下的Use webhook記得打開)

<img width="1108" height="241" alt="Image" src="https://github.com/user-attachments/assets/eb79e144-fba0-4091-a975-33e8be7c0848" />

<img width="1502" height="256" alt="Image" src="https://github.com/user-attachments/assets/93514a1f-1d37-474b-9bc2-9bf82269e481" />

> **第一次需要全部流程都做一次，之後如果有更新程式只需要重做一次 2 & 7 就好。**

## How to use
可以先去[line Official Account Manager](https://manager.line.biz/)中設定一個好看的圖文選單 (使用期間可以設定久一點)，這部分可以參考網路上其他資源，這裡就不贅述了，或是也可以直接輸入指令到對話框裡。

附上我自己使用的選單。

<img width="779" height="633" alt="Image" src="https://github.com/user-attachments/assets/629d6bf5-6fc2-44d6-b017-3422c0f618d3" />

- `User1 / User2付錢`: 在圖文選單中點選誰付錢，輸入`品項 User1金額 User2金額` (兩兩中間都要空一格，沒空會跳錯誤)

<img width="908" height="481" alt="Image" src="https://github.com/user-attachments/assets/3a69a6fa-e94b-4ba5-a88d-4b6679a94762" />

- `小結`: 列出尚未結算的所有品項與暫時結餘金額

<img width="903" height="575" alt="Image" src="https://github.com/user-attachments/assets/c9d5a999-de5a-43b6-9846-c61ef1354b21" />

- `帳務結餘`: 輸出截至當下的結餘金額，並且清空消費記錄 (工作表1會清空，但工作表2每月的消費分析會留著)

<img width="906" height="248" alt="Image" src="https://github.com/user-attachments/assets/459acde0-6922-4548-99c3-dff898984540" />

- `刪除上筆`: 不小心打錯可以刪除上筆 (會同步處理消費分析)

<img width="906" height="206" alt="Image" src="https://github.com/user-attachments/assets/282bbed3-2773-4435-bf78-4af861321394" />

- `消費分析`: 輸入月份 (保留近3個月) 輸出雙方消費金額

<img width="910" height="576" alt="Image" src="https://github.com/user-attachments/assets/bdc2f5c4-c55e-46b4-a545-552e4ff6da42" />

> **<p.s.> 如果全部設定完但執行結果錯誤，很有可能是試算表內儲存格的數值格式錯誤。**

## Customization 

除了 LINE Token 跟 Google Sheet 連結之外，也可以自訂程式的一些細項或變數名稱，下面是一些變數：

| 變數名稱           | 說明與備註                                                            |
| ------------------ | --------------------------------------------------------------------- |
| `sheet_name`       | 儲存品項與金額的工作表名稱                                            |
| `reserve_list`     | 指向工作表1的內容，用來讀取或清空所有資料                             |
| `static_list`      | 指向工作表2的內容，用來讀取統計資料                                   |
| `current_list_row` | 工作表中最後一筆資料的行數                                            |
| `current_date`     | 執行當下的日期(格式: yyyy-MM-dd)                                      |
| `current_time`     | 執行當下的時間(格式: yyyy-MM-dd HH:mm)                                |
| `record`           | 使用者訊息拆解後的片段 (品項 金額1 金額2)                             |
| `item`             | 小結的時候記錄所有品項                                                |
| `reply_message`    | 回傳給 LINE 使用者的訊息陣列，需為 JSON 格式(請參考 LINE Message API) |
| `userMessage`      | 使用者發送的文字內容                                                  |
| `user_id`          | LINE 使用者的 ID，可用來查詢對應的名稱或辨識使用者                    |


reply_message 必須是一個 JSON 格式的內容 (或是也可以包裝成Flex message)，以文字訊息為例，格式如下：
```
reply_message = [{
    "type":"text", // 除非是最後一句，每一句後面要加逗號
    "text":"引號內打要回傳的文字"
}]
```

## Reference
- [LINE 官方 Messaging API 開發文件](https://developers.line.biz/en/docs/messaging-api/overview/)
- [Google App Script 開發文件](https://developers.google.com/apps-script/reference/spreadsheet?hl=zh-tw)

## Credits
特別感謝 [jcchang19](https://github.com/jschang19/plusone-linebot) 所開發的原始版本機器人，為本專案提供了極大的靈感與穩固的基礎。

Special thanks for the amazing work on the original version of this bot. It provided great inspiration and a strong foundation for this project.
