import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive template variations for unique content generation
const connectors = [
  "That said, ", "Keep in mind that ", "Here's the thing: ", "Worth noting: ",
  "One important point: ", "It's worth mentioning that ", "Don't forget that ",
  "Something to remember: ", "On that note, ", "Additionally, ",
];

const authorPhrases: Record<string, string[]> = {
  "priya-sharma": ["In my experience traveling through Asia, ", "From what I've seen at immigration counters, ", "Pro tip from years of border crossings: "],
  "james-chen": ["Having processed thousands of visa applications, ", "Based on my immigration expertise, ", "A key insight: "],
  "sarah-mitchell": ["From my European travel adventures, ", "Here's what seasoned travelers know: ", "My recommendation: "],
  "michael-thompson": ["After visiting over 50 countries, ", "Travel tip: ", "From personal experience: "],
  "elena-rodriguez": ["Speaking from my Latin American background, ", "Here's insider knowledge: ", "What most guides won't tell you: "],
};

// Template collections for each visa type
const templates = {
  visa_free: {
    openings: [
      "Great news for {FROM} travelers! You can visit {TO} without applying for a visa beforehand. This visa-free arrangement makes {TO} one of the most accessible destinations for {FROM} passport holders.",
      "Planning a trip to {TO}? As a {FROM} passport holder, you're in luck,no visa application needed. You can simply pack your bags and head to the airport.",
      "Here's what {FROM} citizens will be happy to hear: {TO} offers visa-free entry for your passport. This means less paperwork and more time to plan your actual adventure.",
      "{FROM} nationals enjoy visa-free access to {TO}, making it incredibly convenient to explore this beautiful destination. No consulate visits, no application fees, no waiting periods.",
      "If you hold a {FROM} passport, visiting {TO} just got easier. The visa-free policy between these two countries means you can travel with minimal bureaucratic hassle.",
      "Excellent news for {FROM} travelers planning to visit {TO}! You won't need to apply for a visa in advance. Just grab your passport and you're ready to go.",
      "The diplomatic relationship between {FROM} and {TO} means hassle-free travel for you. Visa-free entry is available, saving you time and application fees.",
      "Dreaming of {TO}? As a {FROM} citizen, your dream trip is easier than you think. No visa required,just a valid passport and your sense of adventure.",
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
      "The financial benefit of visa-free travel is significant,you save the typical $50-160 that visa applications often cost. Just remember to budget for potential airport taxes or tourism fees at your destination.",
      "With no visa required, your travel budget stretches further. You won't pay any consulate fees or visa processing charges. The only fees might be minor departure taxes when leaving {TO}.",
    ],
    tips: [
      "Pro tip: Even though you don't need a visa, always check the latest entry requirements before traveling. Rules can change, and it's better to be prepared than surprised at the airport.",
      "Insider advice: Arrive with some local currency or an international credit card. While not an entry requirement, it makes your first hours in {TO} much smoother.",
      "Travel tip: Download offline maps and translation apps before you go. Having key information accessible without internet is invaluable in those first moments after landing.",
      "Experienced traveler's note: Keep digital copies of all your documents in the cloud. If anything gets lost or stolen, you'll have backup proof of your identity and travel plans.",
      "Seasoned advice: Register with your country's embassy or consular services in {TO}. It's a free service that can be invaluable if any emergencies arise during your trip.",
    ],
    faqs: [
      { q: "How long can {FROM} citizens stay in {TO} without a visa?", a: "Typically, visa-free stays allow 30 to 90 days depending on the bilateral agreement between {FROM} and {TO}. Check the specific duration as it varies by country pair." },
      { q: "Can I extend my visa-free stay in {TO}?", a: "Extensions are sometimes possible by applying at the local immigration office. However, policies vary,some countries allow extensions while others require you to leave and re-enter." },
      { q: "Do I need travel insurance to enter {TO}?", a: "While not always mandatory for visa-free entry, travel insurance is highly recommended. It protects you against medical emergencies, trip cancellations, and other unexpected events." },
      { q: "Can I work in {TO} on visa-free entry?", a: "No, visa-free entry is typically for tourism, business meetings, or visiting family only. Any paid employment requires a separate work visa or permit." },
      { q: "What if my passport expires soon?", a: "Most countries require at least 6 months passport validity beyond your planned stay. If your passport expires sooner, renew it before traveling to avoid entry denial." },
    ],
  },
  visa_on_arrival: {
    openings: [
      "{FROM} citizens can obtain a visa on arrival when traveling to {TO}. This convenient option means you don't need to visit an embassy beforehand,just apply when you land at your destination.",
      "Good news for {FROM} passport holders: {TO} offers visa on arrival facilities. You can get your travel authorization right at the airport, making trip planning more flexible.",
      "Traveling to {TO} from {FROM}? You're eligible for a visa on arrival, which saves you the hassle of pre-trip embassy visits. The process is straightforward and typically takes 15-30 minutes.",
      "The visa on arrival option for {FROM} travelers to {TO} is a real time-saver. No appointments, no mailing your passport,just apply at the immigration counter when you arrive.",
      "{TO} makes it easy for {FROM} nationals with its visa on arrival program. This means you can book last-minute trips without worrying about visa processing times.",
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
      "The visa on arrival fee for {FROM} citizens entering {TO} typically ranges from $20-50 USD, depending on the visa duration. Bring cash,many counters don't accept cards. Exact change is helpful.",
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
      { q: "How long is the visa on arrival valid for?", a: "Most visa on arrival options grant 15-30 days. Some destinations offer longer stays (60-90 days) for an additional fee. Check specific requirements for {TO}." },
      { q: "Can I extend a visa on arrival?", a: "Many countries allow visa extensions at local immigration offices. Typically, you can extend for an additional 15-30 days. Apply before your initial visa expires." },
      { q: "What if my visa on arrival is denied?", a: "Denials are rare for tourists with proper documentation. If denied, you may be placed on the next flight back. Ensure all requirements are met before traveling." },
      { q: "Can I get visa on arrival at land borders?", a: "This depends on the country. Some only offer VOA at specific airports. Check whether your entry point (airport, seaport, or land border) provides this service." },
      { q: "Do I need a hotel booking for visa on arrival?", a: "Most countries require proof of accommodation. A hotel reservation for at least your first few nights is usually sufficient." },
    ],
  },
  e_visa: {
    openings: [
      "{FROM} citizens can apply for a {TO} e-visa online, making the application process convenient and accessible from anywhere with internet access. No embassy visits required!",
      "The e-visa system for {TO} is great news for {FROM} travelers. You can complete your entire visa application from your laptop or phone, weeks before your trip.",
      "Applying for a {TO} visa has never been easier for {FROM} nationals. The electronic visa system lets you submit your application online and receive approval via email.",
      "{TO}'s e-visa program streamlines travel for {FROM} passport holders. Fill out the online form, upload your documents, pay the fee, and wait for your approval email.",
      "Skip the embassy queues! {FROM} citizens can obtain a {TO} e-visa through the official government portal. The entire process is digital, from application to approval.",
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
      "The online visa costs approximately $35-50 USD for standard tourist applications. Be aware that some third-party sites charge higher fees,always use the official government portal.",
      "Expect to pay $25-75 for your e-visa. The exact amount depends on visa type and processing speed (rush processing costs extra). Payment is secure and made online.",
    ],
    tips: [
      "Pro tip: Always apply through the official government e-visa portal. Third-party sites charge higher fees and may be unreliable. The official URL usually ends in .gov or is linked from the embassy website.",
      "Insider advice: Apply at least 2 weeks before your trip, even though processing is often faster. This gives you buffer time if there are any issues with your application.",
      "Travel tip: Save a PDF copy of your approved e-visa and keep it accessible offline. Some countries want to see a printed copy at immigration.",
      "Experienced traveler's note: Double-check that all information matches your passport exactly. Even small typos can cause issues at immigration.",
      "Seasoned advice: Take a screenshot of your payment confirmation. If there are any processing issues, this proof of payment is essential.",
    ],
    faqs: [
      { q: "How long does e-visa processing take?", a: "Most e-visas are processed within 3-5 business days. Some countries offer express processing (24-48 hours) for an additional fee." },
      { q: "Do I need to print my e-visa?", a: "Requirements vary by country. Some accept digital copies on your phone, while others require a printed document. Print a copy to be safe." },
      { q: "Can I apply for an e-visa from any country?", a: "Yes, as long as you have internet access and a valid {FROM} passport. You can apply from anywhere in the world." },
      { q: "What if my e-visa application is rejected?", a: "You'll receive an email explaining the reason. Common issues include poor document quality or missing information. You can usually reapply after correcting the issue." },
      { q: "Is the e-visa linked to a specific passport?", a: "Yes, your e-visa is electronically linked to your passport number. If you get a new passport, you'll need to apply for a new e-visa." },
    ],
  },
  visa_required: {
    openings: [
      "{FROM} citizens need to apply for a visa before traveling to {TO}. While this requires some advance planning, the process is straightforward if you follow the right steps.",
      "A visa is required for {FROM} passport holders visiting {TO}. Start your application well in advance of your travel date to allow for processing time.",
      "Planning a trip to {TO}? {FROM} nationals must obtain a visa before traveling. Here's everything you need to know about the application process.",
      "{TO} requires {FROM} citizens to have a valid visa for entry. The good news is that with proper preparation, the application process can be smooth.",
      "As a {FROM} passport holder, you'll need to apply for a {TO} visa through the embassy or consulate. Allow 2-4 weeks for processing.",
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
      "Pro tip: Apply well in advance,at least 4-6 weeks before your trip. Peak travel seasons see higher application volumes and longer processing times.",
      "Insider advice: Present organized documents in the order listed on the checklist. This creates a good impression and speeds up verification.",
      "Travel tip: Keep copies of everything you submit. If your application is delayed, you'll need to reference these documents for follow-up inquiries.",
      "Experienced traveler's note: Answer all application questions honestly. Inconsistencies between your form and interview answers are a common reason for denial.",
      "Seasoned advice: If your application is denied, you can usually reapply after addressing the reasons for rejection. Request a written explanation for future reference.",
    ],
    faqs: [
      { q: "How long does visa processing take?", a: "Standard processing is 10-15 business days. Some countries offer express processing (3-5 days) for an additional fee. Apply early to avoid stress." },
      { q: "Can I apply by mail?", a: "Most countries require in-person applications for biometrics. However, visa application centers or authorized travel agents may have options for reduced personal appearances." },
      { q: "What if I'm denied a visa?", a: "You'll usually receive a letter explaining the reason. Address those issues and you can reapply. Common reasons include insufficient funds, weak ties to home country, or incomplete documentation." },
      { q: "Do I need to show my return ticket?", a: "Yes, most visa applications require proof of round-trip travel. A confirmed booking or at least a reservation is typically required." },
      { q: "Is an interview required?", a: "For some countries and visa types, yes. Tourist visas often don't require interviews, but the embassy reserves the right to request one." },
    ],
  },
  generic: {
    openings: [
      "Planning to travel from {FROM} to {TO}? Understanding the visa requirements is essential for smooth trip planning. Here's what you need to know about entry regulations.",
      "Before traveling from {FROM} to {TO}, it's important to understand the current entry requirements. Visa policies can vary based on your nationality and purpose of visit.",
      "{FROM} citizens planning to visit {TO} should familiarize themselves with the entry requirements. This guide covers everything from documents to application processes.",
      "Whether you're traveling for tourism, business, or to visit family, knowing the visa requirements for {FROM} nationals visiting {TO} is your first step to a successful trip.",
      "Entry requirements from {FROM} to {TO} depend on several factors including your purpose of visit and intended length of stay. Here's a comprehensive overview.",
    ],
    requirements: [
      "Entry requirements typically include: a valid {FROM} passport with adequate validity (usually 6 months beyond your stay), and documentation appropriate to your entry type,whether visa-free, visa on arrival, or advance visa.",
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
      "Experienced traveler's note: Arrive at the airport with extra time for international flights. Immigration procedures are easier to manage when you're not rushing.",
      "Seasoned advice: Learn basic phrases in the local language of {TO}. Even simple greetings can make your interactions smoother and more pleasant.",
    ],
    faqs: [
      { q: "Where can I find official visa information?", a: "Check the official government website of {TO}, or contact their embassy or consulate in {FROM}. Official sources have the most accurate and current requirements." },
      { q: "How far in advance should I check requirements?", a: "Check requirements as soon as you start planning, then verify again 2-4 weeks before travel. Requirements can change with little notice." },
      { q: "What if my question isn't answered here?", a: "Contact the {TO} embassy or consulate in {FROM}. They can provide specific guidance based on your individual circumstances." },
      { q: "Are there any travel advisories I should know about?", a: "Check your government's travel advisory website for {TO}. These advisories provide safety information and any special entry conditions." },
      { q: "Do I need any vaccinations to enter?", a: "Some countries require proof of certain vaccinations. Check the health requirements for {TO} and consult your doctor or a travel health clinic." },
    ],
  },
};

// Helper functions
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = <T>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getTemplateForType = (reqType: string | null): typeof templates.generic => {
  if (!reqType) return templates.generic;
  const normalized = reqType.toLowerCase().replace(/[^a-z_]/g, '_');
  if (normalized.includes('visa_free') || normalized.includes('not_required') || normalized.includes('freedom')) return templates.visa_free;
  if (normalized.includes('arrival')) return templates.visa_on_arrival;
  if (normalized.includes('e_visa') || normalized.includes('electronic')) return templates.e_visa;
  if (normalized.includes('visa_required') || normalized.includes('required')) return templates.visa_required;
  return templates.generic;
};

const replacePlaceholders = (text: string, from: string, to: string): string => {
  return text.replace(/{FROM}/g, from).replace(/{TO}/g, to);
};

const generateContent = (
  fromCountry: { name: string; slug: string },
  toCountry: { name: string; slug: string },
  reqType: string | null,
  authorSlug: string
) => {
  const template = getTemplateForType(reqType);
  
  const replace = (t: string) => replacePlaceholders(t, fromCountry.name, toCountry.name);
  
  const opening = replace(getRandomItem(template.openings));
  const requirements = replace(getRandomItem(template.requirements));
  const documents = replace(getRandomItem(template.documents));
  const process = replace(getRandomItem(template.process));
  const costs = replace(getRandomItem(template.costs));
  const tip = replace(getRandomItem(template.tips));
  
  const connector1 = getRandomItem(connectors);
  const connector2 = getRandomItem(connectors);
  
  let authorPhrase = "";
  if (authorPhrases[authorSlug]) {
    authorPhrase = getRandomItem(authorPhrases[authorSlug]);
  }
  
  const shuffledFaqs = shuffleArray(template.faqs).slice(0, 3 + Math.floor(Math.random() * 2));
  const faqHtml = shuffledFaqs.map(faq => `
    <div class="mb-4">
      <strong class="text-foreground">Q: ${replace(faq.q)}</strong><br/>
      <p class="mt-1 text-muted-foreground">${replace(faq.a)}</p>
    </div>`).join('\n');
  
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

  const title = `${toCountry.name} Visa Requirements for ${fromCountry.name} Citizens 2026`;
  const metaTitle = `${toCountry.name} Visa for ${fromCountry.name} Citizens - Requirements & How to Apply`;
  const metaDescription = `Complete guide to ${toCountry.name} visa requirements for ${fromCountry.name} passport holders. Learn about entry requirements, documents needed, application process, and fees.`;
  const excerpt = `Everything ${fromCountry.name} citizens need to know about visiting ${toCountry.name}: visa requirements, documents, application process, and costs.`;

  return { content, title, metaTitle, metaDescription, excerpt };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { batchSize = 500, dryRun = false, tier1Only = false } = await req.json().catch(() => ({}));

    console.log(`Starting bulk visa content generation. Batch size: ${batchSize}, Dry run: ${dryRun}, Tier 1 only: ${tier1Only}`);

    // Fetch all countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, slug')
      .order('name');

    if (countriesError) throw countriesError;
    if (!countries || countries.length === 0) {
      return new Response(JSON.stringify({ error: 'No countries found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Fetch active authors
    const { data: authors } = await supabase
      .from('authors')
      .select('id, slug')
      .eq('is_active', true);

    const authorList = authors && authors.length > 0 ? authors : [{ id: null, slug: 'priya-sharma' }];

    // Fetch existing content page slugs to skip - use pagination to get all
    const existingSlugs = new Set<string>();
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: existingPages } = await supabase
        .from('content_pages')
        .select('slug')
        .like('slug', 'visa-requirements/%')
        .range(offset, offset + pageSize - 1);
      
      if (existingPages && existingPages.length > 0) {
        existingPages.forEach(p => existingSlugs.add(p.slug));
        offset += existingPages.length;
        hasMore = existingPages.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Found ${existingSlugs.size} existing visa requirement pages`);

    // Fetch visa requirements for type matching
    const { data: visaReqs } = await supabase
      .from('visa_requirements')
      .select('from_country_id, to_country_id, requirement_type');

    const reqTypeMap = new Map<string, string>();
    (visaReqs || []).forEach(vr => {
      reqTypeMap.set(`${vr.from_country_id}-${vr.to_country_id}`, vr.requirement_type);
    });

    // Tier 1 countries for priority generation
    const tier1Countries = new Set([
      'united-states', 'united-kingdom', 'india', 'germany', 'france',
      'united-arab-emirates', 'canada', 'australia', 'china', 'japan',
      'south-korea', 'singapore', 'thailand', 'brazil', 'mexico',
      'italy', 'spain', 'netherlands', 'saudi-arabia', 'turkey'
    ]);

    // Generate all combinations
    const combinations: { from: typeof countries[0]; to: typeof countries[0] }[] = [];
    for (const fromCountry of countries) {
      for (const toCountry of countries) {
        if (fromCountry.id === toCountry.id) continue;
        
        // Skip if tier1Only and not a tier1 country pair
        if (tier1Only && !tier1Countries.has(fromCountry.slug) && !tier1Countries.has(toCountry.slug)) {
          continue;
        }
        
        const slug = `visa-requirements/${fromCountry.slug}-to-${toCountry.slug}`;
        if (existingSlugs.has(slug)) continue;
        
        combinations.push({ from: fromCountry, to: toCountry });
      }
    }

    console.log(`Found ${combinations.length} missing combinations to generate`);

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        missingCount: combinations.length,
        totalPossible: countries.length * (countries.length - 1),
        existingCount: existingSlugs.size,
        sampleCombinations: combinations.slice(0, 10).map(c => ({
          from: c.from.name,
          to: c.to.name,
          slug: `visa-requirements/${c.from.slug}-to-${c.to.slug}`
        }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process in batches
    const toProcess = combinations.slice(0, batchSize);
    const contentRows = [];
    const currentDate = new Date().toISOString();

    for (const combo of toProcess) {
      const slug = `visa-requirements/${combo.from.slug}-to-${combo.to.slug}`;
      const reqType = reqTypeMap.get(`${combo.from.id}-${combo.to.id}`) || null;
      const author = getRandomItem(authorList);
      
      const { content, title, metaTitle, metaDescription, excerpt } = generateContent(
        combo.from,
        combo.to,
        reqType,
        author.slug
      );

      contentRows.push({
        slug,
        title,
        content,
        meta_title: metaTitle,
        meta_description: metaDescription,
        excerpt,
        is_published: true,
        ai_generated: false, // Template-based, not AI
        writer_id: author.id,
        keywords: [
          `${combo.to.name} visa`,
          `${combo.from.name} passport`,
          'visa requirements',
          'entry requirements',
          'travel visa'
        ],
        created_at: currentDate,
        updated_at: currentDate
      });
    }

    // Batch insert with ON CONFLICT DO NOTHING
    if (contentRows.length > 0) {
      const { error: insertError } = await supabase
        .from('content_pages')
        .upsert(contentRows, { 
          onConflict: 'slug',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    // Submit to IndexNow in background (don't await)
    const generatedSlugs = contentRows.map(r => `https://visas.guide/${r.slug}`);
    if (generatedSlugs.length > 0) {
      supabase.functions.invoke('auto-indexnow', {
        body: { urls: generatedSlugs }
      }).catch(err => console.error('IndexNow error:', err));
    }

    console.log(`Successfully generated ${contentRows.length} content pages`);

    return new Response(JSON.stringify({
      success: true,
      generated: contentRows.length,
      remaining: combinations.length - contentRows.length,
      totalMissing: combinations.length,
      message: `Generated ${contentRows.length} visa requirement pages`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
