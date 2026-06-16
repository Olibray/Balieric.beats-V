// Vercel serverless function — returns pledge headcount for the public progress bar.
// Calls the same Google Apps Script that feeds the admin panel.
// Env vars needed on Vercel: PLEDGES_API_URL, PLEDGES_API_TOKEN
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  const url = process.env.PLEDGES_API_URL;
  const token = process.env.PLEDGES_API_TOKEN || "";

  if (!url) return res.status(200).json({ count: 0, goal: 200, pct: 0 });

  try {
    const target = url + (url.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token);
    const data = await fetch(target).then(r => r.json());
    const pledges = Array.isArray(data) ? data : [];

    const count = pledges.reduce((sum, p) => {
      const s = (p.people || "").toLowerCase();
      if (s.includes("just me")) return sum + 1;
      if (s.includes("+ 1") || s.includes("+1")) return sum + 2;
      if (s.includes("3") || s.includes("group")) return sum + 3;
      if (s.includes("6") || s.includes("crew")) return sum + 6;
      return sum + 1;
    }, 0);

    const goal = 200;
    const pct = Math.min(100, Math.round((count / goal) * 100));
    return res.status(200).json({ count, goal, pct });
  } catch {
    return res.status(200).json({ count: 0, goal: 200, pct: 0 });
  }
}
