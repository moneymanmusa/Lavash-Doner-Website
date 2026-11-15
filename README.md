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
| Home | One-screen hero with a looping background animation (`js/hero.js`): a realistic döner bowl (rendered image, `assets/img/hero-bowl-art.webp`) drops in, sways and steams while garlic & orange sauce bottles drizzle liquid sauce that pools, splashes and drips; the sauce fades and it plays again. On desktop the bowl tilts toward the mouse. No scrolling needed |
| Döner Box special | Weekday 11–4 deal from Instagram |
| Menu | Category icon bar + photo cards (Gladiator-style). Data lives in `js/menu-data.js` |
| Instagram | Real @lavash_doner posts, each linking to the post |
| About Us | Story, features, stats |
| Testimonials | 5★ Google reviews slider + links to read/write Google reviews |
| Delivery | Uber Eats, DoorDash, SkipTheDishes cards |
| Location | Address, phone, live open/closed status, hours, storefront photo, directions |
| Contact | Form + Google Map at the bottom |

## Mobile

- On phones the hero stacks the bowl above the text, and switches to side-by-side when the phone is turned sideways.
- A floating **Call · Directions · Menu · Order** bar appears once you scroll past the hero.
- The hero animation runs a lighter version on phones and low-power devices (fewer drawn pieces, simpler sauce effect, 30fps).
- Tested at 320×568, 375×812, 414×896 and 812×375 (landscape) with no sideways scrolling.

## Editing

- **Settings** (contact email, phone, hours, links): `js/config.js`
- **Menu items / photos**: `js/menu-data.js` — drop new photos in `assets/img/menu/` and set `img`.
  Items without a photo show a "Photo coming soon" tile.
- **Reviews**: `js/reviews-data.js`
- **Hero animation**: swap the bowl by replacing `assets/img/hero-bowl-art.webp` (and the `-sm` version for phones) with a
  square, top-down bowl on a transparent background. Sauce colours are in `SAUCE`, timing in `TL`, loop length in `DUR` / `HOLD` / `FADE` (`js/hero.js`).

### Contact form
Set `contactEmail` in `js/config.js`. Messages are delivered through FormSubmit; the first
submission sends a one-time activation email to that address.

### Live Google reviews (optional)
Add a Google Maps Platform key with **Places API (New)** enabled (restrict it to your domain)
as `googlePlacesApiKey` in `js/config.js`. The newest 4★/5★ reviews will load automatically
and appear ahead of the saved ones.
