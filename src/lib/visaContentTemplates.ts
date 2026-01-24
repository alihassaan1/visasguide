// Comprehensive visa content template library with variations to ensure unique content
// No AI API calls needed - uses pre-written templates with dynamic country data

export interface VisaTemplate {
  type: string;
  openings: string[];
  requirements: string[];
  documents: string[];
  process: string[];
  costs: string[];
  tips: string[];
  faqs: { question: string; answer: string }[];
}

// Helper to get random item from array
export const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to shuffle array
export const shuffleArray = <T>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Sentence connectors for variety
export const connectors = [
  "That said, ",
  "Keep in mind that ",
  "Here's the thing: ",
  "Worth noting: ",
  "One important point: ",
  "It's worth mentioning that ",
  "Don't forget that ",
  "Something to remember: ",
  "On that note, ",
  "Additionally, ",
];

// Author voice phrases
export const authorPhrases = {
  "priya-sharma": ["In my experience traveling through Asia, ", "From what I've seen at immigration counters, ", "Pro tip from years of border crossings: "],
  "james-chen": ["Having processed thousands of visa applications, ", "Based on my immigration expertise, ", "A key insight: "],
  "sarah-mitchell": ["From my European travel adventures, ", "Here's what seasoned travelers know: ", "My recommendation: "],
  "michael-thompson": ["After visiting over 50 countries, ", "Travel tip: ", "From personal experience: "],
  "elena-rodriguez": ["Speaking from my Latin American background, ", "Here's insider knowledge: ", "What most guides won't tell you: "],
};

// ============ VISA FREE TEMPLATES ============
export const visaFreeTemplates: VisaTemplate = {
  type: "visa_free",
  openings: [
    "Great news for {FROM} travelers! You can visit {TO} without applying for a visa beforehand. This visa-free arrangement makes {TO} one of the most accessible destinations for {FROM} passport holders.",
    "Planning a trip to {TO}? As a {FROM} passport holder, you're in luck—no visa application needed. You can simply pack your bags and head to the airport.",
    "Here's what {FROM} citizens will be happy to hear: {TO} offers visa-free entry for your passport. This means less paperwork and more time to plan your actual adventure.",
    "{FROM} nationals enjoy visa-free access to {TO}, making it incredibly convenient to explore this beautiful destination. No consulate visits, no application fees, no waiting periods.",
    "If you hold a {FROM} passport, visiting {TO} just got easier. The visa-free policy between these two countries means you can travel with minimal bureaucratic hassle.",
    "Excellent news for {FROM} travelers planning to visit {TO}! You won't need to apply for a visa in advance. Just grab your passport and you're ready to go.",
    "The diplomatic relationship between {FROM} and {TO} means hassle-free travel for you. Visa-free entry is available, saving you time and application fees.",
    "Dreaming of {TO}? As a {FROM} citizen, your dream trip is easier than you think. No visa required—just a valid passport and your sense of adventure.",
    "{TO} welcomes {FROM} passport holders without requiring a visa. This open-door policy reflects the strong ties between these two nations.",
    "For {FROM} travelers eyeing {TO} as their next destination, here's the good news: visa-free entry is available to you, making travel planning straightforward.",
  ],
  requirements: [
    "While you don't need a visa, there are still some entry requirements to keep in mind. Your {FROM} passport must be valid for at least 6 months beyond your intended stay. Immigration officers will also want to see proof of onward travel or a return ticket.",
    "Even with visa-free access, {TO} has standard entry requirements. Make sure your passport has at least 6 months validity remaining. You should also be prepared to show hotel reservations or proof of accommodation.",
    "Visa-free doesn't mean requirement-free. {TO} immigration will check that your {FROM} passport is valid for 6 months past your entry date. Having proof of sufficient funds for your stay is also recommended.",
    "To enter {TO} visa-free, ensure your {FROM} passport meets validity requirements (typically 6 months). Border officials may ask about your accommodation arrangements and travel itinerary.",
    "The visa-free entry comes with standard conditions. Your passport should have blank pages for stamps, be valid for at least 6 months, and you should be able to demonstrate the purpose of your visit if asked.",
  ],
  documents: [
    "Pack these essentials before heading to {TO}: your valid {FROM} passport, return or onward flight tickets, proof of accommodation (hotel bookings or host's address), and evidence of sufficient funds for your stay.",
    "Here's your document checklist for entering {TO}: valid passport from {FROM}, confirmed return tickets, accommodation details, travel insurance (recommended but often not mandatory), and bank statements or cash to prove you can support yourself.",
    "What to bring for your visa-free entry to {TO}: current {FROM} passport with 6+ months validity, round-trip ticket, hotel reservations or invitation letter if staying with friends, and proof of financial means.",
    "Essential documents for {FROM} travelers to {TO}: passport with adequate validity, evidence of onward journey, accommodation proof, and optionally travel medical insurance for peace of mind.",
    "Your travel document checklist: valid {FROM} passport, flight itinerary showing departure from {TO}, accommodation bookings, sufficient funds (credit cards, cash, or bank statements), and travel insurance documents.",
  ],
  process: [
    "Entering {TO} is straightforward for {FROM} nationals. Upon arrival, proceed to the immigration counter, present your passport, answer any questions about your visit, and receive your entry stamp. The whole process typically takes 5-15 minutes.",
    "The entry process is simple: land at your {TO} airport, join the 'Foreign Passports' queue at immigration, hand over your passport and any requested documents, and you'll be stamped in within minutes.",
    "Here's what to expect at {TO} immigration: after your flight lands, follow signs to passport control, wait in the appropriate queue, present your {FROM} passport to the officer, and receive your entry permission.",
    "Upon arrival in {TO}, the process is quick for visa-free travelers from {FROM}. Immigration officers will verify your passport, possibly ask about your trip purpose, and grant entry with a passport stamp.",
    "The arrival experience is hassle-free. After disembarking, head to immigration, show your {FROM} passport, answer routine questions about your stay duration and purpose, then collect your bags and enjoy {TO}!",
  ],
  costs: [
    "One of the best parts of visa-free travel? No visa application fees! You'll only need to budget for your flights, accommodation, and spending money. Some airports may charge a small departure tax, so keep a little extra cash handy.",
    "Traveling visa-free to {TO} means zero visa costs. Your only expenses will be standard travel costs like flights and hotels. Some countries charge airport taxes, typically $20-50, payable upon departure.",
    "No visa fees to worry about! The visa-free arrangement saves you both money and the hassle of application fees. Do check if {TO} has any airport or tourist taxes that might apply.",
    "The financial benefit of visa-free travel is significant—you save the typical $50-160 that visa applications often cost. Just remember to budget for potential airport taxes or tourism fees at your destination.",
    "With no visa required, your travel budget stretches further. You won't pay any consulate fees or visa processing charges. The only fees might be minor departure taxes when leaving {TO}.",
  ],
  tips: [
    "Pro tip: Even though you don't need a visa, always check the latest entry requirements before traveling. Rules can change, and it's better to be prepared than surprised at the airport.",
    "Insider advice: Arrive with some local currency or a international credit card. While not an entry requirement, it makes your first hours in {TO} much smoother.",
    "Travel tip: Download offline maps and translation apps before you go. Having key information accessible without internet is invaluable in those first moments after landing.",
    "Experienced traveler's note: Keep digital copies of all your documents in the cloud. If anything gets lost or stolen, you'll have backup proof of your identity and travel plans.",
    "Seasoned advice: Register with your country's embassy or consular services in {TO}. It's a free service that can be invaluable if any emergencies arise during your trip.",
  ],
  faqs: [
    { question: "How long can {FROM} citizens stay in {TO} without a visa?", answer: "Typically, visa-free stays allow 30 to 90 days depending on the bilateral agreement between {FROM} and {TO}. Check the specific duration as it varies by country pair." },
    { question: "Can I extend my visa-free stay in {TO}?", answer: "Extensions are sometimes possible by applying at the local immigration office. However, policies vary—some countries allow extensions while others require you to leave and re-enter." },
    { question: "Do I need travel insurance to enter {TO}?", answer: "While not always mandatory for visa-free entry, travel insurance is highly recommended. It protects you against medical emergencies, trip cancellations, and other unexpected events." },
    { question: "Can I work in {TO} on visa-free entry?", answer: "No, visa-free entry is typically for tourism, business meetings, or visiting family only. Any paid employment requires a separate work visa or permit." },
    { question: "What if my passport expires soon?", answer: "Most countries require at least 6 months passport validity beyond your planned stay. If your passport expires sooner, renew it before traveling to avoid entry denial." },
  ],
};

// ============ VISA ON ARRIVAL TEMPLATES ============
export const visaOnArrivalTemplates: VisaTemplate = {
  type: "visa_on_arrival",
  openings: [
    "{FROM} citizens can obtain a visa on arrival when traveling to {TO}. This convenient option means you don't need to visit an embassy beforehand—just apply when you land at your destination.",
    "Good news for {FROM} passport holders: {TO} offers visa on arrival facilities. You can get your travel authorization right at the airport, making trip planning more flexible.",
    "Traveling to {TO} from {FROM}? You're eligible for a visa on arrival, which saves you the hassle of pre-trip embassy visits. The process is straightforward and typically takes 15-30 minutes.",
    "The visa on arrival option for {FROM} travelers to {TO} is a real time-saver. No appointments, no mailing your passport—just apply at the immigration counter when you arrive.",
    "{TO} makes it easy for {FROM} nationals with its visa on arrival program. This means you can book last-minute trips without worrying about visa processing times.",
    "Planning a trip to {TO}? As a {FROM} citizen, you can skip the embassy queues. Visa on arrival is available, letting you sort out your travel documentation at the airport.",
    "Here's what {FROM} travelers need to know: {TO} has a convenient visa on arrival system. It's designed to facilitate tourism and short-term business visits without advance paperwork.",
    "The visa on arrival facility between {FROM} and {TO} reflects the growing travel ties between these nations. It's a streamlined process designed for efficiency.",
    "{FROM} passport holders benefit from {TO}'s visitor-friendly policies. The visa on arrival option means you can be more spontaneous with your travel plans.",
    "For {FROM} citizens, obtaining a {TO} visa has never been easier. The visa on arrival system eliminates weeks of waiting and embassy appointments.",
  ],
  requirements: [
    "To get your visa on arrival at {TO}, you'll need: a valid {FROM} passport with at least 6 months validity, proof of return or onward travel, sufficient funds for your stay, and a completed arrival card (often available on the plane).",
    "Requirements for the {TO} visa on arrival include: passport valid for 6+ months, return ticket, hotel booking or accommodation proof, and the visa fee in cash (often USD or local currency).",
    "Before joining the visa on arrival queue in {TO}, make sure you have: your {FROM} passport with blank pages, confirmed return flights, proof of accommodation, cash for the visa fee, and a passport photo (some countries require this).",
    "The visa on arrival requirements are straightforward: valid passport, proof of sufficient funds (around $100 per day of stay is typical), return ticket, and the application fee. Some airports also require a passport-sized photo.",
    "What {TO} immigration needs from you: {FROM} passport meeting validity requirements, evidence of onward travel, accommodation details, cash for visa fees, and sometimes a completed application form (available at the counter).",
  ],
  documents: [
    "Essential documents for your {TO} visa on arrival: passport with 6 months validity and blank pages, round-trip ticket, hotel reservation confirmations, two passport photos (35x45mm), cash for visa fee (usually $20-50 USD).",
    "Pack these for immigration at {TO}: valid {FROM} passport, printed or digital return ticket, accommodation proof, passport photos, and cash in small denominations for the visa fee.",
    "Your visa on arrival document checklist: current passport from {FROM}, flight itinerary showing exit from {TO}, booking confirmations, extra passport photos, and sufficient cash (local currency preferred for visa fee).",
    "What to prepare before landing in {TO}: {FROM} passport, printed return tickets, hotel bookings, 2 recent passport photos, visa fee in cash, and pen for filling out arrival forms on the plane.",
    "Documents needed at the {TO} visa counter: valid passport, evidence of accommodation, return flight details, passport photos (bring 2-4 to be safe), and visa application fee in accepted currency.",
  ],
  process: [
    "Here's the visa on arrival process at {TO}: 1) Fill out the arrival form on the plane, 2) Proceed to the 'Visa on Arrival' counter (not the regular immigration line), 3) Submit your documents and fee, 4) Wait for processing (10-30 minutes), 5) Receive your visa and proceed to immigration.",
    "Upon landing in {TO}, follow signs to 'Visa on Arrival.' Present your {FROM} passport, completed application, photos, and fee. After processing (usually quick), you'll get your visa sticker or stamp, then proceed through regular immigration.",
    "The visa on arrival steps: Look for the VOA counter before immigration, submit your documents and fee, wait for approval (typically 15-20 minutes), then proceed to passport control with your new visa. It's simpler than it sounds!",
    "Getting your visa on arrival is straightforward: after disembarking, find the VOA desk, submit your passport and documents, pay the fee, receive your visa, then join the immigration queue to enter {TO} officially.",
    "Here's what to expect: after your flight, locate the VOA area (usually well-signposted), complete any forms, submit your passport with fee, wait for processing, collect your visa, then proceed to main immigration for entry stamp.",
  ],
  costs: [
    "The visa on arrival fee for {FROM} citizens entering {TO} typically ranges from $20-50 USD, depending on the visa duration. Bring cash—many counters don't accept cards. Exact change is helpful.",
    "Budget around $25-50 USD for your {TO} visa on arrival. Payment is usually in USD or local currency. ATMs are often available before the visa counter if you need cash.",
    "Visa on arrival fees vary but expect to pay $20-50 for a standard tourist visa. Some airports accept credit cards, but cash (USD) is more reliable. Keep the receipt for your records.",
    "The cost is reasonable: typically $25-35 USD for single-entry tourist visas, possibly more for multiple-entry options. Bring exact change when possible to speed up the process.",
    "Prepare $20-50 in cash for your visa on arrival. Fees can vary based on nationality and visa duration. Some countries also charge additional 'processing' or 'service' fees of a few dollars.",
  ],
  tips: [
    "Pro tip: Arrive with exact change for the visa fee if possible. This speeds up the process and avoids issues with change availability at the counter.",
    "Insider advice: Print all your documents before traveling. While digital copies are increasingly accepted, paper backups prevent technical difficulties at the visa counter.",
    "Travel tip: Join the visa on arrival queue immediately after landing. Processing times can increase significantly if you're behind a full flight of fellow travelers.",
    "Experienced traveler's note: Fill out your arrival card completely and accurately on the plane. Incomplete forms cause delays at the visa counter.",
    "Seasoned advice: Bring extra passport photos. Requirements vary, and having extras prevents the hassle of finding a photo booth at the airport.",
  ],
  faqs: [
    { question: "How long is the visa on arrival valid for?", answer: "Most visa on arrival options grant 15-30 days. Some destinations offer longer stays (60-90 days) for an additional fee. Check specific requirements for {TO}." },
    { question: "Can I extend a visa on arrival?", answer: "Many countries allow visa extensions at local immigration offices. Typically, you can extend for an additional 15-30 days. Apply before your initial visa expires." },
    { question: "What if my visa on arrival is denied?", answer: "Denials are rare for tourists with proper documentation. If denied, you may be placed on the next flight back. Ensure all requirements are met before traveling." },
    { question: "Can I get visa on arrival at land borders?", answer: "This depends on the country. Some only offer VOA at specific airports. Check whether your entry point (airport, seaport, or land border) provides this service." },
    { question: "Do I need a hotel booking for visa on arrival?", answer: "Most countries require proof of accommodation. A hotel reservation for at least your first few nights is usually sufficient." },
  ],
};

// ============ E-VISA TEMPLATES ============
export const eVisaTemplates: VisaTemplate = {
  type: "e_visa",
  openings: [
    "{FROM} citizens can apply for a {TO} e-visa online, making the application process convenient and accessible from anywhere with internet access. No embassy visits required!",
    "The e-visa system for {TO} is great news for {FROM} travelers. You can complete your entire visa application from your laptop or phone, weeks before your trip.",
    "Applying for a {TO} visa has never been easier for {FROM} nationals. The electronic visa system lets you submit your application online and receive approval via email.",
    "{TO}'s e-visa program streamlines travel for {FROM} passport holders. Fill out the online form, upload your documents, pay the fee, and wait for your approval email.",
    "Skip the embassy queues! {FROM} citizens can obtain a {TO} e-visa through the official government portal. The entire process is digital, from application to approval.",
    "The digital visa revolution has reached {TO}. As a {FROM} citizen, you can now apply for your travel authorization entirely online, saving time and hassle.",
    "Planning your {TO} adventure? {FROM} passport holders can use the convenient e-visa system. Apply online, receive approval within days, and print your visa letter.",
    "{TO} makes visa applications easy for {FROM} travelers with its e-visa platform. No courier services, no passport mailing—just a simple online process.",
    "For {FROM} citizens, the {TO} e-visa is a game-changer. The online system is available 24/7, so you can apply whenever it's convenient for you.",
    "The e-visa option for {FROM} nationals visiting {TO} combines convenience with efficiency. Most applications are processed within 3-5 business days.",
  ],
  requirements: [
    "To apply for your {TO} e-visa, you'll need: a valid {FROM} passport scanned in high resolution, a recent digital passport photo, credit/debit card for payment, and details of your travel plans.",
    "E-visa requirements include: {FROM} passport valid for 6+ months, passport-size photo (digital format), email address for correspondence, payment method, and your travel itinerary.",
    "Before starting your e-visa application, prepare: a clear passport scan, recent photo with white background, credit card for the fee, hotel booking details, and return flight information.",
    "The {TO} e-visa requires: valid passport from {FROM}, digital photo meeting specifications (usually 35x45mm, white background), trip details, and payment via accepted card.",
    "Gather these before applying: passport scan (bio-data page), compliant photo file, travel insurance details (if required), accommodation information, and a valid payment method.",
  ],
  documents: [
    "E-visa document checklist: passport scan (color, high-resolution), digital passport photo (JPEG format, under 500KB usually), travel itinerary, hotel bookings, and possibly travel insurance proof.",
    "What you'll upload for your {TO} e-visa: clear passport bio-page scan, recent photo meeting specifications, supporting documents based on visit purpose, and sometimes a cover letter.",
    "Digital documents needed: {FROM} passport scan, passport-size photo (usually 2x2 inches with white background), flight reservation, accommodation proof, and bank statement if required.",
    "Your e-visa application will require: high-quality passport scan, compliant photo, proof of accommodation in {TO}, return ticket, and occasionally proof of funds.",
    "Prepare these files before starting: passport bio-data page (PDF or JPEG), recent photo (plain background, no glasses), travel insurance document, and booking confirmations.",
  ],
  process: [
    "The e-visa process is simple: 1) Visit the official {TO} e-visa portal, 2) Create an account, 3) Fill out the application form, 4) Upload required documents, 5) Pay the fee, 6) Submit and wait for email approval (3-5 days typically).",
    "Here's how to get your e-visa: Go to the official government website, complete the online form with your passport and travel details, upload documents, pay online, and check your email for approval.",
    "Applying for your {TO} e-visa step by step: Register on the portal, fill in personal and travel information, upload passport and photo scans, make payment, and download your approved visa from the portal.",
    "The online process works like this: access the e-visa website, provide your information as per your passport, upload the required documents, pay with card, receive confirmation email, then print your approval letter.",
    "E-visa application walkthrough: Start at the official portal, enter your details exactly as they appear on your passport, attach document scans, complete payment, and within days you'll receive your e-visa by email.",
  ],
  costs: [
    "The {TO} e-visa fee for {FROM} citizens is typically $25-75 USD, depending on visa type and duration. Payment is made online via credit/debit card. Some portals add processing fees.",
    "Budget around $30-60 for your e-visa application. This is paid online during the application process. Most portals accept Visa, Mastercard, and sometimes PayPal.",
    "E-visa fees range from $25-100 depending on the visa category. Single-entry tourist visas are usually cheapest. Multiple-entry and longer-duration visas cost more.",
    "The online visa costs approximately $35-50 USD for standard tourist applications. Be aware that some third-party sites charge higher fees—always use the official government portal.",
    "Expect to pay $25-75 for your e-visa. The exact amount depends on visa type and processing speed (rush processing costs extra). Payment is secure and made online.",
  ],
  tips: [
    "Pro tip: Always apply through the official government e-visa portal. Third-party sites charge higher fees and may be unreliable. The official URL usually ends in .gov or is linked from the embassy website.",
    "Insider advice: Apply at least 2 weeks before your trip, even though processing is often faster. This gives you buffer time if there are any issues with your application.",
    "Travel tip: Save a PDF copy of your approved e-visa and keep it accessible offline. Some countries want to see a printed copy at immigration.",
    "Experienced traveler's note: Double-check that all information matches your passport exactly. Even small typos (like 'Micheal' instead of 'Michael') can cause issues at immigration.",
    "Seasoned advice: Take a screenshot of your payment confirmation. If there are any processing issues, this proof of payment is essential.",
  ],
  faqs: [
    { question: "How long does e-visa processing take?", answer: "Most e-visas are processed within 3-5 business days. Some countries offer express processing (24-48 hours) for an additional fee." },
    { question: "Do I need to print my e-visa?", answer: "Requirements vary by country. Some accept digital copies on your phone, while others require a printed document. Print a copy to be safe." },
    { question: "Can I apply for an e-visa from any country?", answer: "Yes, as long as you have internet access and a valid {FROM} passport. You can apply from anywhere in the world." },
    { question: "What if my e-visa application is rejected?", answer: "You'll receive an email explaining the reason. Common issues include poor document quality or missing information. You can usually reapply after correcting the issue." },
    { question: "Is the e-visa linked to a specific passport?", answer: "Yes, your e-visa is electronically linked to your passport number. If you get a new passport, you'll need to apply for a new e-visa." },
  ],
};

// ============ ETA REQUIRED TEMPLATES ============
export const etaTemplates: VisaTemplate = {
  type: "eta",
  openings: [
    "{FROM} travelers need an Electronic Travel Authorization (ETA) before visiting {TO}. This quick online registration is simpler than a traditional visa and usually gets approved within minutes to hours.",
    "Before booking your flight to {TO}, {FROM} citizens must apply for an ETA. This electronic authorization is straightforward and can be completed online in about 10 minutes.",
    "An ETA is required for {FROM} passport holders visiting {TO}. Think of it as a pre-screening process that's faster and easier than a full visa application.",
    "Planning to visit {TO}? {FROM} citizens need to obtain an Electronic Travel Authorization first. It's a simple online process with quick approval times.",
    "{TO} requires {FROM} nationals to have an ETA before boarding their flight. The good news? It's a quick, online process that doesn't require embassy visits.",
    "The ETA requirement for {FROM} travelers to {TO} is designed for security screening while keeping travel convenient. Most applications are approved almost instantly.",
    "Unlike a traditional visa, the ETA for {FROM} citizens visiting {TO} is fast and fully online. You'll typically get approval within 72 hours, often much sooner.",
    "{TO}'s ETA system for {FROM} passport holders balances security with convenience. Apply online, get approved quickly, and you're set for your trip.",
    "An Electronic Travel Authorization is mandatory for {FROM} citizens flying to {TO}. It's a streamlined process that takes just minutes to complete.",
    "The ETA process for {FROM} travelers to {TO} is one of the simplest travel authorizations available. Quick to apply, fast approval, and valid for multiple trips.",
  ],
  requirements: [
    "ETA requirements are minimal: a valid {FROM} passport, email address, and credit/debit card for payment. You'll also need to provide your flight details and answer a few security questions.",
    "To apply for your {TO} ETA, you need: {FROM} passport valid for your travel dates, an email address for confirmation, payment method, and your travel itinerary.",
    "The ETA application requires: valid passport, contact information, employment details, travel history questions, and a small fee paid online.",
    "What you'll need for the ETA: current {FROM} passport number and expiry date, email address, credit card, and answers to basic background questions.",
    "Requirements are straightforward: passport details, contact information, intended travel dates, and payment. No supporting documents like bank statements are typically required.",
  ],
  documents: [
    "Unlike visas, ETAs don't require document uploads. Just have your {FROM} passport handy to enter the details accurately. Keep a copy of your approval confirmation.",
    "The ETA process is document-light: no scans, no photos to upload. You just need your passport information and payment method. Save your confirmation email!",
    "No document uploads needed for the ETA. Simply provide your passport details as they appear on your travel document. Print or save your approval for airline check-in.",
    "The ETA requires only passport information—no photos, bank statements, or accommodation proofs. Your approval will be linked electronically to your passport number.",
    "Document requirements are minimal: just your passport number, issue date, and expiry. The ETA is stored electronically and linked to your passport.",
  ],
  process: [
    "The ETA process is quick: 1) Visit the official {TO} ETA website, 2) Enter your passport details, 3) Answer security questions, 4) Pay the fee, 5) Receive approval by email (often within minutes).",
    "Applying takes about 5-10 minutes: go to the official ETA portal, fill in your personal and passport information, pay online, and wait for your confirmation email.",
    "Here's how the ETA works: complete the online form with your passport details, pay the small fee, and receive electronic approval. It's linked to your passport number automatically.",
    "Getting your ETA is simple: access the government portal, input your passport information, answer a few questions about travel history, pay, and get approval—often in under an hour.",
    "The quick ETA process: visit the official website, provide passport and travel details, make payment, and receive confirmation. Most approvals come through in 24 hours or less.",
  ],
  costs: [
    "ETAs are affordable, typically costing $10-25 USD. This covers the processing and is paid online during application. The fee is non-refundable even if denied.",
    "The ETA fee for {FROM} citizens is usually around $14-20 USD. It's a one-time payment made during the application process.",
    "Expect to pay approximately $10-25 for your ETA. It's much cheaper than a traditional visa and covers multiple entries during its validity period.",
    "ETA costs are minimal—usually under $25 USD. This is significantly less than standard visa fees and the process is much faster.",
    "The electronic authorization costs about $15-25 USD. Payment is made online, and the ETA is valid for multiple visits over 2-5 years typically.",
  ],
  tips: [
    "Pro tip: Apply for your ETA at least 72 hours before your flight. While approval is often instant, some cases require additional review.",
    "Insider advice: Your ETA is linked to your passport number. If you renew your passport, you'll need a new ETA even if the old one hasn't expired.",
    "Travel tip: Screenshot your ETA confirmation and keep it accessible. While airlines can verify electronically, having proof on hand prevents check-in delays.",
    "Experienced traveler's note: Answer all security questions honestly. False information can result in denial and future travel complications.",
    "Seasoned advice: Check your ETA status before booking flights. A small percentage of applications require additional processing time.",
  ],
  faqs: [
    { question: "How long is an ETA valid?", answer: "Most ETAs are valid for 2-5 years or until your passport expires, whichever comes first. You can make multiple trips during this period." },
    { question: "Is an ETA the same as a visa?", answer: "No, an ETA is simpler and faster. It's an electronic authorization for short visits, while visas are required for longer stays or specific purposes." },
    { question: "Can I be denied an ETA?", answer: "Yes, though it's uncommon for tourists. Reasons include criminal history or previous immigration violations. If denied, you may need to apply for a traditional visa." },
    { question: "Do I need to print my ETA?", answer: "Usually not—it's electronically linked to your passport. However, keeping a copy of the confirmation email is recommended." },
    { question: "Can I work with an ETA?", answer: "No, ETAs are for tourism and business visits only. Working requires a separate visa or permit." },
  ],
};

// ============ VISA REQUIRED TEMPLATES ============
export const visaRequiredTemplates: VisaTemplate = {
  type: "visa_required",
  openings: [
    "{FROM} citizens need to apply for a visa before traveling to {TO}. While this requires some advance planning, the process is straightforward if you follow the right steps.",
    "A visa is required for {FROM} passport holders visiting {TO}. Start your application well in advance of your travel date to allow for processing time.",
    "Planning a trip to {TO}? {FROM} nationals must obtain a visa before traveling. Here's everything you need to know about the application process.",
    "{TO} requires {FROM} citizens to have a valid visa for entry. The good news is that with proper preparation, the application process can be smooth.",
    "As a {FROM} passport holder, you'll need to apply for a {TO} visa through the embassy or consulate. Allow 2-4 weeks for processing.",
    "Visa application is required for {FROM} travelers to {TO}. This guide will walk you through the documents needed and the steps to follow.",
    "{FROM} citizens must secure a visa before their {TO} trip. While it requires effort, thousands of travelers successfully complete this process every day.",
    "A {TO} visa is mandatory for {FROM} nationals. Plan ahead, gather your documents, and submit a complete application for the best chance of approval.",
    "Traveling from {FROM} to {TO} requires a visa obtained in advance. The process varies by visa type—tourist, business, or other categories.",
    "For {FROM} passport holders, visiting {TO} means going through the visa application process. Here's your comprehensive guide to getting approved.",
  ],
  requirements: [
    "Visa requirements include: valid {FROM} passport with 6+ months validity and blank pages, completed application form, recent passport photos, proof of travel itinerary, accommodation bookings, and financial documentation.",
    "To apply for your {TO} visa, prepare: passport meeting validity requirements, visa application form, photos to specification, flight bookings, hotel reservations, bank statements, employment letter, and travel insurance.",
    "The visa requirements for {FROM} citizens include: current passport, completed application, biometric photos, proof of purpose (tourism, business, etc.), sufficient funds evidence, and travel insurance with adequate coverage.",
    "You'll need to provide: valid {FROM} passport, application form (often online), passport photos, confirmed round-trip tickets, accommodation proof, financial statements showing funds, and supporting documents based on visit purpose.",
    "Standard visa requirements: passport with 6-month validity and empty pages, application form, recent photos, travel itinerary, proof of accommodation, bank statements (3-6 months), employment verification, and insurance.",
  ],
  documents: [
    "Complete document checklist: {FROM} passport (original + copy), visa application form, 2 passport photos (35x45mm, white background), bank statements (last 3-6 months), employment letter, travel insurance, flight itinerary, hotel bookings, cover letter explaining trip purpose.",
    "Prepare these documents: valid passport with blank pages, completed application (printed and signed), passport photos per specifications, financial proof (statements, pay slips), employer letter confirming leave, insurance coverage, and detailed travel plans.",
    "Your visa application package should include: passport, application form, photographs, financial documentation (bank statements showing sufficient balance), proof of employment or business, travel insurance certificate, confirmed reservations, and invitation letter if applicable.",
    "Document requirements: {FROM} passport meeting validity criteria, filled application form, biometric photos, round-trip ticket reservation, hotel confirmations, bank statements, income proof, leave approval from employer, comprehensive travel insurance.",
    "Essential documents: passport, photos, application form, proof of funds (bank statements, salary slips), employment verification, travel itinerary, accommodation bookings, insurance, and any additional documents for your specific visa category.",
  ],
  process: [
    "The visa application process: 1) Gather all required documents, 2) Complete the application form online or in paper, 3) Book an appointment at the embassy/consulate or visa center, 4) Attend in person, submit documents and biometrics, 5) Pay fees, 6) Wait for processing (1-4 weeks), 7) Collect your passport with visa.",
    "Step-by-step guide: First, complete the application form. Then, compile your supporting documents. Schedule an appointment at the nearest visa application center. Attend your appointment with all originals and copies. Submit biometrics if required. Wait for processing and track your application online.",
    "Here's how to apply: Download or access the online application form. Fill it completely and accurately. Gather all supporting documents. Book your visa appointment. Attend in person, submit everything, and provide biometrics. Pay the fee and await processing.",
    "The visa process involves: completing the form accurately, preparing a thorough document package, scheduling your embassy appointment, attending in person for document verification and biometrics, paying applicable fees, and waiting 2-4 weeks for a decision.",
    "Application process: fill out the form (online preferred), assemble all documents, book appointment at embassy or visa center, present yourself with documents on the appointment day, pay fees, submit biometrics if required, and wait for your processed passport to be returned.",
  ],
  costs: [
    "Visa fees for {FROM} citizens typically range from $50-160 USD, depending on visa type and duration. Additional costs may include: visa center service fees ($20-40), biometrics ($15-30), courier return of passport ($20-30).",
    "Budget for these costs: visa application fee ($50-150), service center charges if applicable ($25-45), biometric fees ($15-30), and optional courier service. Total cost typically $100-200.",
    "The {TO} visa fee is approximately $60-140 USD for tourist visas. Business and other categories may cost more. Don't forget potential service center and biometric fees on top of the visa fee.",
    "Visa costs include: application fee (varies by nationality and visa type, $50-160), visa center fee if not applying directly at embassy ($20-40), and biometrics if required ($15-30).",
    "Plan for visa expenses of $80-180 total, including the visa fee, processing charges, and any required biometric enrollment. Express processing, if available, costs extra.",
  ],
  tips: [
    "Pro tip: Apply well in advance—at least 4-6 weeks before your trip. Peak travel seasons see higher application volumes and longer processing times.",
    "Insider advice: Present organized documents in the order listed on the checklist. This creates a good impression and speeds up verification.",
    "Travel tip: Keep copies of everything you submit. If your application is delayed, you'll need to reference these documents for follow-up inquiries.",
    "Experienced traveler's note: Answer all application questions honestly. Inconsistencies between your form and interview answers are a common reason for denial.",
    "Seasoned advice: If your application is denied, you can usually reapply after addressing the reasons for rejection. Request a written explanation for future reference.",
  ],
  faqs: [
    { question: "How long does visa processing take?", answer: "Standard processing is 10-15 business days. Some countries offer express processing (3-5 days) for an additional fee. Apply early to avoid stress." },
    { question: "Can I apply by mail?", answer: "Most countries require in-person applications for biometrics. However, visa application centers or authorized travel agents may have options for reduced personal appearances." },
    { question: "What if I'm denied a visa?", answer: "You'll usually receive a letter explaining the reason. Address those issues and you can reapply. Common reasons include insufficient funds, weak ties to home country, or incomplete documentation." },
    { question: "Do I need to show my return ticket?", answer: "Yes, most visa applications require proof of round-trip travel. A confirmed booking or at least a reservation (even if not fully paid) is typically required." },
    { question: "Is an interview required?", answer: "For some countries and visa types, yes. Tourist visas often don't require interviews, but the embassy reserves the right to request one." },
  ],
};

// ============ GENERIC/FALLBACK TEMPLATES ============
export const genericTemplates: VisaTemplate = {
  type: "generic",
  openings: [
    "Planning to travel from {FROM} to {TO}? Understanding the visa requirements is essential for smooth trip planning. Here's what you need to know about entry regulations.",
    "Before traveling from {FROM} to {TO}, it's important to understand the current entry requirements. Visa policies can vary based on your nationality and purpose of visit.",
    "{FROM} citizens planning to visit {TO} should familiarize themselves with the entry requirements. This guide covers everything from documents to application processes.",
    "Whether you're traveling for tourism, business, or to visit family, knowing the visa requirements for {FROM} nationals visiting {TO} is your first step to a successful trip.",
    "Entry requirements from {FROM} to {TO} depend on several factors including your purpose of visit and intended length of stay. Here's a comprehensive overview.",
    "Traveling internationally requires understanding destination entry policies. For {FROM} passport holders visiting {TO}, here's what you need to prepare.",
    "Your journey from {FROM} to {TO} starts with understanding the documentation requirements. This guide will help you navigate the entry process.",
    "Planning your trip from {FROM} to {TO}? Entry requirements are an important consideration. Here's everything you need to know before you go.",
    "As a {FROM} citizen preparing to visit {TO}, you'll want to understand the entry requirements well in advance. Here's a complete breakdown.",
    "International travel from {FROM} to {TO} requires proper documentation. This guide covers the requirements, process, and tips for a successful application.",
  ],
  requirements: [
    "Entry requirements typically include: a valid {FROM} passport with adequate validity (usually 6 months beyond your stay), and documentation appropriate to your entry type—whether visa-free, visa on arrival, or advance visa.",
    "Standard requirements for {FROM} travelers include: passport with at least 6 months validity, proof of onward or return travel, accommodation arrangements, and sufficient funds for your stay.",
    "General requirements: {FROM} passport meeting validity requirements, travel itinerary, proof of accommodation, financial means to support your stay, and any visa or travel authorization specific to your situation.",
    "Be prepared with: valid passport from {FROM}, return or onward tickets, hotel reservations or accommodation proof, and documentation of sufficient funds. Specific requirements may vary based on your entry category.",
    "Common requirements include: current passport with blank pages, evidence of travel plans, accommodation details, proof of financial means, and travel insurance. Check specific requirements for your situation.",
  ],
  documents: [
    "General document checklist for {FROM} travelers to {TO}: valid passport, return ticket, accommodation proof, bank statements or proof of funds, travel insurance (recommended), and any required visa or authorization.",
    "Prepare these documents: {FROM} passport with adequate validity, confirmed travel itinerary, hotel bookings, financial documentation, travel insurance certificate, and passport photographs (for visas if required).",
    "Standard documents include: passport, flight itinerary, accommodation confirmations, proof of sufficient funds, and any visa application materials if required. Keep both originals and copies.",
    "Document checklist: valid passport, round-trip tickets, hotel reservations, bank statements showing sufficient balance, travel insurance, and any invitation letters or supporting documents.",
    "Have ready: current {FROM} passport, travel bookings, accommodation proof, financial evidence, insurance, and any specific documents required for your type of travel authorization.",
  ],
  process: [
    "The entry process varies based on your travel authorization type. For visa-free entry, simply arrive with proper documents. For visas, apply through the embassy, consulate, or online portal as applicable.",
    "Check your specific entry type: visa-free travelers proceed directly to immigration; visa on arrival applicants go to the VOA counter first; those needing advance visas should apply before traveling.",
    "The process depends on your entry category. Research whether you need a pre-arranged visa, can get one on arrival, or qualify for visa-free entry. Plan accordingly and allow time for any applications.",
    "Understanding the process starts with confirming your entry requirements. Then gather necessary documents, apply if needed (online or at embassy), and prepare for immigration upon arrival.",
    "Your entry process will depend on the specific arrangement between {FROM} and {TO}. Check the latest requirements, as policies can change. Apply for any required visas well in advance.",
  ],
  costs: [
    "Costs vary depending on your entry type. Visa-free entry has no fee. Visa on arrival typically costs $20-50. E-visas and traditional visas range from $30-160+ depending on type and duration.",
    "Travel costs to budget for: visa or travel authorization fees (if applicable, $0-160), travel insurance, flights, accommodation, and spending money. Specific visa costs depend on the type required.",
    "Entry costs depend on your situation. If no visa is needed, you'll save on application fees. Otherwise, budget $30-160 for visa costs plus any additional service fees.",
    "Visa-related expenses can range from $0 (visa-free) to over $100 (traditional visas). Check the specific requirements for {FROM} citizens and budget accordingly.",
    "Plan your budget based on your entry type. Factor in any visa fees, travel insurance (highly recommended), and keep emergency funds accessible in {TO}.",
  ],
  tips: [
    "Pro tip: Verify current requirements close to your travel date. Visa policies can change, and it's always best to have the latest information.",
    "Insider advice: Keep digital and physical copies of all travel documents. Cloud storage ensures you can access copies from anywhere if originals are lost.",
    "Travel tip: Register your trip with your country's foreign affairs department or embassy. This free service can be invaluable in emergencies.",
    "Experienced traveler's note: Arrive at the airport with extra time for international flights. Immigration procedures and potential issues are easier to manage when you're not rushing.",
    "Seasoned advice: Learn basic phrases in the local language of {TO}. Even simple greetings and 'thank you' can make your interactions smoother and more pleasant.",
  ],
  faqs: [
    { question: "Where can I find official visa information?", answer: "Check the official government website of {TO}, or contact their embassy or consulate in {FROM}. Official sources have the most accurate and current requirements." },
    { question: "How far in advance should I check requirements?", answer: "Check requirements as soon as you start planning, then verify again 2-4 weeks before travel. Requirements can change with little notice." },
    { question: "What if my question isn't answered here?", answer: "Contact the {TO} embassy or consulate in {FROM}. They can provide specific guidance based on your individual circumstances." },
    { question: "Are there any travel advisories I should know about?", answer: "Check your government's travel advisory website for {TO}. These advisories provide safety information and any special entry conditions." },
    { question: "Do I need any vaccinations to enter?", answer: "Some countries require proof of certain vaccinations. Check the health requirements for {TO} and consult your doctor or a travel health clinic." },
  ],
};

// Map requirement types to templates
export const templateMap: Record<string, VisaTemplate> = {
  "visa_free": visaFreeTemplates,
  "visa_not_required": visaFreeTemplates,
  "freedom_of_movement": visaFreeTemplates,
  "visa_on_arrival": visaOnArrivalTemplates,
  "e_visa": eVisaTemplates,
  "electronic_visa": eVisaTemplates,
  "eta": etaTemplates,
  "electronic_travel_authorization": etaTemplates,
  "visa_required": visaRequiredTemplates,
  "generic": genericTemplates,
};

// Get template by requirement type with fallback
export const getTemplateForType = (requirementType: string | null | undefined): VisaTemplate => {
  if (!requirementType) return genericTemplates;
  const normalizedType = requirementType.toLowerCase().replace(/[^a-z_]/g, '_');
  return templateMap[normalizedType] || genericTemplates;
};

// Generate complete HTML content from template
export const generateVisaContent = (
  fromCountry: { name: string; slug: string },
  toCountry: { name: string; slug: string },
  requirementType: string | null | undefined,
  authorId?: string
): { content: string; title: string; metaTitle: string; metaDescription: string; excerpt: string } => {
  const template = getTemplateForType(requirementType);
  
  // Replace placeholders helper
  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/{FROM}/g, fromCountry.name)
      .replace(/{FROM_COUNTRY}/g, fromCountry.name)
      .replace(/{TO}/g, toCountry.name)
      .replace(/{TO_COUNTRY}/g, toCountry.name);
  };
  
  // Get random items for each section
  const opening = replacePlaceholders(getRandomItem(template.openings));
  const requirements = replacePlaceholders(getRandomItem(template.requirements));
  const documents = replacePlaceholders(getRandomItem(template.documents));
  const process = replacePlaceholders(getRandomItem(template.process));
  const costs = replacePlaceholders(getRandomItem(template.costs));
  const tip = replacePlaceholders(getRandomItem(template.tips));
  
  // Get random connector phrases
  const connector1 = getRandomItem(connectors);
  const connector2 = getRandomItem(connectors);
  
  // Get author phrase if available
  let authorPhrase = "";
  if (authorId && authorPhrases[authorId as keyof typeof authorPhrases]) {
    authorPhrase = getRandomItem(authorPhrases[authorId as keyof typeof authorPhrases]);
  }
  
  // Select random FAQs (3-4 of them)
  const shuffledFaqs = shuffleArray(template.faqs).slice(0, 3 + Math.floor(Math.random() * 2));
  const faqHtml = shuffledFaqs.map(faq => {
    const q = replacePlaceholders(faq.question);
    const a = replacePlaceholders(faq.answer);
    return `
      <div class="mb-4">
        <strong class="text-foreground">Q: ${q}</strong><br/>
        <p class="mt-1 text-muted-foreground">${a}</p>
      </div>`;
  }).join('\n');
  
  // Build the complete HTML content
  const content = `
<article class="prose prose-lg max-w-none">
  <h2 class="text-2xl font-bold mb-4 text-foreground">Do ${fromCountry.name} Citizens Need a Visa for ${toCountry.name}?</h2>
  <p class="mb-4 text-muted-foreground">${opening}</p>

  <h3 class="text-xl font-semibold mt-8 mb-3 text-foreground">Entry Requirements for ${fromCountry.name} Citizens</h3>
  <p class="mb-4 text-muted-foreground">${requirements}</p>
  <p class="mb-4 text-muted-foreground">${connector1}these requirements can change, so always verify with official sources before your trip.</p>

  <h3 class="text-xl font-semibold mt-8 mb-3 text-foreground">Documents You'll Need</h3>
  <p class="mb-4 text-muted-foreground">${documents}</p>

  <h3 class="text-xl font-semibold mt-8 mb-3 text-foreground">Application Process</h3>
  <p class="mb-4 text-muted-foreground">${process}</p>

  <h3 class="text-xl font-semibold mt-8 mb-3 text-foreground">Costs and Fees</h3>
  <p class="mb-4 text-muted-foreground">${costs}</p>
  <p class="mb-4 text-muted-foreground">${connector2}always carry some local currency for unexpected expenses upon arrival.</p>

  <h3 class="text-xl font-semibold mt-8 mb-3 text-foreground">Travel Tips</h3>
  <p class="mb-4 text-muted-foreground">${authorPhrase}${tip}</p>

  <h3 class="text-xl font-semibold mt-8 mb-3 text-foreground">Frequently Asked Questions</h3>
  ${faqHtml}

  <div class="mt-8 p-4 bg-muted rounded-lg">
    <p class="text-sm text-muted-foreground"><strong>Disclaimer:</strong> Visa requirements can change at any time. While we strive to keep this information current, we recommend verifying requirements with the official ${toCountry.name} embassy or consulate before traveling. Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
  </div>
</article>`.trim();

  // Generate meta information
  const title = `${toCountry.name} Visa Requirements for ${fromCountry.name} Citizens 2026`;
  const metaTitle = `${toCountry.name} Visa for ${fromCountry.name} Citizens - Requirements & How to Apply`;
  const metaDescription = `Complete guide to ${toCountry.name} visa requirements for ${fromCountry.name} passport holders. Learn about entry requirements, documents needed, application process, and fees.`;
  const excerpt = `Everything ${fromCountry.name} citizens need to know about visiting ${toCountry.name}: visa requirements, documents, application process, and costs.`;

  return { content, title, metaTitle, metaDescription, excerpt };
};
