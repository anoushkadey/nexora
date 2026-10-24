# Connecting the join form to a Google Sheet

The site is static, so it can be hosted on Vercel or Netlify as it is. Applications go to a small Google Apps Script that you own. It adds each one as a row in a Google Sheet and saves the resume to your Google Drive. It's free and there's no server to run.

## One-time setup (about 5 minutes)

1. Create a new Google Sheet from the Nexora Google account, for example "Nexora Applications".
2. In the sheet, open **Extensions → Apps Script**.
3. Delete whatever is in `Code.gs`, paste in everything from `backend/google-apps-script.gs`, and save.
4. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Description: `Nexora applications`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**. Google asks you to authorise access to Sheets and Drive. Allow it. If you see "Google hasn't verified this app", click **Advanced → Go to (project name)**. It's your own script.
6. Copy the **Web app URL**. It ends in `/exec`.
7. Paste it into `js/data.js`:

   ```js
   formEndpoint: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```

8. Commit, push, and redeploy the site.

To check it's live, open the `/exec` URL in a browser. You should see `{"ok":true,"service":"nexora-applications"}`.

## What you get

- An **Applications** tab with the columns Submitted, Name, Email, College, Course, Year, Departments, Why join, GitHub and Resume. The tab is created on the first application.
- A private Drive folder, **Nexora Resumes**. Each row's Resume column links to the file. Only people you share the folder with can open the resumes.
- To give other team members access, share the Sheet, and the folder if they need the resumes.

## Changing the script later

After editing the script, publish the change with **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.

## Limits

- Resumes must be PDF or Word files of 5 MB or less. Both the form and the script check this.
- Apps Script's free quota is far more than a society's applications will use.
