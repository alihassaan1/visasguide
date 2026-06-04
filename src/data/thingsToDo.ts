export interface Attraction {
  name: string;
  description: string;
  category: "Culture" | "Nature" | "Food" | "Adventure" | "Beach" | "History";
}

export interface ThingsToDoData {
  slug: string;
  country: string;
  countrySlug: string; // matches countries table slug for visa link
  mainCity: string;
  gygLocation: string; // search term used by GYG widget
  introduction: string;
  attractions: Attraction[];
  bestTimeToVisit: string;
  gettingAround: string;
  travelTips: string[];
  faqs: { question: string; answer: string }[];
}

export const thingsToDoData: ThingsToDoData[] = [
  {
    slug: "dominican-republic",
    country: "Dominican Republic",
    countrySlug: "dominican-republic",
    mainCity: "Punta Cana",
    gygLocation: "Dominican Republic",
    introduction:
      "The Dominican Republic is a Caribbean gem that blends powder-white beaches, lush mountains, and a vibrant Latin culture into one of the most rewarding destinations in the Americas. From the all-inclusive resorts of Punta Cana to the colonial cobblestones of Santo Domingo and the whale-watching bays of Samaná, every traveler finds something extraordinary. The country offers reliable infrastructure, friendly locals, and year-round sunshine, making it an easy choice for first-time Caribbean visitors as well as seasoned explorers. Whether you want to surf in Cabarete, hike Pico Duarte, or dance bachata at sunset, the Dominican Republic delivers a balance of adventure and relaxation few destinations can match.",
    attractions: [
      { name: "Bávaro Beach, Punta Cana", description: "Miles of white sand and turquoise water lined with palm trees and world-class resorts.", category: "Beach" },
      { name: "Zona Colonial, Santo Domingo", description: "The oldest European settlement in the Americas, with cobblestone streets and 16th-century architecture.", category: "History" },
      { name: "Samaná Peninsula", description: "Famous for humpback whale watching from January to March and the stunning Cayo Levantado.", category: "Nature" },
      { name: "Pico Duarte", description: "The highest peak in the Caribbean, a multi-day hike rewarded with breathtaking views.", category: "Adventure" },
      { name: "27 Charcos de Damajagua", description: "Cascading waterfalls you can climb, jump, and swim through with a guide.", category: "Adventure" },
      { name: "Cabarete", description: "A laid-back beach town and a global capital for kitesurfing and windsurfing.", category: "Adventure" },
      { name: "Los Haitises National Park", description: "Mangroves, hidden caves with Taíno petroglyphs, and dramatic limestone karsts.", category: "Nature" },
      { name: "Saona Island", description: "A protected island reserve with calm coves and natural pools perfect for a day trip.", category: "Beach" },
      { name: "Local Mercados & Mofongo", description: "Sample mofongo, sancocho, and fresh tropical fruit at neighborhood markets.", category: "Food" },
      { name: "Altos de Chavón", description: "A replica 16th-century Mediterranean village overlooking the Chavón River.", category: "Culture" },
    ],
    bestTimeToVisit:
      "The dry season from December to April offers the most reliable weather, with warm days and cooler evenings. May to November is hotter, greener, and significantly cheaper, but coincides with hurricane season — late August through October carries the highest risk.",
    gettingAround:
      "Most international visitors fly into Punta Cana (PUJ) or Santo Domingo (SDQ). Shared resort shuttles, metered taxis, and ride-hailing apps like Uber and InDriver work well in major cities. For longer trips, comfortable Caribe Tours and Metro buses connect every region, while renting a car gives you flexibility for the mountains and coast.",
    travelTips: [
      "Carry small bills in Dominican pesos — many small vendors do not accept cards.",
      "Tap water is not safe to drink; stick to bottled or filtered water.",
      "Tipping 10% is customary in restaurants if a service charge is not included.",
      "Learn a few Spanish phrases — English is common in resorts but rare in rural towns.",
      "Use sunscreen reef-safe formulas to help protect the Caribbean reefs.",
    ],
    faqs: [
      { question: "Do I need a visa to visit the Dominican Republic?", answer: "Most travelers (US, UK, EU, Canada) do not need a visa for stays up to 30 days. A tourist card is now included in your airfare." },
      { question: "Is the Dominican Republic safe for tourists?", answer: "Tourist areas are generally safe. Use normal precautions: avoid displaying valuables, use registered taxis, and stick to well-traveled areas at night." },
      { question: "What is the best area to stay for first-time visitors?", answer: "Punta Cana is ideal for beach and resort stays, while Santo Domingo suits travelers interested in history and city life." },
      { question: "How many days do I need in the Dominican Republic?", answer: "Plan for 5–7 days to combine a beach stay with one cultural or adventure excursion." },
      { question: "What currency is used and are US dollars accepted?", answer: "The Dominican peso (DOP) is the official currency. US dollars are widely accepted in resorts but you will get better value paying in pesos elsewhere." },
    ],
  },
  {
    slug: "montenegro",
    country: "Montenegro",
    countrySlug: "montenegro",
    mainCity: "Kotor",
    gygLocation: "Montenegro",
    introduction:
      "Montenegro packs dramatic fjord-like bays, medieval walled towns, and rugged mountain national parks into one of Europe's smallest and most underrated countries. The Bay of Kotor — often called Europe's southernmost fjord — rivals Norway for sheer beauty, while the Adriatic coast offers warm swimming beaches and luxury yacht harbors. Inland, Durmitor and Biogradska Gora reveal glacial lakes, deep canyons, and untouched forests. With short driving distances, affordable prices, and a relaxed Mediterranean pace, Montenegro is the perfect destination for travelers who want Europe without the crowds.",
    attractions: [
      { name: "Old Town of Kotor", description: "A UNESCO-listed medieval town tucked beneath limestone cliffs at the head of the bay.", category: "History" },
      { name: "Bay of Kotor Boat Tour", description: "Cruise past Our Lady of the Rocks and the village of Perast.", category: "Nature" },
      { name: "Sveti Stefan", description: "An iconic islet village turned luxury resort, best photographed from the coastal road.", category: "Culture" },
      { name: "Durmitor National Park", description: "Glacial lakes, the Tara Canyon, and hiking trails through pristine wilderness.", category: "Nature" },
      { name: "Tara River Rafting", description: "Whitewater rafting through Europe's deepest canyon.", category: "Adventure" },
      { name: "Lovćen National Park", description: "Drive the serpentine road to Njegoš Mausoleum for sweeping coastal views.", category: "Nature" },
      { name: "Budva Old Town & Beaches", description: "Lively walled town surrounded by some of the country's best beaches.", category: "Beach" },
      { name: "Ostrog Monastery", description: "A working monastery built into a vertical cliff face — one of Orthodox Christianity's holiest sites.", category: "Culture" },
      { name: "Konoba Dining", description: "Traditional konobas serve Njeguški pršut, fresh Adriatic fish, and local Vranac wine.", category: "Food" },
      { name: "Skadar Lake", description: "The largest lake in the Balkans, ideal for boat tours, birdwatching, and wine tasting.", category: "Nature" },
    ],
    bestTimeToVisit:
      "May, June, and September offer warm weather without the peak July–August crowds. Winter is great for skiing at Kolašin and Žabljak but coastal towns largely shut down.",
    gettingAround:
      "Tivat (TIV) and Podgorica (TGD) are the two main airports. Renting a car is the best way to see Montenegro — distances are short and roads are scenic, though mountain switchbacks demand confident driving. Buses connect all major towns affordably.",
    travelTips: [
      "The currency is the Euro even though Montenegro is not in the EU.",
      "Cash is preferred in smaller restaurants and markets.",
      "Drive the Kotor Serpentine in the morning to avoid tour-bus traffic.",
      "Slow ferry across the Bay of Kotor (Kamenari–Lepetane) saves an hour vs. driving around.",
      "Modest dress is required inside monasteries.",
    ],
    faqs: [
      { question: "Do I need a visa to visit Montenegro?", answer: "Citizens of the EU, US, UK, Canada, and Australia can stay up to 90 days visa-free." },
      { question: "Is Montenegro expensive?", answer: "Montenegro is more affordable than most EU coastal destinations, though peak-season Kotor and Budva can rival Croatia in price." },
      { question: "How many days do I need in Montenegro?", answer: "5–7 days is ideal to combine the Bay of Kotor, a national park, and one or two beach days." },
      { question: "Is Montenegro safe for tourists?", answer: "Yes — crime rates are very low and locals are generally welcoming to visitors." },
      { question: "Can I visit Montenegro from Croatia?", answer: "Yes — Dubrovnik is about a 2-hour drive from Kotor, and many travelers combine both on one trip." },
    ],
  },
  {
    slug: "albania",
    country: "Albania",
    countrySlug: "albania",
    mainCity: "Tirana",
    gygLocation: "Albania",
    introduction:
      "Albania is Europe's last great travel secret — a country of turquoise Riviera beaches, Ottoman-era stone towns, and rugged Accursed Mountains, all at a fraction of the cost of its Mediterranean neighbors. Tirana surprises with colorful buildings, buzzing cafés, and one of the Balkans' best food scenes, while the Albanian Riviera between Vlorë and Sarandë rivals Greece without the crowds. Add UNESCO-listed Gjirokastër and Berat, the alpine Valbona–Theth trek, and a generous, hospitable culture, and you have a destination delivering remarkable value in 2026.",
    attractions: [
      { name: "Tirana City Center", description: "Skanderbeg Square, the National History Museum, and the colorful Blloku district.", category: "Culture" },
      { name: "Berat — The City of a Thousand Windows", description: "UNESCO-listed white Ottoman houses stacked up the hillside.", category: "History" },
      { name: "Gjirokastër", description: "A perfectly preserved stone city and the birthplace of writer Ismail Kadare.", category: "History" },
      { name: "Albanian Riviera", description: "Beaches like Ksamil, Dhërmi, and Jale offer Greek-island looks at lower prices.", category: "Beach" },
      { name: "Butrint National Park", description: "Layered ruins of Greek, Roman, Byzantine, and Venetian civilizations on a peninsula.", category: "History" },
      { name: "Valbona to Theth Trek", description: "A legendary day-long hike through the Accursed Mountains.", category: "Adventure" },
      { name: "Blue Eye Spring", description: "A mesmerizing natural spring where deep blue water emerges from an unknown depth.", category: "Nature" },
      { name: "Krujë Castle & Bazaar", description: "Skanderbeg's stronghold above an authentic Ottoman bazaar.", category: "History" },
      { name: "Traditional Tavernas", description: "Try byrek, tavë kosi, and fresh seafood paired with raki.", category: "Food" },
      { name: "Lake Komani Ferry", description: "A spectacular 3-hour boat ride through fjord-like canyons en route to the mountains.", category: "Nature" },
    ],
    bestTimeToVisit:
      "May to early July and September are the sweet spots — warm enough for the coast, cool enough for the mountains. August is hot and busy on the Riviera; winter is quiet but ideal for cultural city stays.",
    gettingAround:
      "Tirana International Airport (TIA) is the main hub. Furgons (shared minibuses) and intercity buses are cheap and reliable. Renting a car gives the most freedom for the Riviera and mountain routes, though driving styles take adjustment.",
    travelTips: [
      "Currency is the Albanian Lek; ATMs are widely available in cities.",
      "Cash is essential outside big cities.",
      "Nod for 'no' and shake your head for 'yes' — it's the opposite of most countries.",
      "Hitchhiking is common and considered safe, especially in the mountains.",
      "Buy a local SIM (Vodafone or One) for affordable, fast mobile data.",
    ],
    faqs: [
      { question: "Do I need a visa to visit Albania?", answer: "Most Western travelers (US, UK, EU, Canada, Australia) can enter visa-free for up to 90 days." },
      { question: "Is Albania safe to travel in 2026?", answer: "Yes — Albania is consistently ranked among the safer European countries for travelers." },
      { question: "Is English spoken in Albania?", answer: "Younger Albanians and people in tourism speak good English. Italian is also widely understood." },
      { question: "How affordable is Albania?", answer: "Albania is among the cheapest countries in Europe — meals from €5, hostels from €10, and rental cars from €25/day." },
      { question: "How many days should I spend in Albania?", answer: "Plan 7–10 days to combine Tirana, a UNESCO town, the Riviera, and a mountain hike." },
    ],
  },
  {
    slug: "turkey",
    country: "Turkey",
    countrySlug: "turkey",
    mainCity: "Istanbul",
    gygLocation: "Turkey",
    introduction:
      "Turkey straddles Europe and Asia, offering a depth of history, landscape, and cuisine few countries match. Istanbul alone could fill a week with its Byzantine churches, Ottoman mosques, and humming bazaars, while Cappadocia delivers one of the world's most surreal balloon-flight experiences. Add the turquoise Mediterranean coast around Antalya, the ancient ruins of Ephesus, and the thermal terraces of Pamukkale, and Turkey becomes a destination of staggering variety — and remarkable value in 2026.",
    attractions: [
      { name: "Hagia Sophia & Blue Mosque, Istanbul", description: "Two of the world's most iconic religious buildings standing face to face.", category: "History" },
      { name: "Grand Bazaar & Spice Market", description: "Centuries of trade, color, and aroma in Istanbul's covered markets.", category: "Culture" },
      { name: "Cappadocia Hot Air Balloons", description: "A sunrise flight over fairy chimneys is a once-in-a-lifetime experience.", category: "Adventure" },
      { name: "Ephesus", description: "One of the best-preserved ancient Roman cities in the Mediterranean.", category: "History" },
      { name: "Pamukkale", description: "Cotton-white travertine terraces and the ruins of Hierapolis above.", category: "Nature" },
      { name: "Antalya Old Town (Kaleiçi)", description: "Ottoman houses, Roman ruins, and the Mediterranean's loveliest harbor.", category: "Beach" },
      { name: "Bodrum & The Aegean Coast", description: "Whitewashed villages, gulet boat trips, and crystalline coves.", category: "Beach" },
      { name: "Turkish Meze & Kebabs", description: "Slow lunches of meze, freshly baked pide, and char-grilled kebabs.", category: "Food" },
      { name: "Topkapi Palace", description: "Home of the Ottoman sultans for 400 years, with views of the Bosphorus.", category: "History" },
      { name: "Bosphorus Cruise", description: "See Istanbul from the water — Asia on one side, Europe on the other.", category: "Culture" },
    ],
    bestTimeToVisit:
      "April–May and September–October are ideal almost everywhere. Summer is best for the coast but uncomfortable in cities like Istanbul and Cappadocia. Winter brings snow to Cappadocia — magical for photography.",
    gettingAround:
      "Istanbul (IST), Antalya (AYT), and Izmir (ADB) are the main gateways. Turkish Airlines and budget carriers like Pegasus link cities quickly and cheaply. High-speed trains connect Istanbul, Ankara, and Konya, while intercity buses are comfortable and frequent.",
    travelTips: [
      "Have small Turkish lira for taxis and markets.",
      "Bargaining is expected in bazaars but not in shops.",
      "Carry a scarf for mosque visits (women cover heads, everyone covers shoulders/knees).",
      "Tap water is safe in major cities but locals still drink bottled.",
      "Book Cappadocia balloons in advance — flights cancel often due to wind.",
    ],
    faqs: [
      { question: "Do I need a visa to visit Turkey?", answer: "Many nationalities (US, UK, Canada, Australia) need an e-Visa, easily obtained online before travel. Most EU citizens are visa-free." },
      { question: "Is Turkey safe for tourists?", answer: "Tourist areas are generally safe. Check official travel advisories before visiting border regions in the southeast." },
      { question: "What is the currency of Turkey?", answer: "The Turkish lira (TRY). The exchange rate fluctuates, so cards are often preferable to changing large amounts of cash." },
      { question: "How many days do I need in Turkey?", answer: "10–14 days lets you combine Istanbul, Cappadocia, the Mediterranean coast, and Ephesus." },
      { question: "Is alcohol available in Turkey?", answer: "Yes — beer, wine, and rakı are widely available, although some conservative regions have fewer options." },
    ],
  },
  {
    slug: "uae",
    country: "United Arab Emirates",
    countrySlug: "united-arab-emirates",
    mainCity: "Dubai",
    gygLocation: "Dubai",
    introduction:
      "The United Arab Emirates blends record-breaking modernity with ancient Bedouin heritage, all served with five-star polish. Dubai dazzles with the world's tallest building, themed waterparks, and gold-laced shopping malls, while Abu Dhabi offers the world's largest single-dome mosque, Louvre Abu Dhabi, and Formula 1 thrills at Yas Island. Beyond the cities, golden deserts, dramatic Hajar Mountains, and quiet Ras Al Khaimah beaches reward travelers who venture further. With efficient infrastructure, English spoken everywhere, and year-round sunshine, the UAE is one of the easiest premium destinations to visit in 2026.",
    attractions: [
      { name: "Burj Khalifa", description: "The world's tallest building — book the 124th- or 148th-floor observation deck at sunset.", category: "Culture" },
      { name: "Sheikh Zayed Grand Mosque, Abu Dhabi", description: "Marble, mosaics, and the world's largest hand-knotted carpet.", category: "Culture" },
      { name: "Desert Safari", description: "Dune bashing, camel rides, and a sunset Bedouin-style dinner.", category: "Adventure" },
      { name: "Dubai Marina & JBR", description: "Skyscraper canyons, beach clubs, and yacht-lined promenades.", category: "Beach" },
      { name: "Old Dubai — Al Fahidi & The Creek", description: "Wind-tower houses, gold and spice souks, and traditional abra boat rides.", category: "History" },
      { name: "Louvre Abu Dhabi", description: "Jean Nouvel's stunning museum on the water at Saadiyat Island.", category: "Culture" },
      { name: "Ferrari World & Yas Island", description: "Theme parks, the F1 circuit, and waterparks all in one area.", category: "Adventure" },
      { name: "Palm Jumeirah", description: "Walk the boardwalk, visit Atlantis, or skydive over the iconic palm-shaped island.", category: "Adventure" },
      { name: "Emirati Cuisine", description: "Try machbous, luqaimat, and karak chai at local restaurants like Al Fanar.", category: "Food" },
      { name: "Hatta Mountains", description: "Kayak on a turquoise reservoir and explore hiking trails 1.5 hours from Dubai.", category: "Nature" },
    ],
    bestTimeToVisit:
      "November to March offers warm, dry weather perfect for outdoor sightseeing. April and October are warm but manageable. May to September is intensely hot — best for indoor attractions and hotel pools.",
    gettingAround:
      "Dubai (DXB) and Abu Dhabi (AUH) are major international hubs. Dubai's metro, trams, and Careem/Uber make city travel easy. Renting a car is recommended for trips to Abu Dhabi, Hatta, or the northern emirates.",
    travelTips: [
      "The official currency is the UAE Dirham (AED), pegged to the US Dollar.",
      "Dress modestly in malls, mosques, and government buildings — shoulders and knees covered.",
      "Alcohol is served in licensed hotels, restaurants, and bars only.",
      "Friday is the holy day; some attractions open later.",
      "Tap water is safe but most residents drink bottled.",
    ],
    faqs: [
      { question: "Do I need a visa to visit the UAE?", answer: "Many nationalities receive a free visa on arrival (US, UK, EU). Others can apply for an e-Visa online." },
      { question: "Is Dubai safe for solo and female travelers?", answer: "Dubai consistently ranks among the world's safest cities, including for solo female travelers." },
      { question: "What is the currency of the UAE?", answer: "The UAE Dirham (AED), with a fixed peg of approximately 3.67 to the US Dollar." },
      { question: "How many days do I need in the UAE?", answer: "5–7 days lets you combine Dubai's main attractions with a day or two in Abu Dhabi." },
      { question: "Can unmarried couples share a hotel room?", answer: "Yes — since 2020, unmarried couples can legally cohabit, and hotels do not require marriage certificates." },
    ],
  },
  {
    slug: "brazil",
    country: "Brazil",
    countrySlug: "brazil",
    mainCity: "Rio de Janeiro",
    gygLocation: "Brazil",
    introduction:
      "Brazil is a continent disguised as a country — Amazon rainforest, Atlantic beaches, vibrant cities, and the rhythm of samba everywhere you go. Rio de Janeiro dazzles with Christ the Redeemer, Sugarloaf, and Copacabana; Iguazu Falls thunders on the Argentine border; and Salvador pulses with Afro-Brazilian culture. The Pantanal wetlands deliver some of the world's best wildlife viewing, while the colonial towns of Minas Gerais offer baroque charm. Friendly, festive, and full of surprises, Brazil rewards every type of traveler in 2026.",
    attractions: [
      { name: "Christ the Redeemer & Corcovado", description: "Rio's iconic mountaintop statue with sweeping bay views.", category: "Culture" },
      { name: "Copacabana & Ipanema Beaches", description: "Two of the world's most famous urban beaches, ideal for sunset caipirinhas.", category: "Beach" },
      { name: "Sugarloaf Mountain", description: "A two-stage cable car to the best panoramic view of Rio.", category: "Nature" },
      { name: "Iguazu Falls", description: "275 waterfalls thundering through subtropical jungle — visit both Brazilian and Argentine sides.", category: "Nature" },
      { name: "Amazon Rainforest", description: "Lodges around Manaus offer canopy walks, river cruises, and wildlife treks.", category: "Adventure" },
      { name: "Salvador & Pelourinho", description: "Cobblestone streets, capoeira shows, and the heart of Afro-Brazilian culture.", category: "Culture" },
      { name: "Pantanal Wildlife", description: "Spot jaguars, capybaras, and caimans in the world's largest tropical wetland.", category: "Nature" },
      { name: "Fernando de Noronha", description: "A protected archipelago with crystal-clear water and world-class snorkeling.", category: "Beach" },
      { name: "Churrascaria & Feijoada", description: "All-you-can-eat grilled meats and Brazil's iconic bean stew.", category: "Food" },
      { name: "Ouro Preto", description: "A UNESCO-listed baroque town in the Minas Gerais mountains.", category: "History" },
    ],
    bestTimeToVisit:
      "Brazil is huge, so timing depends on the region. December–March is summer (best for the south and beaches). May–September is the dry season in the Amazon and Pantanal. Carnival usually falls in February or early March.",
    gettingAround:
      "Domestic flights are essential due to distance — LATAM, GOL, and Azul connect every region. Cities have Uber and 99, while long-distance buses are comfortable for routes like Rio–São Paulo. Rentals work well for coastal road trips.",
    travelTips: [
      "The currency is the Brazilian Real (BRL).",
      "Spanish is not Portuguese — learn a few Portuguese phrases.",
      "Avoid wearing flashy jewelry in big cities; stick to well-lit areas at night.",
      "Use Uber/99 instead of street taxis in Rio and São Paulo.",
      "Carry your hotel address in Portuguese — many cab drivers speak no English.",
    ],
    faqs: [
      { question: "Do I need a visa to visit Brazil?", answer: "Visa requirements have changed recently — US, Canadian, and Australian travelers need an e-Visa as of April 2025. EU and UK citizens are visa-free." },
      { question: "Is Brazil safe for tourists?", answer: "Tourist areas are generally safe with normal precautions. Avoid favelas without a guide and follow local advice about specific neighborhoods." },
      { question: "What language is spoken in Brazil?", answer: "Portuguese — not Spanish. English is limited outside major hotels and tourist sites." },
      { question: "How many days do I need in Brazil?", answer: "Plan at least 10–14 days to combine Rio with one other region (Iguazu, Amazon, or Salvador)." },
      { question: "When is Carnival?", answer: "Carnival dates change each year — typically late February or early March. Book accommodation 6+ months ahead." },
    ],
  },
  {
    slug: "netherlands",
    country: "Netherlands",
    countrySlug: "netherlands",
    mainCity: "Amsterdam",
    gygLocation: "Netherlands",
    introduction:
      "The Netherlands is one of Europe's most compact and rewarding destinations — flat, walkable, and laced with canals, bicycles, and world-class art. Amsterdam draws crowds for the Van Gogh Museum, Anne Frank House, and its 17th-century canal ring, but the country's other cities deserve equal attention. Rotterdam offers cutting-edge architecture, Utrecht has a beautiful old center without the crowds, and the Hague hosts the royal family and international courts. Add tulip fields, windmills, and a deep café culture, and the Netherlands delivers an effortlessly enjoyable trip in 2026.",
    attractions: [
      { name: "Amsterdam Canal Cruise", description: "See the UNESCO-listed 17th-century canal ring from the water.", category: "Culture" },
      { name: "Rijksmuseum & Van Gogh Museum", description: "Two of the world's most important art museums, side by side.", category: "Culture" },
      { name: "Anne Frank House", description: "A moving memorial to the young diarist — book tickets weeks in advance.", category: "History" },
      { name: "Keukenhof Gardens", description: "Open only March–May, with millions of tulips in bloom.", category: "Nature" },
      { name: "Zaanse Schans Windmills", description: "Working windmills, cheese makers, and clog workshops just outside Amsterdam.", category: "Culture" },
      { name: "Rotterdam Architecture", description: "Cube houses, Markthal, and Erasmus Bridge define Europe's most modern skyline.", category: "Culture" },
      { name: "Utrecht Old Town", description: "Wharf-level canals, a domed cathedral tower, and far fewer tourists than Amsterdam.", category: "History" },
      { name: "Giethoorn", description: "A picture-perfect village with no roads — explore by whisper boat.", category: "Nature" },
      { name: "Dutch Cuisine", description: "Try haring, bitterballen, stroopwafels, and Gouda straight from the source.", category: "Food" },
      { name: "Cycling the Countryside", description: "20,000+ km of bike paths through tulip fields, dunes, and villages.", category: "Adventure" },
    ],
    bestTimeToVisit:
      "April–May is tulip season and Keukenhof's prime time. June–August offers warm weather and long days. September–October bring fewer crowds and golden countryside.",
    gettingAround:
      "Schiphol Airport (AMS) is one of Europe's best hubs. The Dutch rail network (NS) is fast, frequent, and connects everywhere. Rent a bike (or use OV-fiets) — cycling is the local way to move within cities.",
    travelTips: [
      "The currency is the Euro.",
      "Most Dutch people speak excellent English.",
      "Tipping is appreciated but not required — round up to the nearest Euro.",
      "Carry a debit card with chip and PIN; many shops do not accept credit cards.",
      "Watch for bike lanes — they are not for walking.",
    ],
    faqs: [
      { question: "Do I need a visa to visit the Netherlands?", answer: "The Netherlands is in the Schengen Area. EU citizens enter freely; most others get 90 days visa-free or need a Schengen visa." },
      { question: "When can I see tulips in bloom?", answer: "Mid-March to mid-May, with peak bloom around mid-April." },
      { question: "Is Amsterdam expensive?", answer: "Yes, especially for accommodation. Visit Utrecht, Haarlem, or Rotterdam as more affordable bases." },
      { question: "How many days do I need?", answer: "3 days for Amsterdam alone; 5–7 days for a wider tour including Utrecht, Rotterdam, and the countryside." },
      { question: "Is cannabis legal?", answer: "Soft drugs are tolerated in licensed 'coffeeshops' for adults but technically not legal. Public consumption is restricted in some areas." },
    ],
  },
  {
    slug: "hungary",
    country: "Hungary",
    countrySlug: "hungary",
    mainCity: "Budapest",
    gygLocation: "Hungary",
    introduction:
      "Hungary is one of Central Europe's best-value destinations, anchored by Budapest — a city that fuses Habsburg grandeur, thermal baths, and a buzzing ruin-bar nightlife along the Danube. Beyond the capital, Lake Balaton offers a relaxed summer scene, while wine regions like Eger and Tokaj produce some of Europe's most distinctive bottles. Add Ottoman baths, baroque towns, and rich paprika-laden cuisine, and Hungary delivers far more than a single weekend in Budapest.",
    attractions: [
      { name: "Buda Castle & Fisherman's Bastion", description: "Hilltop views over the Pest skyline and the Danube.", category: "History" },
      { name: "Széchenyi Thermal Baths", description: "The largest medicinal bath complex in Europe — open year-round.", category: "Culture" },
      { name: "Hungarian Parliament", description: "Take an interior tour of one of Europe's most beautiful parliament buildings.", category: "History" },
      { name: "Ruin Bars of District VII", description: "Szimpla Kert and its neighbors defined Budapest's nightlife scene.", category: "Culture" },
      { name: "Danube River Cruise", description: "Best at night when the Chain Bridge and Parliament are illuminated.", category: "Culture" },
      { name: "Lake Balaton", description: "Central Europe's largest lake — boating, wine, and the volcanic Tihany Peninsula.", category: "Nature" },
      { name: "Eger", description: "Baroque town famous for its 'Bull's Blood' (Egri Bikavér) wine and Ottoman minaret.", category: "History" },
      { name: "Hungarian Cuisine", description: "Goulash, paprika chicken, lángos, and chimney cakes are essential tastes.", category: "Food" },
      { name: "Hollókő Village", description: "A UNESCO-listed Palóc village with traditional whitewashed houses.", category: "Culture" },
      { name: "Tokaj Wine Region", description: "Home of the legendary sweet wine once called the 'wine of kings'.", category: "Food" },
    ],
    bestTimeToVisit:
      "May, June, and September offer perfect sightseeing weather. December brings beautiful Christmas markets in Budapest. Avoid late July to mid-August if you dislike heat and crowds in the capital.",
    gettingAround:
      "Budapest Airport (BUD) is the main gateway. Within Budapest, the metro, trams, and buses are excellent and cheap. MÁV trains and the Volánbusz network connect the whole country affordably.",
    travelTips: [
      "The currency is the Hungarian Forint (HUF), not the Euro.",
      "Tipping 10% in restaurants is customary.",
      "Most younger Hungarians and people in tourism speak English.",
      "Validate metro tickets in the orange machines before boarding.",
      "Beware of 'consume bars' near the touristy parts of the city center.",
    ],
    faqs: [
      { question: "Do I need a visa to visit Hungary?", answer: "Hungary is in the Schengen Area. EU citizens enter freely; most others get 90 days visa-free or need a Schengen visa." },
      { question: "Is Budapest expensive?", answer: "It is one of the most affordable EU capitals — meals, transport, and thermal baths are noticeably cheaper than in Western Europe." },
      { question: "How many days do I need in Hungary?", answer: "3–4 days in Budapest is the minimum; add 2–3 days for Eger, Tokaj, or Lake Balaton." },
      { question: "What language is spoken?", answer: "Hungarian — one of the most unique languages in Europe. English is widely spoken in tourism areas." },
      { question: "Are the thermal baths worth it?", answer: "Yes — Széchenyi, Gellért, and Rudas are unique cultural experiences and excellent value." },
    ],
  },
  {
    slug: "bahamas",
    country: "Bahamas",
    countrySlug: "bahamas",
    mainCity: "Nassau",
    gygLocation: "Bahamas",
    introduction:
      "The Bahamas is more than a cruise stopover — it is an archipelago of 700 islands, each with its own personality, surrounded by some of the clearest water on Earth. Nassau combines colonial history and mega-resorts at Atlantis, while the Exumas hide the famous swimming pigs and uninhabited cays perfect for boat-day adventures. Eleuthera offers pink-sand beaches, Andros draws divers to the world's third-largest barrier reef, and Bimini provides Hemingway nostalgia and big-game fishing. With friendly locals, English spoken everywhere, and year-round warmth, the Bahamas is the Caribbean made effortlessly easy.",
    attractions: [
      { name: "Atlantis Paradise Island", description: "Aquariums, water slides, and the famous Leap of Faith — a complete resort experience.", category: "Adventure" },
      { name: "Exuma Swimming Pigs", description: "Big Major Cay's wild pigs swim out to greet boats — one of the Caribbean's iconic photos.", category: "Nature" },
      { name: "Pink Sand Beach, Harbour Island", description: "Three miles of soft, blush-tinted sand on Eleuthera's offshore island.", category: "Beach" },
      { name: "Thunderball Grotto", description: "A snorkeling cave made famous by the James Bond film.", category: "Adventure" },
      { name: "Nassau Straw Market & Bay Street", description: "Colonial buildings, the iconic Queen's Staircase, and local crafts.", category: "Culture" },
      { name: "Andros Barrier Reef", description: "World-class diving on the world's third-largest barrier reef.", category: "Adventure" },
      { name: "Dean's Blue Hole, Long Island", description: "One of the deepest known saltwater blue holes — a free-diving mecca.", category: "Nature" },
      { name: "Conch Salad & Cracked Conch", description: "Sample the Bahamian national specialty fresh off the boat.", category: "Food" },
      { name: "Bimini", description: "Hemingway's old haunt, with marlin fishing and the mysterious Bimini Road.", category: "Adventure" },
      { name: "Junkanoo Parade", description: "Vibrant street parades around Christmas and New Year showcase Bahamian heritage.", category: "Culture" },
    ],
    bestTimeToVisit:
      "December to April offers the most reliable weather and lowest humidity. May–November is hotter and includes hurricane season — late August to October carry the highest storm risk.",
    gettingAround:
      "Nassau (NAS) is the main hub. To reach the out islands, you'll use small inter-island flights (Bahamasair, Western Air), private charters, or ferry services like Bahamas Ferries. Renting a car works in Nassau and Eleuthera — remember to drive on the left.",
    travelTips: [
      "The Bahamian Dollar is pegged 1:1 with the US Dollar, which is also widely accepted.",
      "Tipping 15–18% is standard in restaurants.",
      "Use reef-safe sunscreen — the Bahamas has banned several chemical types.",
      "Buy local SIMs (Aliv, BTC) — US carriers can be expensive on roaming.",
      "Hurricane insurance is recommended if traveling June–November.",
    ],
    faqs: [
      { question: "Do I need a visa to visit the Bahamas?", answer: "Citizens of the US, UK, EU, Canada, and most Commonwealth countries do not need a visa for stays up to 90 days." },
      { question: "Is the Bahamas safe for tourists?", answer: "Resort areas are very safe. Use normal city precautions in downtown Nassau, especially after dark." },
      { question: "Can I use US Dollars in the Bahamas?", answer: "Yes — the US Dollar is accepted everywhere alongside the Bahamian Dollar." },
      { question: "How do I see the swimming pigs?", answer: "Most visitors take a day trip from Nassau or stay in the Exumas. Boat charters and group tours are widely available." },
      { question: "How many days do I need?", answer: "4–5 days for Nassau and one day trip; 7–10 days to explore an out island like Exuma or Eleuthera." },
    ],
  },
  {
    slug: "singapore",
    country: "Singapore",
    countrySlug: "singapore",
    mainCity: "Singapore",
    gygLocation: "Singapore",
    introduction:
      "Singapore is the world's most polished city-state — a futuristic skyline rising from manicured gardens, with an extraordinary multicultural food scene at its heart. In just 3–4 days you can wander Chinatown, Little India, and Kampong Glam; cool off in the rainforest-like Cloud Forest at Gardens by the Bay; ride the world's tallest observation wheel; and eat your way through Michelin-starred hawker stalls. Safe, efficient, and English-speaking, Singapore is the easiest gateway to Southeast Asia and a destination in its own right.",
    attractions: [
      { name: "Gardens by the Bay", description: "Supertree Grove, Cloud Forest, and Flower Dome define Singapore's green futurism.", category: "Nature" },
      { name: "Marina Bay Sands SkyPark", description: "The iconic boat-shaped rooftop with the best skyline view in Asia.", category: "Culture" },
      { name: "Sentosa Island", description: "Universal Studios, beaches, and Adventure Cove all on Singapore's resort island.", category: "Adventure" },
      { name: "Hawker Centres (Maxwell, Lau Pa Sat)", description: "Singapore's UNESCO-listed hawker food culture — try Hainanese chicken rice and chilli crab.", category: "Food" },
      { name: "Chinatown, Little India & Kampong Glam", description: "Three cultural quarters that capture the city's heritage in walking distance.", category: "Culture" },
      { name: "Singapore Zoo & Night Safari", description: "Two of the world's best zoos, with open-concept enclosures.", category: "Nature" },
      { name: "ArtScience Museum", description: "Immersive teamLab-style exhibitions inside the lotus-shaped building.", category: "Culture" },
      { name: "Botanic Gardens", description: "Singapore's only UNESCO World Heritage Site, with the National Orchid Garden.", category: "Nature" },
      { name: "Clarke Quay & Singapore River", description: "Riverside restaurants, bars, and bumboat cruises after dark.", category: "Culture" },
      { name: "Jewel Changi Airport", description: "The Rain Vortex indoor waterfall is worth visiting even if you're not flying.", category: "Adventure" },
    ],
    bestTimeToVisit:
      "Singapore is tropical year-round (27–32°C). February–April is the driest stretch. November–January sees more rain but also Christmas and Chinese New Year celebrations.",
    gettingAround:
      "Changi Airport (SIN) is one of the world's best. The MRT metro is fast, clean, and reaches most attractions; an EZ-Link card or contactless bank card works on all transport. Taxis and Grab are also affordable.",
    travelTips: [
      "The currency is the Singapore Dollar (SGD).",
      "Chewing gum is restricted (you can bring small amounts for personal use).",
      "Jaywalking and littering carry significant fines.",
      "Tipping is generally not expected.",
      "Tap water is safe to drink.",
    ],
    faqs: [
      { question: "Do I need a visa to visit Singapore?", answer: "Most Western nationalities (US, UK, EU, Canada, Australia) receive 90 days visa-free on arrival." },
      { question: "Is Singapore safe?", answer: "Singapore is one of the safest cities in the world, including for solo female travelers." },
      { question: "How many days do I need in Singapore?", answer: "3–4 days is enough to see the highlights without rushing." },
      { question: "Is Singapore expensive?", answer: "Hotels and alcohol are pricey, but hawker food and public transport make daily costs manageable." },
      { question: "What language is spoken?", answer: "English is the main working language. Mandarin, Malay, and Tamil are also official." },
    ],
  },
];

export const getThingsToDo = (slug: string) =>
  thingsToDoData.find((d) => d.slug === slug);
