// Reads the artists column from all pledges and returns an aggregated,
// deduplicated list sorted by request count.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");

  const sheetUrl = process.env.PLEDGES_API_URL;
  const token    = process.env.PLEDGES_API_TOKEN || "";
  if (!sheetUrl) return res.status(200).json([]);

  try {
    const url  = sheetUrl + (sheetUrl.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token);
    const data = await fetch(url).then(r => r.json());
    const pledges = Array.isArray(data) ? data : [];

    const counts = {};
    for (const pledge of pledges) {
      const raw = (pledge.artists || "").trim();
      if (!raw) continue;

      // Split on commas, semicolons, slashes, " and ", " & ", newlines
      const names = raw
        .split(/[,;\n\/]|\s+and\s+|\s+&\s+/i)
        .map(n => n.trim().replace(/^[-•*\d.]+\s*/, "")) // strip list markers
        .filter(n => n.length > 1 && n.length < 80);

      for (const name of names) {
        const key = name.toLowerCase().replace(/\s+/g, " ");
        if (!counts[key]) counts[key] = { name, count: 0 };
        else counts[key].count; // already exists — prefer first-seen casing
        counts[key].count++;
      }
    }

    const artists = Object.values(counts)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return res.status(200).json(artists);
  } catch (err) {
    console.error("[artists]", err?.message);
    return res.status(200).json([]);
  }
};
