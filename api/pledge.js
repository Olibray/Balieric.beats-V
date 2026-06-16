// Server-side proxy — POSTs pledge data to the Google Apps Script without CORS issues.
// The client can't hit the Apps Script directly (no-cors breaks on redirects).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sheetUrl = process.env.PLEDGES_API_URL;
  if (!sheetUrl) return res.status(200).json({ ok: true, note: "sheet not configured" });

  const { name, email, people, from, artists } = req.body ?? {};

  const params = new URLSearchParams({
    name:    name    ?? "",
    email:   email   ?? "",
    people:  people  ?? "",
    from:    from    ?? "",
    artists: artists ?? "",
  });

  try {
    await fetch(sheetUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    params.toString(),
      redirect: "follow",
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("pledge sheet error:", err);
    return res.status(200).json({ ok: true }); // never block the user
  }
}
