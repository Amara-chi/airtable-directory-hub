import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

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

// ─── Track Analytics ────────────────────────────────────────────────────────
app.post("/api/analytics", async (req, res) => {
  try {
    const { listing_id, listing_name, event_type } = req.body;

    if (!listing_id || !event_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validEvents = ["view", "website_click", "instagram_click"];
    if (!validEvents.includes(event_type)) {
      return res.status(400).json({ error: "Invalid event_type" });
    }

    await pool.query(
      "INSERT INTO listing_analytics (listing_id, listing_name, event_type) VALUES ($1, $2, $3)",
      [listing_id, listing_name || "", event_type]
    );

    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error inserting analytics:", message);
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
