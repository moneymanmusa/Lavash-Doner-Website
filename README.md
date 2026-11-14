# Lavash Döner — Website

One-page website for **Lavash Döner** (Lavash Doner & Kebab), 3055 Argentia Rd, Mississauga, ON.
Plain HTML/CSS/JS — no build step. Open `index.html`, or serve the folder:

```bash
python -m http.server 5173
```

## What's on the page

| Section | Notes |
|---|---|
| Top bar | Logo/name scrolls to top · Home · Menu dropdown (jumps to each category) · About Us · Testimonials · Delivery · Location · Instagram & TikTok |
| Home | Scroll-driven hero: garlic & hot-sauce bottles pour over the döner plate, splats burst, wrap & sandwich fly in; the text gets more detailed as you scroll |
| Döner Box special | Weekday 11–4 deal from Instagram |
| Menu | Category icon bar + photo cards (Gladiator-style). Data lives in `js/menu-data.js` |
| Instagram | Real @lavash_doner posts, each linking to the post |
| About Us | Story, features, stats |
| Testimonials | 5★ Google reviews slider + links to read/write Google reviews |
| Delivery | Uber Eats, DoorDash, SkipTheDishes cards |
| Location | Address, phone, live open/closed status, hours, storefront photo, directions |
| Contact | Form + Google Map at the bottom |

## Editing

- **Settings** (contact email, phone, hours, links): `js/config.js`
- **Menu items / photos**: `js/menu-data.js` — drop new photos in `assets/img/menu/` and set `img`.
  Items without a photo show a "Photo coming soon" tile.
- **Reviews**: `js/reviews-data.js`
- **Hero photos**: `assets/img/hero-bowl.webp` (the plate), `assets/img/hero-wrap.webp`, and
  `assets/img/menu/chicken-doner-sandwich.webp` — replace these to change the animated food.

### Contact form
Set `contactEmail` in `js/config.js`. Messages are delivered through FormSubmit; the first
submission sends a one-time activation email to that address.

### Live Google reviews (optional)
Add a Google Maps Platform key with **Places API (New)** enabled (restrict it to your domain)
as `googlePlacesApiKey` in `js/config.js`. The newest 4★/5★ reviews will load automatically
and appear ahead of the saved ones.
