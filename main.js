function doPost(e) {
  // LINE Messenging API Token
  var CHANNEL_ACCESS_TOKEN = ''; // TODO: Replace with your LINE Channel Access Token
  // 以 JSON 格式解析 User 端傳來的 e 資料
  var msg = JSON.parse(e.postData.contents);

  /* 
  * LINE API JSON 解析資訊
  *
  * replyToken : 一次性回覆 token
  * user_id : 使用者 user id，查詢 username 用
  * message : 使用者訊息，用於判斷是否為預約關鍵字
  * event_type : 訊息事件類型
  */

  const sheet_url = ''; // TODO: Replace with your Google Sheet URL
  const sheet_name = '工作表1';
  const SpreadSheet = SpreadsheetApp.openByUrl(sheet_url);
  let reserve_list = SpreadSheet.getSheetByName(sheet_name)
  const static_name = '工作表2';
  let static_list = SpreadSheet.getSheetByName(static_name);
  let current_list_row = reserve_list.getLastRow(); // 取得工作表最後一欄（ 直欄數 ）
  let current_date = Utilities.formatDate(new Date(), "GMT+8", "yyyy-MM-dd"); // 取得執行時的當下時間
  let current_time = Utilities.formatDate(new Date(), "GMT+8", "yyyy-MM-dd HH:mm"); // 取得執行時的當下時間
  let record = [];
  var item = [];

  const event_type = msg.events[0].source.type;
  const user_id = msg.events[0].source.userId;
  var replyToken = msg.events[0].replyToken;
  var message = msg.events[0].message.text;

  let reply_message = []; // 空白回覆訊息陣列，後期會加入 JSON    

  // 回傳訊息給line 並傳送給使用者
  function send_to_line() {
    var url = 'https://api.line.me/v2/bot/message/reply';
    UrlFetchApp.fetch(url, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      },
      'method': 'post',
      'payload': JSON.stringify({
        'replyToken': replyToken,
        'messages': reply_message,
      }),
    });
  }

  // 將輸入值 word 轉為 LINE 文字訊息格式之 JSON
  function format_text_message(word) {
    let text_json = [{
      "type": "text",
      "text": word
    }]
    return text_json;
  }


  //品項 User1金額 User2金額
  //ex 便當 100 50
  function validateInput(input) {
    const parts = input.trim().split(" ");
    if (parts.length !== 3) return false;

    const [food, cash1Str, cash2Str] = parts;
    const cash1 = Number(cash1Str);
    const cash2 = Number(cash2Str);

    return (
      typeof food === "string" &&
      !isNaN(cash1) &&
      !isNaN(cash2)
    );
  }

  function check_month(dateStr) {
    return dateStr.split("-")[1];
  }

  if (typeof replyToken === 'undefined') {
    return;
  }

  // main funciton
  switch (true) {
    // ===== 顯示帳務結餘 =====
    case (message === "帳務結餘"):
      try {
        if (current_list_row === 0) {
          text = "目前沒有品項";
        } else {
          let final = static_list.getRange('F3').getValue();
          if (final > 0) {
            text = `截至${current_time}\nUser2 欠 User1 ${final} 元`;
          } else if (final < 0) {
            text = `截至${current_time}\nUser1 欠 User2 ${-final} 元`;
          } else {
            text = `截至${current_time}\n打平`;
          }
          // 清空暫存表格
          reserve_list.clear({ formatOnly: false, contentsOnly: true });
        }
        reply_message = format_text_message(text);
      } catch {
        reply_message = format_text_message("發生錯誤1");
      }
      send_to_line();
      break;

    // ===== 新增付款人資訊 =====
    case (message === "User1付錢"):
    case (message === "User2付錢"):
      try {
        if (current_list_row === 0) {
          // 首筆資料
          reserve_list.getRange(current_list_row + 1, 1).setValue(current_date);
          reserve_list.getRange(current_list_row + 1, 2).setValue(message);
          text = "請輸入品項 User1 User2";
        } else {
          // 如果上筆還沒輸入品項，提醒補上
          let previous_item = reserve_list.getRange(current_list_row, 3).getValue();
          if (previous_item === "") {
            previous_user = reserve_list.getRange(current_list_row, 2).getValue();
            text = "已輸入過 " + previous_user +"\n請先輸入品項 User1 User2";
          } else {
            reserve_list.getRange(current_list_row + 1, 1).setValue(current_date);
            reserve_list.getRange(current_list_row + 1, 2).setValue(message);
            text = "請輸入品項 User1 User2";
          }
        }
        reply_message = format_text_message(text);
      } catch {
        reply_message = format_text_message("發生錯誤");
      }
      send_to_line();
      break;

    // ===== 顯示目前消費明細與結餘 =====
    case (message === "小結"):
      try {
        if (current_list_row === 0) {
          text = "目前沒有結餘";
        } else {
          item = reserve_list.getRange(1, 3, current_list_row, 1).getValues();
          let result = item.join("\n");
          let final = static_list.getRange('F3').getValue();
          if (final > 0) {
            text = `目前有的品項:\n${result}\n目前結餘:\nUser2 欠 User1 ${final} 元`;
          } else if (final < 0) {
            text = `目前有的品項:\n${result}\n目前結餘:\nUser1 欠 User2 ${-final} 元`;
          } else {
            text = `目前有的品項:\n${result}\n目前打平`;
          }
        }
        reply_message = format_text_message(text);
      } catch {
        reply_message = format_text_message("發生錯誤3");
      }
      send_to_line();
      break;

    // ===== 新增一筆品項與消費金額 =====
    case (validateInput(message) && reserve_list.getRange(current_list_row, 3, 1, 1).isBlank()):
      try {
        let [food, ...cash] = message.split(" ").map(val => isNaN(val) ? val : Number(val));
        let mon = check_month(current_date);
        record.push(food, cash[0], cash[1]);
        reserve_list.getRange(current_list_row, 3, 1, 3).setValues([record]);

        let row = mon % 3 + 2;
        if (static_list.getRange(row, 1).getValue() == mon) {
          // 累加當月消費
          let r = static_list.getRange(row, 2).getValue() + cash[0];
          let c = static_list.getRange(row, 3).getValue() + cash[1];
          static_list.getRange(row, 2).setValue(r);
          static_list.getRange(row, 3).setValue(c);
        } else {
          // 新月份，建立新行
          static_list.getRange(row, 1).setValue(mon);
          static_list.getRange(row, 2, 1, 2).setValues([cash]);
        }

        record.length = 0;
        reply_message = format_text_message("輸入完成");
      } catch {
        reply_message = format_text_message("發生錯誤4");
      }
      send_to_line();
      break;

    // ===== 提示使用者輸入月份 =====
    case (message === "消費分析"):
      try {
        reply_message = format_text_message("請輸入月份(1~12)");
      } catch {
        reply_message = format_text_message("發生錯誤5");
      }
      send_to_line();
      break;

    // ===== 回傳指定月份的消費分析 =====
    case (!isNaN(message)):
      try {
        let mon = parseInt(message) % 3 + 2;
        let User1_cost = static_list.getRange(mon, 2).getValue();
        let User2_cost = static_list.getRange(mon, 3).getValue();
        text = `${message}月 消費分析:\nUser1消費 ${User1_cost} 元\nUser2消費 ${User2_cost} 元`;
        reply_message = format_text_message(text);
      } catch {
        reply_message = format_text_message("發生錯誤6");
      }
      send_to_line();
      break;

    // ===== 刪除上一筆資料並更新統計表格 =====
    case (message === "刪除上筆"):
      try {
        let d_mon = reserve_list.getRange(current_list_row, 1).getValue();
        let mon = check_month(d_mon) % 3 + 2;

        // 減去上筆金額
        let r_static = static_list.getRange(mon, 2).getValue() - reserve_list.getRange(current_list_row, 4).getValue();
        let c_static = static_list.getRange(mon, 3).getValue() - reserve_list.getRange(current_list_row, 5).getValue();
        static_list.getRange(mon, 2).setValue(r_static);
        static_list.getRange(mon, 3).setValue(c_static);

        // 刪除整筆資料（含5欄）
        reserve_list.deleteRows(current_list_row, 5);
        reply_message = format_text_message("刪除完成");
      } catch {
        reply_message = format_text_message("發生錯誤7");
      }
      send_to_line();
      break;

    // ===== 無法辨識訊息 =====
    default:
      reply_message = format_text_message("發生錯誤8");
      send_to_line();
      break;
  }
  text = "發生錯誤9";
  reply_message = format_text_message(text);
  send_to_line();
}
