/**
 * Nexora — application backend
 *
 * Paste this into the Apps Script editor of the Google Sheet that should
 * collect applications (Extensions → Apps Script), then deploy it as a web
 * app. Full steps are in backend/SETUP.md.
 *
 * Every application becomes one row in the "Applications" tab. Resumes are
 * saved to a private Drive folder called "Nexora Resumes" and linked from
 * the row.
 */

const SHEET_NAME = "Applications";
const FOLDER_NAME = "Nexora Resumes";
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const HEADERS = [
  "Submitted", "Name", "Email", "College", "Course", "Year",
  "Departments", "Why join", "GitHub", "Resume",
];
const REQUIRED = ["name", "email", "college", "course", "year", "why"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);

    // bots fill the hidden "company" field; pretend it worked
    if (data.company) return json({ ok: true });

    for (const key of REQUIRED) {
      if (!data[key] || !String(data[key]).trim()) return json({ ok: false, error: "Missing " + key });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
      return json({ ok: false, error: "Invalid email" });
    }

    const resume = data.resume || {};
    const ext = String(resume.name || "").split(".").pop().toLowerCase();
    if (!resume.data || !RESUME_TYPES[ext]) return json({ ok: false, error: "Resume must be a PDF or Word file" });
    const bytes = Utilities.base64Decode(resume.data);
    if (bytes.length > MAX_RESUME_BYTES) return json({ ok: false, error: "Resume is over 5 MB" });

    const fileName = (String(data.name).trim() + " - " + resume.name).replace(/[\\/:*?"<>|]/g, "_").slice(0, 150);
    const file = getFolder().createFile(Utilities.newBlob(bytes, RESUME_TYPES[ext], fileName));

    const departments = Array.isArray(data.departments) ? data.departments.join(", ") : "";
    getSheet().appendRow([
      new Date(),
      cell(data.name), cell(data.email), cell(data.college), cell(data.course), cell(data.year),
      cell(departments), cell(data.why), cell(data.link), file.getUrl(),
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "Server error" });
  } finally {
    lock.releaseLock();
  }
}

// a quick way to check the deployment is live: open the web app URL in a browser
function doGet() {
  return json({ ok: true, service: "nexora-applications" });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getFolder() {
  const found = DriveApp.getFoldersByName(FOLDER_NAME);
  return found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
}

// keep text plain: trim long input and stop it being read as a spreadsheet formula
function cell(value) {
  const v = String(value == null ? "" : value).trim().slice(0, 5000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
