/* ============================================================
   LAVASH DÖNER — SITE SETTINGS
   Edit the values below; nothing else needs to change.
   ============================================================ */
window.LAVASH_CONFIG = {
  /* Where the "Contact us" form should send messages.
     Leave empty until you're ready — the form will tell visitors to call instead.
     Once set, the first message sent triggers a one-time activation email
     from FormSubmit (formsubmit.co) to this address — click "Activate" in it. */
  contactEmail: "",

  /* OPTIONAL — live Google reviews.
     Add a Google Maps Platform API key (with "Places API (New)" enabled and
     restricted to your website's domain) to pull the newest 4★/5★ Google reviews
     automatically. Without a key, the hand-picked 5★ reviews below are shown. */
  googlePlacesApiKey: "",

  /* Google Place ID for Lavash Doner Restaurant, 3055 Argentia Rd (verified). */
  googlePlaceId: "ChIJAXB82KhrK4gRfqTzk14QUsA",

  phone: "+19058240707",
  phoneDisplay: "(905) 824-0707",
  email: "", /* public email shown in the Location/Contact sections, if you have one */

  address: "3055 Argentia Rd, Mississauga, ON L5N 8E1",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lavash%20Doner%20Restaurant%2C%203055%20Argentia%20Rd%2C%20Mississauga%2C%20ON&query_place_id=ChIJAXB82KhrK4gRfqTzk14QUsA",

  /* Opening hours, 24h clock (America/Toronto). 0 = Sunday. */
  hours: {
    0: ["11:00", "22:00"],
    1: ["11:00", "23:00"],
    2: ["11:00", "23:00"],
    3: ["11:00", "23:00"],
    4: ["11:00", "23:00"],
    5: ["11:00", "23:00"],
    6: ["11:00", "23:00"]
  },

  social: {
    instagram: "https://www.instagram.com/lavash_doner/",
    tiktok: "https://www.tiktok.com/@lavash_doner"
  },

  delivery: {
    ubereats: "https://www.ubereats.com/ca/store/lavash-doner-%26-kebab/6Euni8B8UlqhHTbIkvkUjw",
    doordash: "https://www.doordash.com/en-CA/store/lavash-doner-mississauga-35322455/76394364/",
    skip: "https://www.skipthedishes.com/lavash-doner-and-kebab"
  }
};
