import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

// ─── Fetch Listings (Airtable proxy) ────────────────────────────────────────
app.get("/api/listings", async (_req, res) => {
  try {
    const AIRTABLE_API_KEY = getRequiredEnv("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = getRequiredEnv("AIRTABLE_BASE_ID");
    const AIRTABLE_TABLE_ID = getRequiredEnv("AIRTABLE_TABLE_ID");

    const allRecords: unknown[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams({
        filterByFormula: `{Status} = "Active"`,
      });
      if (offset) params.set("offset", offset);

      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?${params.toString()}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Airtable API error [${response.status}]: ${errorBody}`);
      }

      const data = await response.json();
      if (Array.isArray(data.records)) allRecords.push(...data.records);
      offset = typeof data.offset === "string" ? data.offset : undefined;
    } while (offset);

    res.json({ records: allRecords });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching listings:", message);
    res.status(500).json({ error: message });
  }
});

// ─── Submit Business Listing ─────────────────────────────────────────────────
app.post("/api/submit-listing", async (req, res) => {
  try {
    const AIRTABLE_API_KEY = getRequiredEnv("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = getRequiredEnv("AIRTABLE_BASE_ID");
    const AIRTABLE_TABLE_ID = getRequiredEnv("AIRTABLE_TABLE_ID");

    const {
      fullName, phone, email, cityAndState, country,
      shortBio, category, businessName, whatOffer,
      website, socialMedia,
    } = req.body;

    if (!fullName || !email || !cityAndState || !country || !businessName || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const description = [shortBio, whatOffer].filter(Boolean).join("\n\n");

    const fields: Record<string, string | string[]> = {
      "Full Name": String(fullName).slice(0, 200),
      "Email": String(email).slice(0, 500),
      "City and State": String(cityAndState).slice(0, 200),
      "Country": String(country).slice(0, 200),
      "Business Name": String(businessName).slice(0, 200),
      "Category": [String(category).slice(0, 100)],
      "Status": "Pending",
    };

    if (phone) fields["Phone"] = String(phone).slice(0, 50);
    if (description) fields["Business Description"] = description.slice(0, 2000);
    if (website) fields["Website or Booking Link"] = String(website).slice(0, 500);
    if (socialMedia) fields["Social Media Link (Instagram Preferred)"] = String(socialMedia).slice(0, 200);

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Airtable submit error:", errorBody);
      throw new Error(`Airtable API error [${response.status}]: ${errorBody}`);
    }

    const result = await response.json();
    res.json({ success: true, id: result.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error submitting listing:", message);
    res.status(500).json({ error: message });
  }
});

// ─── Serve Frontend ──────────────────────────────────────────────────────────
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
