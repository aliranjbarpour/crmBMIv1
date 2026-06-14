/**
 * CRM API - Google Apps Script
 *
 * Google Sheet tabs:
 *
 * Leads:
 * نام و نام خانوادگی | شماره تماس | محصول مورد نظر | سورس ورودی | تاریخ ورودی | وضعیت | توضیحات تماس | تاریخ آخرین پیگیری
 *
 * Operators:
 * username | password | name
 */

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const LEADS_SHEET = "Leads";
const OPERATORS_SHEET = "Operators";

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doGet(e) {
  try {
    const action = String(e.parameter.action || "").trim();

    if (action === "getLeads") {
      return jsonResponse_(getLeads_());
    }

    if (action === "login") {
      return jsonResponse_(login_(e.parameter.username, e.parameter.password));
    }

    return jsonResponse_({ success: false, message: "action نامعتبر است" });
  } catch (err) {
    return jsonResponse_({ success: false, message: String(err) });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = String(data.action || "").trim();

    if (action === "login") {
      return jsonResponse_(login_(data.username, data.password));
    }

    if (action === "updateLead") {
      return jsonResponse_(
        updateLead_(data.rowId, data.status, data.comment, data.operatorName)
      );
    }

    return jsonResponse_({ success: false, message: "action نامعتبر است" });
  } catch (err) {
    return jsonResponse_({ success: false, message: String(err) });
  }
}

function getLeads_() {
  const sheet = getSpreadsheet_().getSheetByName(LEADS_SHEET);
  if (!sheet) {
    throw new Error('تب "Leads" پیدا نشد');
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return { success: true, data: [] };
  }

  const headers = values[0].map(function (h) {
    return String(h).trim();
  });
  const data = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (
      !row.some(function (cell) {
        return String(cell).trim() !== "";
      })
    ) {
      continue;
    }

    var item = { rowId: i + 1 };
    headers.forEach(function (header, index) {
      item[header] = row[index];
    });
    data.push(item);
  }

  return { success: true, data: data };
}

function login_(username, password) {
  const sheet = getSpreadsheet_().getSheetByName(OPERATORS_SHEET);
  if (!sheet) {
    throw new Error('تب "Operators" پیدا نشد');
  }

  const values = sheet.getDataRange().getValues();
  const inputUser = String(username || "").trim();
  const inputPass = String(password || "").trim();

  for (var i = 1; i < values.length; i++) {
    var rowUser = String(values[i][0] || "").trim();
    var rowPass = String(values[i][1] || "").trim();
    var rowName = String(values[i][2] || rowUser).trim();

    if (rowUser === inputUser && rowPass === inputPass) {
      return {
        success: true,
        operator: { name: rowName, username: rowUser },
      };
    }
  }

  return { success: false, message: "نام کاربری یا رمز عبور اشتباه است." };
}

function updateLead_(rowId, status, comment, operatorName) {
  const sheet = getSpreadsheet_().getSheetByName(LEADS_SHEET);
  if (!sheet) {
    throw new Error('تب "Leads" پیدا نشد');
  }

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (h) {
      return String(h).trim();
    });

  const statusCol = headers.indexOf("وضعیت") + 1;
  const commentCol = headers.indexOf("توضیحات تماس") + 1;
  const followUpCol = headers.indexOf("تاریخ آخرین پیگیری") + 1;

  if (statusCol === 0 || commentCol === 0) {
    throw new Error("ستون‌های وضعیت یا توضیحات تماس پیدا نشد");
  }

  const row = Number(rowId);
  if (!row || row < 2) {
    throw new Error("rowId نامعتبر است");
  }

  const timestamp = Utilities.formatDate(
    new Date(),
    "Asia/Tehran",
    "yyyy/MM/dd HH:mm"
  );
  const newEntry =
    "[" +
    timestamp +
    " - " +
    (operatorName || "اپراتور") +
    "] " +
    (comment || "");

  const existing = sheet.getRange(row, commentCol).getValue();
  const updatedComment = existing ? existing + "\n" + newEntry : newEntry;

  sheet.getRange(row, statusCol).setValue(status || "جدید");
  sheet.getRange(row, commentCol).setValue(updatedComment);

  if (followUpCol > 0) {
    sheet.getRange(row, followUpCol).setValue(new Date());
  }

  return { success: true };
}
