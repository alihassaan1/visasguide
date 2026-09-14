// Static content registry for ETIAS sub-pages.
// Keeps copy in one place , easier to audit for accuracy & fee consistency.
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
    title: `ETIAS Requirements 2026 , Documents, Eligibility & Passport Rules`,
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
      { heading: "Background questions", body: "You'll answer questions about criminal history (last 10 years), conflict zones visited (last 10 years), and previous EU/Schengen refusals or deportations. Answer truthfully , false declarations are grounds for refusal and future bans." },
      { heading: "Payment", body: `A ${ETIAS_FACTS.fee} non-refundable fee is charged when you submit. Applicants under 18 or over 70 are exempt from the fee but must still complete an application.` },
    ],
    faqs: [
      { question: "Do I need a biometric passport for ETIAS?", answer: "Yes. Non-biometric passports are not accepted. Most passports issued after 2009 are biometric , check for the small chip symbol on the cover." },
      { question: "Can I apply for ETIAS without a confirmed flight?", answer: "Yes. You only need to state the first Schengen country you intend to enter. You don't need to upload tickets or hotel bookings." },
    ],
    keywords: ["ETIAS requirements", "ETIAS documents", "ETIAS passport", "ETIAS eligibility"],
  },

  application: {
    slug: "application",
    title: "How to Apply for ETIAS , Step-by-Step Guide 2026",
    h1: "How to apply for ETIAS",
    seoDescription: `Step-by-step ETIAS application guide. Apply online at the official EU portal in under 10 minutes for ${ETIAS_FACTS.fee}. Avoid scam sites.`,
    intro: `The ETIAS application is online-only and takes about 10 minutes. Always apply through the official EU portal at travel-europe.europa.eu , third-party sites charge inflated fees.`,
    sections: [
      { heading: "Step 1 , Go to the official portal", body: "The only official site is travel-europe.europa.eu/etias. There is also an official ETIAS mobile app. Anything else is a reseller." },
      { heading: "Step 2 , Enter passport details", body: "Type your name, date of birth, and passport number exactly as they appear on the data page. Mismatches are the most common reason for entry refusal at the border." },
      { heading: "Step 3 , Answer background questions", body: "Honest answers about prior visa refusals, criminal history, and recent travel to conflict zones. Lying is grounds for refusal and a multi-year ban." },
      { heading: `Step 4 , Pay the ${ETIAS_FACTS.fee} fee`, body: "Debit or credit cards from anywhere in the world are accepted. The fee is waived for applicants under 18 and over 70." },
      { heading: "Step 5 , Wait for approval", body: "Most applicants get an approval email within minutes. If your application is flagged for manual review, it can take up to 30 days, so apply well before travel." },
    ],
    faqs: [
      { question: "Can someone apply on my behalf?", answer: "Yes. A representative (family member, travel agent) can submit the application for you, but you remain legally responsible for the information provided." },
      { question: "What if my ETIAS is refused?", answer: "You'll get a written explanation and have the right to appeal. You can also reapply if circumstances change. A refused ETIAS doesn't automatically prevent you from applying for a regular Schengen visa." },
    ],
    keywords: ["ETIAS application", "apply for ETIAS", "how to apply ETIAS", "ETIAS online"],
  },

  cost: {
    slug: "cost",
    title: `ETIAS Cost 2026 , €20 Fee, Exemptions & Payment Methods`,
    h1: `ETIAS cost: ${ETIAS_FACTS.fee} per application`,
    seoDescription: `ETIAS costs ${ETIAS_FACTS.fee} per applicant. Free for under-18s and over-70s. No fee for ${ETIAS_FACTS.validityYears}-year renewals , read who pays and who doesn't.`,
    intro: `ETIAS costs ${ETIAS_FACTS.fee} per application. It's a one-time fee that covers up to ${ETIAS_FACTS.validityYears} years of travel (or until your passport expires). Several groups are exempt , see the breakdown below.`,
    sections: [
      { heading: "The standard fee", body: `${ETIAS_FACTS.fee} per applicant, paid by debit or credit card during the online application. The fee is non-refundable, even if your application is refused.` },
      { heading: "Who is exempt", body: "The following applicants must still apply but pay no fee:", list: [
        `Children under ${ETIAS_FACTS.feeExemptUnder} at the time of application`,
        `Adults aged ${ETIAS_FACTS.feeExemptOver} or older at the time of application`,
        "Family members of EU/EEA/Swiss citizens exercising free-movement rights",
      ]},
      { heading: "Hidden costs to avoid", body: `Several third-party sites charge €40-€90 for ETIAS by adding "service" or "express processing" fees. There is no express processing , the official EU system already returns most decisions within minutes. Apply only at travel-europe.europa.eu/etias.` },
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
    title: "ETIAS Processing Time , How Long Does Approval Take?",
    h1: "ETIAS processing time",
    seoDescription: "Most ETIAS applications are approved within minutes. Manual reviews can take up to 30 days , apply early to avoid travel disruption.",
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
      { heading: "When to apply", body: "Apply at least 96 hours before travel as a minimum, and ideally 2-4 weeks before. If you're applying for the first time or have a complex history, give yourself a month." },
    ],
    faqs: [
      { question: "Can I pay for faster ETIAS processing?", answer: "No. There is no express or priority service. Any website offering one is a scam." },
      { question: "What happens if I travel before I get approval?", answer: "You'll be refused boarding by your airline. Carriers check ETIAS status at check-in." },
    ],
    keywords: ["ETIAS processing time", "ETIAS approval time", "how long ETIAS"],
  },

  "schengen-countries": {
    slug: "schengen-countries",
    title: `Schengen Countries Requiring ETIAS , Full List of 30 Nations`,
    h1: `The ${ETIAS_FACTS.schengenCountries} Schengen countries that require ETIAS`,
    seoDescription: `All ${ETIAS_FACTS.schengenCountries} European countries where ETIAS will be required from ${ETIAS_FACTS.launchWindow}: EU Schengen states plus Iceland, Norway, Switzerland, and Liechtenstein.`,
    intro: `ETIAS applies to ${ETIAS_FACTS.schengenCountries} European countries , the 25 EU Schengen members, the 4 EFTA countries in Schengen, and Cyprus (joining in 2026). It does not apply to the UK or Ireland.`,
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
    title: `ETIAS Eligible Nationalities , Full List of ${ETIAS_FACTS.eligibleNationalities}+ Countries`,
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
    title: "ETIAS vs Schengen Visa , Key Differences Explained",
    h1: "ETIAS vs Schengen visa",
    seoDescription: `ETIAS is a ${ETIAS_FACTS.fee} travel authorisation for visa-waiver nationals. Schengen visa is a €90 sticker visa for nationalities that need one. Here's how they differ.`,
    intro: "ETIAS and the Schengen visa are not interchangeable. Which one you need depends on your nationality , not your trip purpose. Here's how they compare side by side.",
    sections: [
      { heading: "Who they apply to", body: `ETIAS is for visa-exempt nationalities (USA, UK, Canada, Australia, Japan, etc.). The Schengen visa is for nationalities that require a visa to enter Europe (India, China, Pakistan, Nigeria, and many others).` },
      { heading: "Cost", body: `ETIAS is ${ETIAS_FACTS.fee} and the Schengen short-stay visa is €90 for adults (€45 for children 6-12). The Schengen visa also typically involves biometric appointment fees of €20-€40 charged by visa application centres.` },
      { heading: "Process", body: "ETIAS is fully online with no appointment. Schengen visa requires an in-person appointment at a VAC or consulate, biometrics, supporting documents, and weeks of processing." },
      { heading: "Validity", body: `ETIAS lasts up to ${ETIAS_FACTS.validityYears} years and allows unlimited entries. Schengen visas are issued for specific date ranges (single, double, or multiple entry) with most short-term tourist visas valid for the duration of the trip only.` },
      { heading: "Border control", body: "Both require you to clear immigration on arrival. Neither guarantees entry , the border officer makes the final decision." },
    ],
    faqs: [
      { question: "Can I get ETIAS instead of a Schengen visa?", answer: "No. ETIAS is only available to visa-waiver nationals. If your passport requires a Schengen visa, you cannot opt for ETIAS." },
      { question: "Will ETIAS replace the Schengen visa?", answer: "No. They serve different groups of travellers and will run in parallel indefinitely." },
    ],
    keywords: ["ETIAS vs Schengen visa", "Schengen visa ETIAS difference", "ETIAS or Schengen visa"],
  },

  faq: {
    slug: "faq",
    title: "ETIAS FAQ , Answers to the Most Common Questions",
    h1: "ETIAS frequently asked questions",
    seoDescription: `${ETIAS_FACTS.fee} fee, ${ETIAS_FACTS.validityYears}-year validity, ${ETIAS_FACTS.launchWindow} launch , answers to every question travellers ask about ETIAS.`,
    intro: "The most common ETIAS questions, answered in plain English and updated as the EU releases new guidance.",
    sections: [
      { heading: "Is ETIAS live yet?", body: `Not yet. The official launch is ${ETIAS_FACTS.launchWindow}. You cannot apply before then , any site claiming to accept applications now is fraudulent.` },
      { heading: `Why is ETIAS only ${ETIAS_FACTS.fee}?`, body: "The fee covers the cost of running the system and is set by EU regulation. It was originally proposed at €7, then revised upward to €20 to reflect actual operating costs." },
      { heading: "What happens if I overstay with ETIAS?", body: `ETIAS allows ${ETIAS_FACTS.maxStayDays} days in any ${ETIAS_FACTS.maxStayWindowDays}-day period. Overstaying triggers fines, deportation, and possible multi-year entry bans. The Entry/Exit System tracks your days automatically.` },
      { heading: "Does ETIAS guarantee I'll be let into the EU?", body: "No. Border officers have the final say. ETIAS approval only means you're authorised to travel to the border, not that you'll be admitted." },
      { heading: "Can I extend ETIAS once I'm in Europe?", body: "No. ETIAS itself doesn't need extending within its validity period, but you cannot extend the 90/180 day stay limit. You'd need a long-stay national visa from one of the Schengen countries." },
    ],
    keywords: ["ETIAS FAQ", "ETIAS questions", "ETIAS help"],
  },

  "after-brexit": {
    slug: "after-brexit",
    title: "ETIAS After Brexit , What UK Travellers Need to Know",
    h1: "ETIAS after Brexit: a UK traveller's guide",
    seoDescription: `Since Brexit, UK passport holders need ETIAS to visit the Schengen area from ${ETIAS_FACTS.launchWindow}. ${ETIAS_FACTS.fee} fee, ${ETIAS_FACTS.validityYears}-year validity, 90/180 day rule.`,
    intro: `Brexit ended freedom of movement for UK citizens. From ${ETIAS_FACTS.launchWindow}, British passport holders will need ETIAS to enter the 30 Schengen countries , exactly like Americans and Canadians. Here's what changes and what doesn't.`,
    sections: [
      { heading: "Why UK travellers now need ETIAS", body: "After Brexit, UK nationals lost EU citizenship rights and became third-country nationals for Schengen purposes. The UK was added to the visa-waiver list, which is precisely the list that ETIAS applies to." },
      { heading: "What stays the same", body: "", list: [
        "You can still visit Schengen for up to 90 days in any 180-day period",
        "No visa required for tourism, business meetings, or short study",
        "UK passport remains valid (no EU passport queue, though)",
        "Ireland is unaffected , Common Travel Area rules still apply",
      ]},
      { heading: "What changes with ETIAS", body: "", list: [
        `${ETIAS_FACTS.fee} fee per traveller (free under 18 and over 70)`,
        "Apply online before you travel , no walk-up at the border",
        "Linked to your passport: get a new passport, reapply",
        "Airlines will check your ETIAS status at check-in",
      ]},
      { heading: "Brexit-era travel issues to be aware of", body: "Beyond ETIAS, UK travellers must also clear the new EU Entry/Exit System (EES) which fingerprints non-EU arrivals, count days carefully under the 90/180 rule, and ensure their passport was issued less than 10 years ago and is valid for at least 3 months beyond departure." },
      { heading: "Living or working in the EU", body: "ETIAS is for short stays only. UK citizens planning to move, work, or study long-term in an EU country still need a national long-stay visa or residence permit from that specific country , ETIAS does not cover this." },
    ],
    faqs: [
      { question: "Do UK citizens need ETIAS for Ireland?", answer: "No. The UK and Ireland share the Common Travel Area, so UK passport holders do not need ETIAS to visit Ireland." },
      { question: "Will ETIAS be required for day trips to France?", answer: "Yes. Any entry into Schengen , including a day trip to Calais or Dunkirk , requires a valid ETIAS." },
    ],
    keywords: ["ETIAS Brexit", "ETIAS UK", "ETIAS for British citizens", "UK to Europe ETIAS"],
  },

  "for-families": {
    slug: "for-families",
    title: "ETIAS for Families , Group Applications, Kids & Exemptions",
    h1: "ETIAS for families",
    seoDescription: `Family ETIAS guide: each traveller needs their own application. Under-18s are fee-exempt but still apply. Tips for parents booking the whole household.`,
    intro: `There's no single "family ETIAS" , each traveller, including infants, needs their own application linked to their own passport. The good news: anyone under ${ETIAS_FACTS.feeExemptUnder} is exempt from the ${ETIAS_FACTS.fee} fee.`,
    sections: [
      { heading: "One application per passport", body: "ETIAS is tied to a specific passport, so each family member needs their own application. A parent or guardian can submit on behalf of a child, but they must complete a separate form for each one." },
      { heading: "Who in the family pays", body: "", list: [
        `Adults aged ${ETIAS_FACTS.feeExemptUnder}-${ETIAS_FACTS.feeExemptOver - 1}: pay the standard ${ETIAS_FACTS.fee} fee`,
        `Children under ${ETIAS_FACTS.feeExemptUnder}: fee-exempt`,
        `Grandparents aged ${ETIAS_FACTS.feeExemptOver}+: fee-exempt`,
        "Family members of EU/EEA/Swiss citizens (with proof of relationship): fee-exempt",
      ]},
      { heading: "Tips for applying as a family", body: "", list: [
        "Use the same email address for all applications so confirmations land in one inbox",
        "Apply for everyone in one sitting , easier to spot data-entry errors",
        "Keep a spreadsheet of each family member's application reference number",
        "Apply at least 2-4 weeks before travel, especially for first-time applicants",
      ]},
      { heading: "Travelling with infants and newborns", body: "Babies need their own passport and their own ETIAS. If your baby was born after you applied for the rest of the family, you'll need to add a separate ETIAS for them before travel." },
      { heading: "Divorced or separated parents", body: "Either legal parent can submit a child's ETIAS application. For travel itself, EU border officers may ask for a notarised consent letter from the non-travelling parent , ETIAS doesn't replace that requirement." },
    ],
    faqs: [
      { question: "Can I apply for ETIAS for my whole family at once?", answer: "Not in a single form, but you can complete each application back-to-back in one session. Each application is separate and tied to one passport." },
      { question: "What if my child's ETIAS is approved but mine is not?", answer: "Each application is decided on its own merits. A child's approval does not depend on a parent's. If yours is delayed, the child can technically still travel , but in practice, a minor cannot travel alone." },
    ],
    keywords: ["ETIAS family", "ETIAS for kids", "ETIAS children", "family ETIAS application"],
  },

  renewal: {
    slug: "renewal",
    title: `ETIAS Renewal , What Happens When Your ${ETIAS_FACTS.validityYears}-Year Authorisation Expires`,
    h1: "ETIAS renewal",
    seoDescription: `ETIAS lasts ${ETIAS_FACTS.validityYears} years or until your passport expires. There's no renewal discount , you reapply and pay ${ETIAS_FACTS.fee} again. Here's the process.`,
    intro: `ETIAS isn't renewed , it's reapplied. When your ${ETIAS_FACTS.validityYears}-year authorisation expires, or when you get a new passport, you start a fresh application and pay the ${ETIAS_FACTS.fee} fee again.`,
    sections: [
      { heading: "When ETIAS expires", body: "Your ETIAS expires on whichever happens first:", list: [
        `${ETIAS_FACTS.validityYears} years after the date of approval`,
        "The expiry date of the passport it's linked to",
        "If your passport is lost, stolen, or replaced for any reason",
      ]},
      { heading: "How to reapply", body: "The process is identical to the first application , go to the official portal, enter your new passport details, answer the background questions, and pay the fee. There's no fast-track or loyalty discount for repeat applicants." },
      { heading: "When to reapply", body: "Apply for the new ETIAS as soon as your previous one expires or your new passport is issued. The EU recommends having a valid ETIAS in hand at least 96 hours before travel." },
      { heading: "Does renewal carry over my approval history?", body: "Yes. The ETIAS database keeps your history, which usually means repeat approvals are faster , most renewals are auto-approved within minutes, unless something in your circumstances has changed." },
      { heading: "What if my application is denied at renewal?", body: "Renewal is treated as a fresh decision. New criminal records, immigration breaches, or overstays since your last approval can all trigger a refusal. See the ETIAS denied page for next steps." },
    ],
    faqs: [
      { question: "Can I renew ETIAS before it expires?", answer: "There's no formal early renewal, but you can submit a new application at any time. The new approval replaces the old one immediately." },
      { question: "Do I get a discount when renewing ETIAS?", answer: `No. The full ${ETIAS_FACTS.fee} fee applies to every application, including renewals.` },
    ],
    keywords: ["ETIAS renewal", "renew ETIAS", "ETIAS expiry", "ETIAS reapply"],
  },

  denied: {
    slug: "denied",
    title: "ETIAS Denied , Reasons for Refusal, Appeals & What to Do Next",
    h1: "ETIAS denied: your options",
    seoDescription: `If your ETIAS is refused you'll get a written reason and the right to appeal. Common refusal grounds, appeal process, and how to reapply.`,
    intro: "Most ETIAS applications are approved automatically, but a small percentage are refused. A refusal isn't the end of the road , you'll get a written explanation, a right to appeal, and (in many cases) the option to reapply.",
    sections: [
      { heading: "Common reasons for ETIAS refusal", body: "", list: [
        "Past immigration breaches in the EU (overstays, deportations)",
        "Criminal convictions, particularly for serious offences",
        "Recent travel to conflict zones or countries on EU watchlists",
        "Previous Schengen visa refusals",
        "Inconsistencies between your application and existing EU records",
        "Use of a passport flagged as lost, stolen, or invalidated",
      ]},
      { heading: "What you'll receive", body: "A refusal notice by email stating the reason, the EU member state that took the decision, and your right to appeal. The decision is taken by the country you listed as your first point of entry." },
      { heading: "How to appeal", body: "Appeals go to the authority that made the decision , usually a national interior or immigration ministry , and follow that country's own rules. Deadlines are typically 30 days. You can also engage a lawyer or migration specialist in that country." },
      { heading: "Can I reapply instead?", body: "Yes. If circumstances change (record expunged, deportation period ended, new evidence) you can submit a fresh application. There's no waiting period, but reapplying with the same facts will almost always be refused again." },
      { heading: "Refused ETIAS vs Schengen visa", body: "A refused ETIAS does not automatically prevent you from applying for a regular Schengen short-stay visa. The Schengen visa is a more thorough process and may approve cases that ETIAS auto-refused." },
    ],
    faqs: [
      { question: "Is the ETIAS refusal fee refunded?", answer: `No. The ${ETIAS_FACTS.fee} fee covers the review, not the outcome.` },
      { question: "Can I travel on a different EU country's ETIAS if one country refuses?", answer: "No. ETIAS is a single Schengen-wide authorisation. A refusal from one member state blocks entry to all 30 Schengen countries." },
    ],
    keywords: ["ETIAS denied", "ETIAS refused", "ETIAS appeal", "ETIAS rejection"],
  },

  "vs-esta": {
    slug: "vs-esta",
    title: "ETIAS vs ESTA , Europe's New System Compared to the US ESTA",
    h1: "ETIAS vs ESTA",
    seoDescription: `ETIAS is Europe's answer to the US ESTA. Both are online travel authorisations for visa-waiver nationals. Here's how the ${ETIAS_FACTS.fee} ETIAS compares to the $21 ESTA.`,
    intro: "ETIAS is modelled on the US ESTA: an online pre-travel authorisation for visa-waiver nationals, checked by airlines before boarding. The systems are similar but the details differ , here's a side-by-side comparison.",
    sections: [
      { heading: "What they have in common", body: "", list: [
        "Both are online-only authorisations, not visas",
        "Both are required before you board a flight",
        "Both are multi-year (3 years ETIAS, 2 years ESTA)",
        "Both allow multiple entries within validity",
        "Neither guarantees admission , border officers have the final say",
      ]},
      { heading: "Cost", body: `ETIAS is ${ETIAS_FACTS.fee}. ESTA is $21 (raised from $14 in 2022, then $21 in 2025). Both are non-refundable.` },
      { heading: "Validity", body: `ETIAS lasts ${ETIAS_FACTS.validityYears} years or until your passport expires. ESTA lasts 2 years or until your passport expires. Both allow 90-day stays per visit, but ESTA stays are counted separately while ETIAS uses the 90/180 rolling window.` },
      { heading: "Processing time", body: "Most ESTA decisions are returned within 72 hours; ETIAS aims for instant approval in most cases with a 30-day maximum. In practice, both systems usually decide in under an hour." },
      { heading: "Who needs which", body: "If you hold a passport from a visa-waiver country, you need ESTA to enter the US and ETIAS to enter Schengen. They are independent , having one does not exempt you from the other." },
      { heading: "Background questions", body: "Both ask about criminal history, prior immigration violations, and recent travel to high-risk regions. ETIAS also asks about education and occupation; ESTA asks about communicable diseases." },
    ],
    faqs: [
      { question: "Does ESTA work for travel to Europe?", answer: "No. ESTA is only for travel to the United States. You need a separate ETIAS for Europe." },
      { question: "Which is harder to get approved , ETIAS or ESTA?", answer: "Both have very high approval rates (above 98%). ESTA tends to be stricter on past US immigration breaches; ETIAS is stricter on EU overstays." },
    ],
    keywords: ["ETIAS vs ESTA", "ESTA vs ETIAS", "ETIAS ESTA comparison", "Europe ESTA equivalent"],
  },

  "schengen-itineraries": {
    slug: "schengen-itineraries",
    title: "ETIAS Schengen Itineraries , Trip Ideas Within Your 90 Days",
    h1: "Schengen itineraries for ETIAS travellers",
    seoDescription: `Make the most of your ETIAS with curated Schengen itineraries: classic capitals, honeymoon routes, family-friendly trips, and slow-travel ideas , all within the 90/180 day rule.`,
    intro: `Your ETIAS unlocks 30 Schengen countries for up to ${ETIAS_FACTS.maxStayDays} days at a time. Here are itinerary ideas , from quick city breaks to month-long honeymoons , that fit comfortably inside the 90/180 day rule.`,
    sections: [
      { heading: "Classic capitals (10 days)", body: "Paris → Amsterdam → Berlin → Prague. High-speed rail links the four, no internal border checks, and you'll cover Europe's must-see landmarks in under two weeks." },
      { heading: "Honeymoon , Italian romance (14 days)", body: "Rome → Florence → Venice → Lake Como → Cinque Terre. Pair with optional private tours and dining experiences from our partners for special-occasion travel." },
      { heading: "Family-friendly Schengen (12 days)", body: "Munich (Legoland & Deutsches Museum) → Salzburg → Vienna → Prague. Kid-friendly cities with short train hops and plenty of green space." },
      { heading: "Slow travel , Iberia (30 days)", body: "Lisbon → Porto → Madrid → Seville → Granada → Barcelona. A month of food, history, and beaches; well under the 90-day ETIAS limit." },
      { heading: "Nordic adventure (10 days)", body: "Copenhagen → Stockholm → Oslo → Bergen. Hit the fjords and three Scandinavian capitals via train, ferry, and short flights." },
      { heading: "Mind the 90/180 rule", body: `Whichever route you pick, your total time in Schengen cannot exceed ${ETIAS_FACTS.maxStayDays} days in any ${ETIAS_FACTS.maxStayWindowDays}-day window. Plan return trips with a buffer.` },
    ],
    keywords: ["Schengen itinerary", "ETIAS trip ideas", "Europe honeymoon ETIAS", "Schengen 90 days"],
  },
};
