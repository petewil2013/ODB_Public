# Our Daily Bread — Website

Website for **Our Daily Bread LLC**, a Catholic-inspired artisan sourdough bakery in New England.

**Domain:** odbread.com

---

## Quick Start

1. Open `index.html` in a browser, or run a local server:
   ```bash
   npx serve .
   ```
2. Or use Live Server in VS Code.

---

## Setup Checklist

### Contact Form (G-Suite + reCAPTCHA)
The contact form sends submissions to your Gmail and a Google Sheet. See **SETUP_GSUITE.md** for full instructions. You will need to:
1. Create reCAPTCHA keys at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Create a Google Sheet and add the Apps Script from `google-apps-script/Code.gs`
3. Deploy the script as a Web app
4. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` and `YOUR_RECAPTCHA_SITE_KEY` in `index.html`

### Contact Info
Contact details are set to:
- **Phone:** 603-209-3032
- **Email:** Peter.ODBread@gmail.com

### Simply Bread App Link
When your bakery is live on Simply Bread, the Order section already links to the app. You may want to add a direct storefront URL if Simply Bread provides one for your bakery.

---

## Project Structure

```
ODB/
├── index.html          # Main page (Home, About, Order, Contact)
├── css/styles.css      # Brand styles
├── js/main.js          # Nav toggle, form handling
├── images/
│   └── wheat-emblem.svg  # Logo emblem
├── WEBSITE_PLAN.md     # Design & content plan
└── README.md           # This file
```

---

## Brand Colors

| Color      | Hex       |
|-----------|-----------|
| Warm Sepia| `#C6A676` |
| Iron Brown| `#4A3B2E` |
| Brick Red | `#A7322B` |
| Cream     | `#F9F5EC` |

---

## Deployment

Deploy to any static host:
- **Netlify:** Drag `index.html` and folders into Netlify Drop
- **Vercel:** `vercel` from project root
- **GitHub Pages:** Push to repo, enable Pages

Point your domain **odbread.com** to the hosting provider's DNS.
