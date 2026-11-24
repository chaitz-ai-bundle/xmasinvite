# Pre-Christmas Party invitation

- `index.html`: the invitation and RSVP form guests fill in
- `rsvps.html`: hosts-only guest list (passcode protected)
- `config.js`: where the RSVP Google Sheet link goes
- `apps-script/Code.gs`: the small script that saves replies into your Google Sheet
- `invite-message.md`: ready-to-send invite text

## Setup (about 5 minutes)

### 1. Create the Google Sheet that stores replies
1. Go to <https://sheets.new> and name the sheet, e.g. "Christmas Party RSVPs".
2. Menu **Extensions → Apps Script**.
3. Delete what's there, paste in everything from `apps-script/Code.gs`.
4. Change `ADMIN_PASSCODE = 'change-me'` to a passcode only you know. Save.

### 2. Publish it as a web app
1. Click **Deploy → New deployment**, then the gear icon → **Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Click **Deploy**, approve the permissions (choose your account → Advanced → Go to project).
4. Copy the **Web app URL** (ends in `/exec`).

### 3. Connect it
Paste the URL into `config.js`:
```js
RSVP_ENDPOINT: "https://script.google.com/macros/s/XXXX/exec"
```

### 4. Turn on hosting
Repository **Settings → Pages**: Source "Deploy from a branch", choose the branch and `/ (root)`, Save.

- Invitation: `https://<owner>.github.io/xmasinvite/`
- Guest list: `https://<owner>.github.io/xmasinvite/rsvps.html`

Replies also appear live in the Google Sheet itself.

Notes: a guest who replies again with the same name updates their earlier reply.
If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
