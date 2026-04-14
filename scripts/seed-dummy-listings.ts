import "dotenv/config";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  console.error("Missing required AIRTABLE_* environment variables");
  process.exit(1);
}

const dummyListings = [
  {
    "Full Name": "Simone Davis",
    "Business Name": "Simone Davis Studio",
    "Email": "simone@example.com",
    "Phone": "+1 (404) 555-0101",
    "City and State": "Atlanta, GA",
    "Country": "United States",
    "Short Bio": "Luxury natural haircare studio celebrating the beauty of textured hair. Specializing in protective styles, loc journeys, and bespoke scalp treatments. Every client leaves feeling like royalty.",
    "What Do You Offer": "Protective styling, loc journeys, scalp treatments, and custom natural haircare consultations.",
    "Category": ["Wellness, Beauty & Self-Care "],
    "Status": "Active",
    "Website or Booking Link": "https://simonedavisstudio.com",
  },
  {
    "Full Name": "Kezia Okafor",
    "Business Name": "Kezia's Kitchen Collective",
    "Email": "kezia@example.com",
    "Phone": "+1 (832) 555-0187",
    "City and State": "Houston, TX",
    "Country": "United States",
    "Short Bio": "Artisan catering and meal prep service rooted in West African culinary traditions with a modern twist. From intimate dinner parties to curated charcuterie boards, every meal tells a story of heritage and flavor.",
    "What Do You Offer": "Catering, meal prep, charcuterie boards, and curated dinner party experiences.",
    "Category": ["Food & Beverage (Curated Brands Only) "],
    "Status": "Active",
    "Website or Booking Link": "https://kezias-kitchen.com",
  },
  {
    "Full Name": "Natalie Brown",
    "Business Name": "Golden Hour Photography",
    "Email": "natalie@example.com",
    "Phone": "+1 (213) 555-0234",
    "City and State": "Los Angeles, CA",
    "Country": "United States",
    "Short Bio": "Brand and lifestyle photographer specializing in editorial portraits, creative campaigns, and luxury event photography. Capturing the essence of powerful women and elevated brands through cinematic storytelling.",
    "What Do You Offer": "Editorial portraits, brand photography, luxury event coverage, and creative campaigns.",
    "Category": ["Other (Subject to Approval)"],
    "Status": "Active",
    "Website or Booking Link": "https://goldenhourphoto.co",
  },
  {
    "Full Name": "Amara Nwosu",
    "Business Name": "House of Amara",
    "Email": "amara@example.com",
    "Phone": "+234 802 555 0193",
    "City and State": "Lagos, Lagos",
    "Country": "Nigeria",
    "Short Bio": "Luxury womenswear brand merging Nigerian fabric artistry with contemporary silhouettes. Each piece is hand-crafted to celebrate the modern African woman — bold, refined, and unapologetically herself.",
    "What Do You Offer": "Bespoke womenswear, made-to-measure gowns, and ready-to-wear collections featuring African fabrics.",
    "Category": ["Other (Subject to Approval)"],
    "Status": "Active",
    "Website or Booking Link": "https://houseofamara.ng",
  },
];

async function seed() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
  let created = 0;

  for (const fields of dummyListings) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: true }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Failed to create "${fields["Business Name"]}":`, err);
    } else {
      const data = await res.json();
      console.log(`✓ Created "${fields["Business Name"]}" — ID: ${data.id}`);
      created++;
    }
  }

  console.log(`\nDone. ${created}/${dummyListings.length} records created.`);
}

seed().catch(console.error);
