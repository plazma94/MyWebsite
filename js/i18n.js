/* i18n.js
   ENG / GER / SRB translations.
   Updates:
   - hero.cta -> "Choose Apartment"
   - scenes.s3.title -> "Swiss life in Zug, Huobstrasse 73" (localized)
   - scenes.s3.body  -> descriptive copy you provided
*/
(function(){
  const dictionaries = {
    eng: {
      nav: { segments: "SEGMENTS", map: "MAP", technology: "TECHNOLOGY", contactCta: "CONTACT US" },
      scenes: {
        intro: { title: "Intro Scene", body: "Welcome — short introduction to what the viewer is about to experience." },
        s2: { title: "Scene 2", body: "Establishing core idea; motion comes alive here." },
        s3: {
          title: "Swiss life in Zug, Huobstrasse 73",
          body: "All dreams come true in the wonderful area of Zug: the magical old town, the famous sunrise over the lake, and of course the snow-covered Alps on the horizon. In this prestigious setting, »The Lux« is planned to be built on the sunny slope of the Zugerberg, a luxury villa project with an outdoor pool and magnificent views."
        },
        s4: {
        title: "Refined Living Above Lake Zug",
        body: "Warm color palettes, exquisite materials, and fine details lend each room an aura of perfect harmony. This is not just a place to live – it’s a place to thrive.\nThe location is unmatched: from the expansive terraces and panoramic windows, enjoy sweeping views over Lake Zug to Mount Pilatus and Mount Rigi – and, on clear days."
        },
        s5: {
         title: "Highlights of this villa include",
         body: "A spacious outdoor pool, nestled in a beautifully landscaped garden – perfect for unforgettable summer days with family and guests. Multiple garage spaces, offering comfort and security at the highest level. Generous living and sleeping areas, providing space for privacy, gatherings, and creative expression."
        },
      },
      hero: {
        titleLine1: "ArchiThor housing",
        titleLine2: "estate",
        lead: "A quiet place in a great neighborhood. Enjoy the nature and the quality of Swiss life in Hünenberg.",
        cta: "Choose Apartment",
        loc: {
          cityLine: "Hünenberg,",
          addressLine: "Zug, Huobstrasse 73<br>Switzerland"
        },
        metrics: {
          shopDistanceValue: "0.5",
          shopDistanceLabel: "to shops and<br>bus stops",
          ringDistanceValue: "2",
          ringDistanceLabel: "to E41 Highway",
          forestDistanceValue: "2",
          forestDistanceLabel: "to Lake Zug"
        }
      },
      houseDetail: {
        back: "To house list",
        code: "C1",
        meta: {
          plotLabel: "m²", plotValue: "129.5",
          houseLabel: "HOUSE, m²", houseValue: "107.5",
          priceLabel: "PRICE, EUR", priceValue: "835.000",
          dateLabel: "DATE", dateValue: "3Q/2026"
        },
        spec: {
          kitchenLabel:"Kitchen, Living, Dining", kitchenValue:"32.5 m²",
          bed1Label:"Bedroom", bed1Value:"17.5 m²",
          cabinet1Label:"Bathroom", cabinet1Value:"8 m²",
          garageLabel:"Garage", garageValue:"22 m²",
          bed2Label:"(unused)", bed2Value:"",
          cabinet2Label:"Balcony", cabinet2Value:"27 m²",
          livingLabel:"Office", livingValue:"13 m²",
          wardrobeLabel:"Entry", wardrobeValue:"8 m²"
        },
        docLabel:"House documentation",
        docFile:"HOUSE_DOCUMENTATION.PDF",
        bookCta:"BOOK A CALL"
      },
      location: {
        title: "Location",
        items: {
          ring: "E41 Highway", bus: "Bus Stop", play: "Playground", school: "Primary School",
          store: "Grocery Store", clinic: "Clinic", pharmacy: "Pharmacy", nature: "Woods & Lake"
        },
        distances: {
          ring: "2 km", bus: "0.4 km", play: "0.2 km", school: "1.5 km",
          store: "0.4 km", clinic: "0.5 km", pharmacy: "0.5 km", nature: "0.4 km"
        },
        map: { takeMe: "Take me there" },
      },
      tech: {
        title: "Construction technology",
        walls: { h: "Walls", p: "Porotherm ceramic block" },
        heating: { h: "Heating", p: "Gas, Underfloor" },
        styro: { h: "Styrofoam", p: "Facade 20cm" },
        roof: { h: "Roof", p: "Silicone plaster" },
        recovery: { h: "Heat recovery", p: "Heat recovery in ventilation system" },
        facade: { h: "Facade", p: "Silicone plaster, Waterproof" },
        windows: { h: "Windows", p: "Warm, Triple-glazed, Energy-efficient plastic" },
        inst: { h: "Installations", p: "Electric, Water supply, Sewage, Gas, Fiber optic, Central heating" },
        ceilings: { h: "Ceilings", p: "Cast-in-place reinforced concrete" }
      },
      /* Added: brand section translations */
      brand: {
        title: "Other projects of the developer",
        lead: "Check out other projects on the developer's website"
      },
      contact: {
        title: "Let’s talk!",
        eyebrow: "SEND THE EMAIL",
        name: "Name",
        email: "Email",
        message: "Tell us about your project",
        messagePH: "Describe your project goals, timeline, budget focus...",
        attach: "Add attachment",
        send: "SEND",
        book: "BOOK A CALL",
        writeUs: "WRITE US",
        callUs: "CALL US",
        address: "ADDRESS",
        emailValue: "contact@prographers.com",
        phoneValue: "(+48) 692 223 170",
        addrValue: "05-420, Józefów, Tadeusza 22<br>Poland",
        privacy: "I agree that my data in this form will be sent to contact@prographers.com and will be read by human beings. We will answer you as soon as possible. If you sent this form by mistake or want to remove your data, you can let us know by sending an email to contact@prographers.com. We will never send you any spam or share your data with third parties."
      }
      
    },

    ger: {
      nav: { segments: "SEGMENTE", map: "KARTE", technology: "TECHNOLOGIE", contactCta: "KONTAKT" },
      scenes: {
        intro: { title: "Intro-Szene", body: "Willkommen – kurze Einführung in das, was Sie gleich erleben." },
        s2: { title: "Szene 2", body: "Grundidee wird etabliert; die Bewegung erwacht." },
        s3: {
          title: "Schweizer Leben in Zug, Huobstrasse 73",
          body: "Alle Träume werden in der wunderbaren Region Zug wahr: die magische Altstadt, der berühmte Sonnenaufgang über dem See und natürlich die schneebedeckten Alpen am Horizont. In diesem prestigeträchtigen Umfeld ist »The Lux« am sonnigen Hang des Zugerbergs geplant – ein Luxusvillenprojekt mit Außenpool und grandioser Aussicht."
        },
        s4: {
          title: "Gehobenes Wohnen über dem Zugersee",
          body: "Warme Farbpaletten, erlesene Materialien und feine Details verleihen jedem Raum eine Aura perfekter Harmonie. Dies ist nicht nur ein Ort zum Wohnen – es ist ein Ort, um aufzublühen.\nDie Lage ist unvergleichlich: Von den großzügigen Terrassen und Panoramafenstern genießen Sie weite Blicke über den Zugersee bis zum Pilatus und zur Rigi – und an klaren Tagen."
        },
        s5: {
          title: "Zu den Highlights dieser Villa gehören",
          body: "Ein großzügiger Außenpool, eingebettet in einen wunderschön gestalteten Garten – perfekt für unvergessliche Sommertage mit Familie und Gästen. Mehrere Garagenstellplätze, die Komfort und Sicherheit auf höchstem Niveau bieten. Großzügige Wohn- und Schlafbereiche, die Raum für Privatsphäre, Begegnungen und kreativen Ausdruck schaffen."
        },
      },
      hero: {
        titleLine1: "ArchiThor Wohn",
        titleLine2: "anlage",
        lead: "Ein ruhiger Ort in einer großartigen Nachbarschaft. Erleben Sie Natur und Schweizer Lebensqualität in Hünenberg.",
        cta: "Wohnung wählen",
        loc: {
          cityLine: "Hünenberg,",
          addressLine: "Zug, Huobstrasse 73<br>Schweiz"
        },
        metrics: {
          shopDistanceValue: "0.5",
          shopDistanceLabel: "zu Geschäften und<br>Busstopps",
          ringDistanceValue: "2",
          ringDistanceLabel: "zur Autobahn E41",
          forestDistanceValue: "2",
          forestDistanceLabel: "zum Zugersee"
        }
      },
      houseDetail: {
        back: "Zur Hausliste",
        code: "C1",
        meta: {
          plotLabel: "m²", plotValue: "129.5",
          houseLabel: "HAUS, m²", houseValue: "107.5",
          priceLabel: "PREIS, EUR", priceValue: "835.000",
          dateLabel: "DATUM", dateValue: "3Q/2026"
        },
        spec: {
          kitchenLabel:"Küche / Wohnen / Essen", kitchenValue:"32.5 m²",
          bed1Label:"Schlafzimmer", bed1Value:"17.5 m²",
          cabinet1Label:"Bad", cabinet1Value:"8 m²",
          garageLabel:"Garage", garageValue:"22 m²",
          bed2Label:"(ungenutzt)", bed2Value:"",
          cabinet2Label:"Balkon", cabinet2Value:"27 m²",
          livingLabel:"Büro", livingValue:"13 m²",
          wardrobeLabel:"Eingang", wardrobeValue:"8 m²"
        },
        docLabel:"Hausdokumentation",
        docFile:"HAUS_DOKUMENTATION.PDF",
        bookCta:"ANRUF BUCHEN"
      },
      location: {
        title: "Lage",
        items: {
          ring: "Autobahn E41", bus: "Bushaltestelle", play: "Spielplatz", school: "Grundschule",
          store: "Lebensmittelgeschäft", clinic: "Klinik", pharmacy: "Apotheke", nature: "Wald & See"
        },
        distances: {
          ring: "2 km", bus: "0,4 km", play: "0,2 km", school: "1,5 km",
          store: "0,4 km", clinic: "0,5 km", pharmacy: "0,5 km", nature: "0,4 km"
        },
        map: { takeMe: "Zeig es mir" },
      },
      tech: {
        title: "Bautechnologie",
        walls: { h: "Wände", p: "Porotherm-Ziegelblock" },
        heating: { h: "Heizung", p: "Gas, Fußbodenheizung" },
        styro: { h: "Styropor", p: "Fassade 20 cm" },
        roof: { h: "Dach", p: "Silikonputz" },
        recovery: { h: "Wärmerückgewinnung", p: "Wärmerückgewinnung im Lüftungssystem" },
        facade: { h: "Fassade", p: "Silikonputz, wasserdicht" },
        windows: { h: "Fenster", p: "warm, dreifach verglast, energieeffizient (Kunststoff)" },
        inst: { h: "Installationen", p: "Elektrik, Wasser, Abwasser, Gas, Glasfaser, Zentralheizung" },
        ceilings: { h: "Decken", p: "Ortbeton (Stahlbeton)" }
      },
      /* Added: brand section translations */
      brand: {
        title: "Weitere Projekte des Entwicklers",
        lead: "Entdecken Sie weitere Projekte auf der Website des Entwicklers"
      },
      contact: {
        title: "Sprechen wir!",
        eyebrow: "E-MAIL SENDEN",
        name: "Name",
        email: "E-Mail",
        message: "Projektbeschreibung",
        messagePH: "Beschreiben Sie Ziele, Zeitrahmen, Budgetschwerpunkte...",
        attach: "Anhang hinzufügen",
        send: "SENDEN",
        book: "ANRUF BUCHEN",
        writeUs: "SCHREIBEN SIE UNS",
        callUs: "RUFEN SIE UNS AN",
        address: "ADRESSE",
        emailValue: "contact@prographers.com",
        phoneValue: "(+48) 692 223 170",
        addrValue: "05-420, Józefów, Tadeusza 22<br>Polen",
        privacy: "Ich stimme zu, dass meine Daten aus diesem Formular an contact@prographers.com gesendet und von Menschen gelesen werden. Wir antworten so schnell wie möglich. Wenn Sie dieses Formular versehentlich gesendet haben oder Ihre Daten entfernen möchten, schreiben Sie uns. Wir versenden keinen Spam und teilen keine Daten mit Dritten."
      }
    },

    srb: {
      nav: { segments: "SEGMENTI", map: "MAPA", technology: "TEHNOLOGIJA", contactCta: "KONTAKT" },
      scenes: {
        intro: { title: "Uvodna scena", body: "Dobrodošli – kratak uvod u iskustvo koje sledi." },
        s2: { title: "Scena 2", body: "Osnovna ideja se uspostavlja; pokret oživljava." },
        s3: {
          title: "Švajcarski život u Zugu, Huobstrasse 73",
          body: "Svi snovi se ostvaruju u predivnom području Zuga: čarobni stari grad, čuveno svitanje nad jezerom i, naravno, snežne Alpe na horizontu. U ovom prestižnom okruženju planiran je projekat »The Lux« na sunčanoj padini Zugerberga – luksuzna vila sa spoljnim bazenom i veličanstvenim pogledom."
        },
        s4: {
          title: "Prefinjen život iznad jezera Zug",
          body: "Topli koloriti, vrhunski materijali i fini detalji svakom prostoru daju auru savršene harmonije. Ovo nije samo mesto za život – već mesto za napredak.\nLokacija je nenadmašna: sa prostranih terasa i kroz panoramske prozore pružaju se pogledi preko jezera Zug ka Pilatusu i Rigiju – a u vedrim danima."
        },
        s5: {
          title: "Istaknute pogodnosti ove vile uključuju",
          body: "Prostran spoljašnji bazen, smešten u prelepo uređenom vrtu – savršen za nezaboravne letnje dane sa porodicom i gostima. Više garažnih mesta, koja nude komfor i sigurnost na najvišem nivou. Prostrane dnevne i spavaće zone, obezbeđuju prostor za privatnost, druženje i kreativni izraz."
        },
      },
      hero: {
        titleLine1: "ArchiThor stambeno",
        titleLine2: "naselje",
        lead: "Mirno mesto u odličnom komšiluku. Uživajte u prirodi i švajcarskom kvalitetu života u Hünenbergu.",
        cta: "Izaberi stan",
        loc: {
          cityLine: "Hünenberg,",
          addressLine: "Zug, Huobstrasse 73<br>Švajcarska"
        },
        metrics: {
          shopDistanceValue: "0.5",
          shopDistanceLabel: "do prodavnica i<br>autobusa",
          ringDistanceValue: "2",
          ringDistanceLabel: "do autoputa E41",
          forestDistanceValue: "2",
          forestDistanceLabel: "do jezera Zug"
        }
      },
      houseDetail: {
        back: "Nazad na listu",
        code: "C1",
        meta: {
          plotLabel: "m²", plotValue: "129.5",
          houseLabel: "KUĆA, m²", houseValue: "107.5",
          priceLabel: "CENA, EUR", priceValue: "835.000",
          dateLabel: "DATUM", dateValue: "3Q/2026"
        },
        spec: {
          kitchenLabel:"Kuhinja, dnevna, trpezarija", kitchenValue:"32.5 m²",
          bed1Label:"Spavaća soba", bed1Value:"17.5 m²",
          cabinet1Label:"Kupatilo", cabinet1Value:"8 m²",
          garageLabel:"Garaža", garageValue:"22 m²",
          bed2Label:"(ne koristi se)", bed2Value:"",
          cabinet2Label:"Terasa", cabinet2Value:"27 m²",
          livingLabel:"Kancelarija", livingValue:"13 m²",
          wardrobeLabel:"Ulaz", wardrobeValue:"8 m²"
        },
        docLabel:"Dokumentacija kuće",
        docFile:"DOKUMENTACIJA_KUĆE.PDF",
        bookCta:"ZAKAŽI POZIV"
      },
      location: {
        title: "Lokacija",
        items: {
          ring: "E41 Autoput", bus: "Autobuska stanica", play: "Igralište", school: "Osnovna škola",
          store: "Prodavnica", clinic: "Klinika", pharmacy: "Apoteka", nature: "Šuma i jezero"
        },
        distances: {
          ring: "2 km", bus: "0,4 km", play: "0,2 km", school: "1,5 km",
          store: "0,4 km", clinic: "0,5 km", pharmacy: "0,5 km", nature: "0,4 km"
        },
        map: { takeMe: "Odvedi me tamo" },
      },
      tech: {
        title: "Građevinska tehnologija",
        walls: { h: "Zidovi", p: "Porotherm keramički blok" },
        heating: { h: "Grejanje", p: "Gasno, Podno" },
        styro: { h: "Stiropor", p: "Fasada 20cm" },
        roof: { h: "Krov", p: "Silikonska žbuka" },
        recovery: { h: "Rekuperacija", p: "Povrat toplote u ventilacionom sistemu" },
        facade: { h: "Fasada", p: "Silikonska žbuka, Vodootporna" },
        windows: { h: "Prozori", p: "Topli, Trostruko staklo, Energetski efikasni (plastika)" },
        inst: { h: "Instalacije", p: "Električne, Vodovod, Kanalizacija, Gas, Optika, Centralno grejanje" },
        ceilings: { h: "Plafoni", p: "Monolitni armirani beton" }
      },
      /* Added: brand section translations */
      brand: {
        title: "Ostali projekti investitora",
        lead: "Pogledajte ostale projekte na sajtu investitora"
      },
      contact: {
        title: "Hajde da pričamo!",
        eyebrow: "POŠALJITE NAM E-MAIL",
        name: "Ime",
        email: "Email",
        message: "Ispričajte nam o projektu",
        messagePH: "Opišite ciljeve, rok, budžet...",
        attach: "Dodaj prilog",
        send: "POŠALJI",
        book: "ZAKAŽI POZIV",
        writeUs: "PIŠITE NAM",
        callUs: "POZOVITE NAS",
        address: "ADRESA",
        emailValue: "contact@prographers.com",
        phoneValue: "(+48) 692 223 170",
        addrValue: "05-420, Józefów, Tadeusza 22<br>Poljska",
        privacy: "Slažem se da će moji podaci iz ovog formulara biti poslati na contact@prographers.com. Odgovorićemo što je pre moguće. Ako ste greškom poslali ili želite brisanje podataka, javite nam. Ne šaljemo spam niti delimo podatke."
      }
    }
  };

  const fallbackLang = 'eng';

  function getDict(lang){
    return dictionaries[lang] || dictionaries[fallbackLang];
  }

  function resolvePath(obj, path){
    if(!path) return "";
    return path.split('.').reduce((acc, key)=> (acc && acc[key] != null) ? acc[key] : undefined, obj);
  }

  function applyToNodes(lang){
    const dict = getDict(lang);
    const fallback = getDict(fallbackLang);

    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const val = resolvePath(dict, key) ?? resolvePath(fallback, key) ?? '';
      if(typeof val === 'string') el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const key = el.getAttribute('data-i18n-html');
      const val = resolvePath(dict, key) ?? resolvePath(fallback, key) ?? '';
      if(typeof val === 'string') el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder');
      const val = resolvePath(dict, key) ?? resolvePath(fallback, key) ?? '';
      if(typeof val === 'string') el.setAttribute('placeholder', val);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>{
      const key = el.getAttribute('data-i18n-aria-label');
      const val = resolvePath(dict, key) ?? resolvePath(fallback, key) ?? '';
      if(typeof val === 'string') el.setAttribute('aria-label', val);
    });
  }

  window.I18N = {
    setLang(lang){ applyToNodes(lang); },
    getCurrentDict(lang){ return getDict(lang); },
    available(){ return Object.keys(dictionaries); }
  };
})();