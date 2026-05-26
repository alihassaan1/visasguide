// Static content registry for ETIAS sub-pages.
// Keeps copy in one place — easier to audit for accuracy & fee consistency.
import { ETIAS_FACTS } from "@/components/etias/EtiasQuickFacts";

export interface EtiasSubPageContent {
  slug: string;
  title: string;
  h1: string;
  seoDescription: string;
  intro: string;
  sections: { heading: string; body: string; list?: string[] }[];
  faqs?: { question: string; answer: string }[];
  keywords?: string[];
}

export const ETIAS_SUB_PAGES: Record<string, EtiasSubPageContent> = {
  requirements: {
    slug: "requirements",
    title: `ETIAS Requirements 2026 — Documents, Eligibility & Passport Rules`,
    h1: "ETIAS Requirements",
    seoDescription: `Full ETIAS requirements: valid biometric passport, ${ETIAS_FACTS.fee} fee, email address, and travel plan. Check eligibility before applying.`,
    intro: `To apply for ETIAS you need a valid biometric passport from an eligible visa-waiver country, an email address, and a debit or credit card to pay the ${ETIAS_FACTS.fee} fee. The application takes about 10 minutes online.`,
    sections: [
      { heading: "Passport requirements", body: "Your passport must:", list: [
        "Be biometric (contain an electronic chip)",
        "Be valid for at least 3 months beyond your planned departure from the Schengen area",
        "Have been issued within the last 10 years",
        "Be from an ETIAS-eligible country",
      ]},
      { heading: "Personal information you'll provide", body: "The application asks for:", list: [
        "Full name, date and place of birth, nationality",
        "Home address, phone number, and email",
        "Parents' first names",
        "Education and current occupation",
        "First Schengen country you'll visit",
      ]},
      { heading: "Background questions", body: "You'll answer questions about criminal history (last 10 years), conflict zones visited (last 10 years), and previous EU/Schengen refusals or deportations. Answer truthfully — false declarations are grounds for refusal and future bans." },
      { heading: "Payment", body: `A ${ETIAS_FACTS.fee} non-refundable fee is charged when you submit. Applicants under 18 or over 70 are exempt from the fee but must still complete an application.` },
    ],
    faqs: [
      { question: "Do I need a biometric passport for ETIAS?", answer: "Yes. Non-biometric passports are not accepted. Most passports issued after 2009 are biometric — check for the small chip symbol on the cover." },
      { question: "Can I apply for ETIAS without a confirmed flight?", answer: "Yes. You only need to state the first Schengen country you intend to enter. You don't need to upload tickets or hotel bookings." },
    ],
    keywords: ["ETIAS requirements", "ETIAS documents", "ETIAS passport", "ETIAS eligibility"],
  },

  application: {
    slug: "application",
    title: "How to Apply for ETIAS — Step-by-Step Guide 2026",
    h1: "How to apply for ETIAS",
    seoDescription: `Step-by-step ETIAS application guide. Apply online at the official EU portal in under 10 minutes for ${ETIAS_FACTS.fee}. Avoid scam sites.`,
    intro: `The ETIAS application is online-only and takes about 10 minutes. Always apply through the official EU portal at travel-europe.europa.eu — third-party sites charge inflated fees.`,
    sections: [
      { heading: "Step 1 — Go to the official portal", body: "The only official site is travel-europe.europa.eu/etias. There is also an official ETIAS mobile app. Anything else is a reseller." },
      { heading: "Step 2 — Enter passport details", body: "Type your name, date of birth, and passport number exactly as they appear on the data page. Mismatches are the most common reason for entry refusal at the border." },
      { heading: "Step 3 — Answer background questions", body: "Honest answers about prior visa refusals, criminal history, and recent travel to conflict zones. Lying is grounds for refusal and a multi-year ban." },
      { heading: `Step 4 — Pay the ${ETIAS_FACTS.fee} fee`, body: "Debit or credit cards from anywhere in the world are accepted. The fee is waived for applicants under 18 and over 70." },
      { heading: "Step 5 — Wait for approval", body: "Most applicants get an approval email within minutes. If your application is flagged for manual review, it can take up to 30 days, so apply well before travel." },
    ],
    faqs: [
      { question: "Can someone apply on my behalf?", answer: "Yes. A representative (family member, travel agent) can submit the application for you, but you remain legally responsible for the information provided." },
      { question: "What if my ETIAS is refused?", answer: "You'll get a written explanation and have the right to appeal. You can also reapply if circumstances change. A refused ETIAS doesn't automatically prevent you from applying for a regular Schengen visa." },
    ],
    keywords: ["ETIAS application", "apply for ETIAS", "how to apply ETIAS", "ETIAS online"],
  },

  cost: {
    slug: "cost",
    title: `ETIAS Cost 2026 — €20 Fee, Exemptions & Payment Methods`,
    h1: `ETIAS cost: ${ETIAS_FACTS.fee} per application`,
    seoDescription: `ETIAS costs ${ETIAS_FACTS.fee} per applicant. Free for under-18s and over-70s. No fee for ${ETIAS_FACTS.validityYears}-year renewals — read who pays and who doesn't.`,
    intro: `ETIAS costs ${ETIAS_FACTS.fee} per application. It's a one-time fee that covers up to ${ETIAS_FACTS.validityYears} years of travel (or until your passport expires). Several groups are exempt — see the breakdown below.`,
    sections: [
      { heading: "The standard fee", body: `${ETIAS_FACTS.fee} per applicant, paid by debit or credit card during the online application. The fee is non-refundable, even if your application is refused.` },
      { heading: "Who is exempt", body: "The following applicants must still apply but pay no fee:", list: [
        `Children under ${ETIAS_FACTS.feeExemptUnder} at the time of application`,
        `Adults aged ${ETIAS_FACTS.feeExemptOver} or older at the time of application`,
        "Family members of EU/EEA/Swiss citizens exercising free-movement rights",
      ]},
      { heading: "Hidden costs to avoid", body: `Several third-party sites charge €40–€90 for ETIAS by adding "service" or "express processing" fees. There is no express processing — the official EU system already returns most decisions within minutes. Apply only at travel-europe.europa.eu/etias.` },
      { heading: "Renewal cost", body: `When your ETIAS expires after ${ETIAS_FACTS.validityYears} years (or when your passport is replaced), you'll need to apply again and pay the ${ETIAS_FACTS.fee} fee. There is no discounted renewal.` },
    ],
    faqs: [
      { question: "Is the ETIAS fee refundable if I'm refused?", answer: "No. The fee covers the application review, not approval. It is non-refundable regardless of outcome." },
      { question: "Do I need to pay every time I travel to Europe?", answer: `No. One ${ETIAS_FACTS.fee} payment covers unlimited trips for up to ${ETIAS_FACTS.validityYears} years.` },
    ],
    keywords: ["ETIAS cost", "ETIAS fee", "ETIAS price", "ETIAS €20", "ETIAS exemptions"],
  },

  "processing-time": {
    slug: "processing-time",
    title: "ETIAS Processing Time — How Long Does Approval Take?",
    h1: "ETIAS processing time",
    seoDescription: "Most ETIAS applications are approved within minutes. Manual reviews can take up to 30 days — apply early to avoid travel disruption.",
    intro: "ETIAS is designed for instant approval. The vast majority of applicants receive a decision by email within minutes of submitting. A small percentage are flagged for manual review and can wait up to 30 days.",
    sections: [
      { heading: "Typical timing", body: "Around 95% of applications are auto-approved within minutes. The system cross-checks your details against EU security databases (SIS, VIS, Europol, Interpol) and issues a decision immediately if nothing flags." },
      { heading: "When manual review kicks in", body: "Your application may go to a human reviewer if:", list: [
        "Your details match an entry in a security or migration database",
        "You answered yes to one of the background questions",
        "Your passport was previously used to apply and was refused",
        "Inconsistent or incomplete information was detected",
      ]},
      { heading: "Maximum legal processing time", body: "EU regulation caps ETIAS processing at 96 hours for additional information requests, with a total maximum of 30 days for fully manual decisions. Plan accordingly." },
      { heading: "When to apply", body: "Apply at least 96 hours before travel as a minimum, and ideally 2–4 weeks before. If you're applying for the first time or have a complex history, give yourself a month." },
    ],
    faqs: [
      { question: "Can I pay for faster ETIAS processing?", answer: "No. There is no express or priority service. Any website offering one is a scam." },
      { question: "What happens if I travel before I get approval?", answer: "You'll be refused boarding by your airline. Carriers check ETIAS status at check-in." },
    ],
    keywords: ["ETIAS processing time", "ETIAS approval time", "how long ETIAS"],
  },

  "schengen-countries": {
    slug: "schengen-countries",
    title: `Schengen Countries Requiring ETIAS — Full List of 30 Nations`,
    h1: `The ${ETIAS_FACTS.schengenCountries} Schengen countries that require ETIAS`,
    seoDescription: `All ${ETIAS_FACTS.schengenCountries} European countries where ETIAS will be required from ${ETIAS_FACTS.launchWindow}: EU Schengen states plus Iceland, Norway, Switzerland, and Liechtenstein.`,
    intro: `ETIAS applies to ${ETIAS_FACTS.schengenCountries} European countries — the 25 EU Schengen members, the 4 EFTA countries in Schengen, and Cyprus (joining in 2026). It does not apply to the UK or Ireland.`,
    sections: [
      { heading: "EU Schengen countries (25)", body: "", list: [
        "Austria", "Belgium", "Bulgaria", "Croatia", "Czech Republic",
        "Denmark", "Estonia", "Finland", "France", "Germany",
        "Greece", "Hungary", "Italy", "Latvia", "Lithuania",
        "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal",
        "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
      ]},
      { heading: "Non-EU Schengen countries (4)", body: "", list: [
        "Iceland", "Liechtenstein", "Norway", "Switzerland",
      ]},
      { heading: "Joining Schengen in 2026", body: "", list: ["Cyprus (expected full Schengen entry during 2026)"] },
      { heading: "Countries where ETIAS does NOT apply", body: "ETIAS is not needed for the United Kingdom (use UK ETA instead), Ireland (separate immigration system), or non-Schengen European microstates with their own rules. Travel to Russia, Belarus, Turkey, and Moldova is also outside ETIAS." },
    ],
    keywords: ["Schengen countries ETIAS", "countries needing ETIAS", "ETIAS country list"],
  },

  countries: {
    slug: "countries",
    title: `ETIAS Eligible Nationalities — Full List of ${ETIAS_FACTS.eligibleNationalities}+ Countries`,
    h1: "ETIAS eligible nationalities",
    seoDescription: `Around ${ETIAS_FACTS.eligibleNationalities} nationalities will need ETIAS to enter the Schengen area: USA, UK, Canada, Australia, Japan, and many more. See the full list.`,
    intro: `If your passport is from one of the ${ETIAS_FACTS.eligibleNationalities}+ visa-waiver countries listed below, you'll need ETIAS to enter Schengen from ${ETIAS_FACTS.launchWindow}. Choose your country for a tailored guide.`,
    sections: [
      { heading: "Americas", body: "", list: ["United States", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Uruguay", "Paraguay", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Panama"] },
      { heading: "Europe (non-Schengen)", body: "", list: ["United Kingdom", "Albania", "Bosnia and Herzegovina", "Georgia", "Moldova", "Montenegro", "North Macedonia", "Serbia", "Ukraine"] },
      { heading: "Asia & Pacific", body: "", list: ["Japan", "South Korea", "Singapore", "Hong Kong", "Taiwan", "Malaysia", "Brunei", "Australia", "New Zealand", "Israel", "United Arab Emirates"] },
      { heading: "Caribbean & Atlantic", body: "", list: ["Antigua and Barbuda", "Bahamas", "Barbados", "Dominica", "Grenada", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago"] },
      { heading: "Choose your country", body: "Country-specific pages walk through nationality-level rules, common pitfalls, and the application checklist. Start with: United States, United Kingdom, Canada, Australia, or Japan." },
    ],
    keywords: ["ETIAS eligible countries", "who needs ETIAS", "ETIAS nationalities"],
  },

  "vs-schengen-visa": {
    slug: "vs-schengen-visa",
    title: "ETIAS vs Schengen Visa — Key Differences Explained",
    h1: "ETIAS vs Schengen visa",
    seoDescription: `ETIAS is a ${ETIAS_FACTS.fee} travel authorisation for visa-waiver nationals. Schengen visa is a €90 sticker visa for nationalities that need one. Here's how they differ.`,
    intro: "ETIAS and the Schengen visa are not interchangeable. Which one you need depends on your nationality — not your trip purpose. Here's how they compare side by side.",
    sections: [
      { heading: "Who they apply to", body: `ETIAS is for visa-exempt nationalities (USA, UK, Canada, Australia, Japan, etc.). The Schengen visa is for nationalities that require a visa to enter Europe (India, China, Pakistan, Nigeria, and many others).` },
      { heading: "Cost", body: `ETIAS is ${ETIAS_FACTS.fee} and the Schengen short-stay visa is €90 for adults (€45 for children 6–12). The Schengen visa also typically involves biometric appointment fees of €20–€40 charged by visa application centres.` },
      { heading: "Process", body: "ETIAS is fully online with no appointment. Schengen visa requires an in-person appointment at a VAC or consulate, biometrics, supporting documents, and weeks of processing." },
      { heading: "Validity", body: `ETIAS lasts up to ${ETIAS_FACTS.validityYears} years and allows unlimited entries. Schengen visas are issued for specific date ranges (single, double, or multiple entry) with most short-term tourist visas valid for the duration of the trip only.` },
      { heading: "Border control", body: "Both require you to clear immigration on arrival. Neither guarantees entry — the border officer makes the final decision." },
    ],
    faqs: [
      { question: "Can I get ETIAS instead of a Schengen visa?", answer: "No. ETIAS is only available to visa-waiver nationals. If your passport requires a Schengen visa, you cannot opt for ETIAS." },
      { question: "Will ETIAS replace the Schengen visa?", answer: "No. They serve different groups of travellers and will run in parallel indefinitely." },
    ],
    keywords: ["ETIAS vs Schengen visa", "Schengen visa ETIAS difference", "ETIAS or Schengen visa"],
  },

  faq: {
    slug: "faq",
    title: "ETIAS FAQ — Answers to the Most Common Questions",
    h1: "ETIAS frequently asked questions",
    seoDescription: `${ETIAS_FACTS.fee} fee, ${ETIAS_FACTS.validityYears}-year validity, ${ETIAS_FACTS.launchWindow} launch — answers to every question travellers ask about ETIAS.`,
    intro: "The most common ETIAS questions, answered in plain English and updated as the EU releases new guidance.",
    sections: [
      { heading: "Is ETIAS live yet?", body: `Not yet. The official launch is ${ETIAS_FACTS.launchWindow}. You cannot apply before then — any site claiming to accept applications now is fraudulent.` },
      { heading: `Why is ETIAS only ${ETIAS_FACTS.fee}?`, body: "The fee covers the cost of running the system and is set by EU regulation. It was originally proposed at €7, then revised upward to €20 to reflect actual operating costs." },
      { heading: "What happens if I overstay with ETIAS?", body: `ETIAS allows ${ETIAS_FACTS.maxStayDays} days in any ${ETIAS_FACTS.maxStayWindowDays}-day period. Overstaying triggers fines, deportation, and possible multi-year entry bans. The Entry/Exit System tracks your days automatically.` },
      { heading: "Does ETIAS guarantee I'll be let into the EU?", body: "No. Border officers have the final say. ETIAS approval only means you're authorised to travel to the border, not that you'll be admitted." },
      { heading: "Can I extend ETIAS once I'm in Europe?", body: "No. ETIAS itself doesn't need extending within its validity period, but you cannot extend the 90/180 day stay limit. You'd need a long-stay national visa from one of the Schengen countries." },
    ],
    keywords: ["ETIAS FAQ", "ETIAS questions", "ETIAS help"],
  },
};
