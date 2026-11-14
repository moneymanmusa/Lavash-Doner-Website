/* ============================================================
   LAVASH DÖNER — MENU
   Names & descriptions from the restaurant's Uber Eats, DoorDash
   and SkipTheDishes listings. To add a photo later, drop the file
   in assets/img/menu/ and set `img` to its file name.
   `fav: true` shows the "Fan favourite" tag.
   ============================================================ */
window.LAVASH_MENU = [
  {
    id: "plates",
    title: "Plates",
    icon: "plate",
    blurb: "Generous plates loaded with döner or flame-grilled kebab, rice or bulgur, fresh salad and warm bread. Come hungry.",
    items: [
      { name: "Chicken Döner Plate", img: "chicken-doner-plate.webp", fav: true,
        desc: "Shaved chicken döner straight off the rotisserie with rice, crisp salad and warm bread, finished with our white sauce." },
      { name: "Mix Döner Plate", img: "mix-doner-plate.webp", fav: true,
        desc: "The best of both — chicken and beef döner sliced fresh from the spit and served together with crisp salad and our sauces." },
      { name: "Beef Döner Plate", img: "beef-doner-plate.webp", fav: true,
        desc: "Thinly sliced, seasoned beef döner served as a full plate with fresh salad and our sauces." },
      { name: "Iskender Kebab", img: "iskender-kebab.webp", fav: true,
        desc: "Thinly sliced döner over buttery pita pieces, topped with tomato sauce and served with grilled pepper, roasted tomato and yogurt." },
      { name: "Adana Kebab Plate", img: "adana-kebab-plate.webp",
        desc: "Two hand-minced Adana kebab skewers off the grill with bulgur pilaf, mixed salad, grilled tomato & pepper, and bread." },
      { name: "Beef Shish Plate", img: "beef-shish-plate.webp",
        desc: "Tender beef shish kebab seasoned with Mediterranean spices, over rice with slaw, grilled pepper, tomato and pita." },
      { name: "Chicken Shish Plate", img: "chicken-shish-plate.webp",
        desc: "Marinated chicken shish skewers over rice with salad, grilled pepper, tomato and bread." },
      { name: "Falafel Plate", img: "",
        desc: "Crispy falafel seasoned with classic Middle Eastern spices, served plate-style with all the fixings." }
    ]
  },
  {
    id: "wraps",
    title: "Lavash Wraps",
    icon: "wrap",
    blurb: "Our namesake. Juicy döner and kebab rolled tight in soft, warm lavash with fresh veggies and house sauces.",
    items: [
      { name: "Chicken Döner Wrap", img: "chicken-doner-wrap.webp", fav: true,
        desc: "Sliced chicken döner with red cabbage and onions, rolled in warm lavash." },
      { name: "Beef Döner Wrap", img: "beef-doner-wrap.webp", fav: true,
        desc: "Thinly sliced, seasoned beef döner rolled in a soft lavash wrap." },
      { name: "Mix Döner Wrap", img: "",
        desc: "Chicken and beef döner, thinly sliced and rolled together in lavash." },
      { name: "Adana Wrap", img: "",
        desc: "Adana-style minced meat kebab, fresh off the grill and wrapped in lavash bread." },
      { name: "Beef Shish Wrap", img: "",
        desc: "Beef shish kebab rolled in flatbread — easy to enjoy on the go." },
      { name: "Chicken Shish Wrap", img: "",
        desc: "Chunks of grilled chicken shish wrapped in flatbread." },
      { name: "Falafel Wrap", img: "",
        desc: "Ground chickpea falafel rolled in flatbread with fresh veggies and sauce." }
    ]
  },
  {
    id: "sandwiches",
    title: "Döner Sandwiches",
    icon: "sandwich",
    blurb: "Fresh-baked Turkish bread, split warm and stuffed with döner, salad and sauce — the way it's done on the streets of Istanbul.",
    items: [
      { name: "Chicken Döner Sandwich", img: "chicken-doner-sandwich.webp", fav: true,
        desc: "Thinly shaved rotisserie chicken döner piled into fresh-baked bread with salad and sauce." },
      { name: "Beef Döner Sandwich", img: "beef-doner-sandwich.webp", fav: true,
        desc: "Thinly sliced beef döner layered in soft bread for a hearty, savoury sandwich." },
      { name: "Mix Döner Sandwich", img: "mix-doner-sandwich.webp",
        desc: "A mix of chicken and beef döner shaved from the rotisserie, served as a sandwich." },
      { name: "Beef Shish Sandwich", img: "beef-shish-sandwich.webp",
        desc: "Grilled beef shish kebab pieces with Middle Eastern spices, served in a sandwich." },
      { name: "Adana Shish Sandwich", img: "",
        desc: "Turkish-style seasoned ground meat kebab with fresh vegetables and herbs in our bread." },
      { name: "Chicken Shish Sandwich", img: "",
        desc: "Grilled chicken shish kebab pieces served in a sandwich." },
      { name: "Falafel Sandwich", img: "",
        desc: "Sandwich filled with crispy ground-chickpea falafel." }
    ]
  },
  {
    id: "pides",
    title: "Pides & Lahmacun",
    icon: "pide",
    blurb: "Turkish flatbreads baked to order — the boat-shaped pide and the thin, crispy lahmacun.",
    items: [
      { name: "Lahmacun", img: "lahmacun.webp", fav: true,
        desc: "Thin Turkish flatbread topped with finely minced meat, tomato and herbs, baked crisp and served with lemon and onion salad." },
      { name: "Sucuklu Pide", img: "sucuklu-pide.webp",
        desc: "Boat-shaped flatbread topped with slices of sucuk (beef sausage) and melted cheese, cut into shareable pieces." },
      { name: "Spinach Cheese Pide", img: "spinach-cheese-pide.webp",
        desc: "Boat-shaped flatbread filled with spinach and cheese, baked and cut into slices." },
      { name: "Cheese Pide", img: "",
        desc: "Boat-shaped Turkish flatbread topped with melted cheese." }
    ]
  },
  {
    id: "combos",
    title: "Combos & Specials",
    icon: "combo",
    blurb: "Your favourite wrap or sandwich with fries and a pop — plus our lunch deals.",
    items: [
      { name: "2 Wrap Combo", img: "wrap-combo-for-2.webp", fav: true, tag: "Lunch Special",
        desc: "Lunch for two: 2 wraps, 2 fries and 2 pops." },
      { name: "Beef Döner Wrap + Fries + Pop", img: "beef-doner-wrap-combo.webp",
        desc: "Sliced beef döner wrapped in soft flatbread, served with fries and a pop." },
      { name: "2 Lahmacun Deal", img: "lahmacun-2.webp", tag: "Lunch Special",
        desc: "Two thin Turkish flatbreads topped with seasoned minced meat, tomato and herbs." },
      { name: "Chicken Döner Wrap + Fries + Pop", img: "",
        desc: "Chicken döner in flatbread, served with fries and a pop." },
      { name: "Mix Döner Wrap + Fries + Pop", img: "",
        desc: "Mixed döner meats, thinly sliced and wrapped in flatbread, served with fries and a pop." },
      { name: "Falafel Wrap Combo", img: "",
        desc: "Rolled flatbread filled with falafel, served with fries and a pop." }
    ]
  },
  {
    id: "poutine",
    title: "Poutine, Fries & Sides",
    icon: "fries",
    blurb: "Golden fries, loaded poutine and the classic Turkish sides.",
    items: [
      { name: "Fries", img: "fries.webp", fav: true,
        desc: "Crisp golden fries finished with a drizzle of our creamy sauce." },
      { name: "Chicken Poutine", img: "", fav: true,
        desc: "Fries, cheese curds and gravy, loaded with chicken döner." },
      { name: "Beef Poutine", img: "",
        desc: "Fries topped with cheese curds, gravy and beef döner." },
      { name: "Classic Poutine", img: "",
        desc: "Fries topped with cheese curds and gravy." },
      { name: "Lentil Soup", img: "",
        desc: "Hearty, savoury Turkish red lentil soup." },
      { name: "Falafel (4 pcs)", img: "",
        desc: "Four pieces of fried chickpea falafel, seasoned with herbs and spices." },
      { name: "Rice", img: "",
        desc: "A side of seasoned rice to complete your meal." },
      { name: "Bulgur", img: "",
        desc: "Turkish bulgur pilaf made from cracked wheat." }
    ]
  },
  {
    id: "salads",
    title: "Salads",
    icon: "salad",
    blurb: "Crisp, fresh and colourful — on their own or topped with döner.",
    items: [
      { name: "Shepherd Salad", img: "shepherd-salad.webp",
        desc: "Classic Turkish çoban salad — tomatoes, cucumbers, red cabbage, carrots and fresh greens." },
      { name: "Greek Salad", img: "greek-salad.webp",
        desc: "Fresh greens, tomatoes, cucumbers and feta, garnished with olives and drizzled with olive oil." },
      { name: "Chicken Döner Salad", img: "",
        desc: "Shaved chicken döner over a mixed green salad." },
      { name: "Beef Döner Salad", img: "",
        desc: "Thinly sliced beef döner served over salad greens." }
    ]
  },
  {
    id: "desserts",
    title: "Desserts",
    icon: "dessert",
    blurb: "Traditional Turkish sweets to finish strong.",
    items: [
      { name: "Künefe", img: "kunefe.webp", fav: true, tag: "S · M · L",
        desc: "Shredded pastry with a soft, stretchy cheese centre, soaked in syrup and topped with crushed pistachios. Served hot." },
      { name: "Baklava (2 pcs)", img: "baklava.webp", fav: true,
        desc: "Two pistachio-topped baklava squares: flaky phyllo layers with nut filling, soaked in syrup." },
      { name: "Sütlaç", img: "sutlac.webp",
        desc: "Creamy Turkish rice pudding with a caramelized top, finished with crushed pistachios." },
      { name: "Halka Tatlı", img: "halka-tatli.webp",
        desc: "Crisp, syrup-soaked fried dough rings — a classic Turkish street dessert." }
    ]
  },
  {
    id: "platters",
    title: "Family Platters",
    icon: "platter",
    blurb: "Feeding the crew? Big boards of döner, kebabs and sides built for sharing.",
    items: [
      { name: "Mix Platter for 2", img: "mix-platter-2.webp", fav: true,
        desc: "Sliced döner, Adana kebab, chicken and beef shish, grilled tomatoes and peppers on flatbread, with rice and bulgur." },
      { name: "Mix Platter for 4", img: "",
        desc: "A shareable assortment of our favourites, portioned to serve four." }
    ]
  },
  {
    id: "drinks",
    title: "Drinks",
    icon: "drink",
    blurb: "Something cold to wash it down.",
    items: [
      { name: "Ayran", img: "", desc: "Traditional savoury yogurt drink — smooth, tangy and refreshing." },
      { name: "Uludağ Orange", img: "", desc: "The classic Turkish orange soda." },
      { name: "Can Pop", img: "", desc: "Cola, Diet Cola, Lemon-Lime and more." },
      { name: "Water", img: "", desc: "Still bottled water." }
    ]
  }
];
