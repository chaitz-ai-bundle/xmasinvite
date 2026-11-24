/**
 * RSVP backend for the Pre-Christmas Party invite.
 * Stores replies in the Google Sheet this script is attached to.
 * Setup steps: see README.md in the repository.
 */

// CHANGE THIS: the passcode you'll type into rsvps.html to view replies.
const ADMIN_PASSCODE = 'change-me';

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Last updated', 'Name', 'Response', 'Guests', 'Message', 'First replied'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Stop text like "=SUM(...)" being treated as a spreadsheet formula.
function clean_(value, max) {
  let s = String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

// Guests submit a reply. Same name again = update their earlier reply.
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const name = clean_(d.name, 100);
    const response = ['Yes', 'No', 'Maybe'].indexOf(d.response) >= 0 ? d.response : '';
    if (!name || !response) return json_({ ok: false, error: 'invalid' });
    const guests = response === 'No' ? 0 : Math.max(1, Math.min(10, parseInt(d.guests, 10) || 1));
    const message = clean_(d.message, 500);

    const sh = sheet_();
    const rows = sh.getDataRange().getValues();
    const key = name.replace(/^'/, '').toLowerCase();
    const now = new Date();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).replace(/^'/, '').trim().toLowerCase() === key) {
        sh.getRange(i + 1, 1, 1, 5).setValues([[now, name, response, guests, message]]);
        return json_({ ok: true, updated: true });
      }
    }
    sh.appendRow([now, name, response, guests, message, now]);
    return json_({ ok: true, updated: false });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

// The dashboard reads all replies (passcode required).
function doGet(e) {
  if (String((e && e.parameter && e.parameter.key) || '') !== ADMIN_PASSCODE) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  const rows = sheet_().getDataRange().getValues();
  rows.shift();
  return json_({
    ok: true,
    rsvps: rows.map(function (r) {
      return {
        updated: r[0], name: String(r[1]).replace(/^'/, ''), response: r[2],
        guests: r[3], message: String(r[4]).replace(/^'/, ''), created: r[5]
      };
    })
  });
}
