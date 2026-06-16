// Proxies pledge data to Google Apps Script server-side.
// Key: use redirect:"manual" — Apps Script runs doPost() before sending the 302,
// so we don't need to follow it. Following it can downgrade POST→GET and lose the body.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sheetUrl = process.env.PLEDGES_API_URL;
  if (!sheetUrl) return res.status(200).json({ ok: true, note: "sheet not configured" });

  const body = req.body ?? {};
  const params = new URLSearchParams({
    name:    String(body.name    ?? ""),
    email:   String(body.email   ?? ""),
    people:  String(body.people  ?? ""),
    from:    String(body.from    ?? ""),
    artists: String(body.artists ?? ""),
  });

  try {
    await fetch(sheetUrl, {
      method:   "POST",
      headers:  { "Content-Type": "application/x-www-form-urlencoded" },
      body:     params.toString(),
      redirect: "manual", // doPost already ran before the 302 — don't follow
    });
  } catch (err) {
    console.error("[pledge] sheet error:", err?.message);
  }

  return res.status(200).json({ ok: true });
};
