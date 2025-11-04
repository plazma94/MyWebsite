/* Album definitions for the Gallery (uses assets/apartments).
   Make sure this script is loaded BEFORE gallery.js.
   Dropdown buttons use data-album="apt2" | "apt4" | "apt5". Apt1/Apt3 are coming soon. */
(function () {
  const toItem = (src, caption) => ({ src, caption });

  window.GALLERY_ALBUMS = {
    // Apartment 2 -> A2 (removed the Bedroom alt image)
    apt2: {
      code: "A2",
      title: "Apartment 2 (A2)",
      items: [
        toItem("assets/apartments/A2_Kitchen.jpg", "A2 — Kitchen"),
        toItem("assets/apartments/A2_Livingroom.jpg", "A2 — Living room"),
        toItem("assets/apartments/A2_Office.jpg", "A2 — Office"),
        toItem("assets/apartments/A2_Bedroom.jpg", "A2 — Bedroom"),
        // toItem("assets/apartments/A2_Bedroom_1.jpg", "A2 — Bedroom (alt)"), // removed per request
        toItem("assets/apartments/A2_Bathroom.jpg", "A2 — Bathroom"),
        toItem("assets/apartments/A2_Bathroom_1.jpg", "A2 — Bathroom (alt)"),
        toItem("assets/apartments/A2_KidsRoom.jpg", "A2 — Kids room"),
        toItem("assets/apartments/A2_KidsRoom_1.jpg", "A2 — Kids room (alt)"),
      ],
    },

    // Apartment 4 -> B2
    apt4: {
      code: "B2",
      title: "Apartment 4 (B2)",
      items: [
        toItem("assets/apartments/B2_Kitchen.jpg", "B2 — Kitchen"),
        toItem("assets/apartments/B2_LivingRoom.jpg", "B2 — Living room"),
        toItem("assets/apartments/B2_Bedroom.jpg", "B2 — Bedroom"),
        toItem("assets/apartments/B2_Bedroom_1.jpg", "B2 — Bedroom (alt)"),
        toItem("assets/apartments/B2_Bathroom.jpg", "B2 — Bathroom"),
        toItem("assets/apartments/B2_Bathroom_1.jpg", "B2 — Bathroom (alt)"),
      ],
    },

    // Apartment 5 -> C1
    apt5: {
      code: "C1",
      title: "Apartment 5 (C1)",
      items: [
        toItem("assets/apartments/C1_Kitchen.jpg", "C1 — Kitchen"),
        toItem("assets/apartments/C1_Living-Kitchen.jpg", "C1 — Living & Kitchen"),
        toItem("assets/apartments/C1_LivingRoom.jpg", "C1 — Living room"),
        toItem("assets/apartments/C1_Bedroom.jpg", "C1 — Bedroom"),
        toItem("assets/apartments/C1_Office.jpg", "C1 — Office"),
        toItem("assets/apartments/C1_Bathroom.jpg", "C1 — Bathroom"),
        toItem("assets/apartments/C1_Bathroom_1.jpg", "C1 — Bathroom (alt)"),
      ],
    },

    // Coming soon placeholders (kept empty arrays)
    apt1: { code: "A1", title: "Apartment 1 - COMING SOON", items: [] },
    apt3: { code: "A3", title: "Apartment 3 - COMING SOON", items: [] },
  };
})();