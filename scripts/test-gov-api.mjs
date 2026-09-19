const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const resourceId = "15150682-a9ed-475d-b0e3-67b292e90d22";
const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=5`;

console.log("▶ Testing live data.gov.in connection...");
try {
    const res = await fetch(url);
    console.log("HTTP Status:", res.status);
    const data = await res.json();
    console.log("✓ Connected successfully!");
    console.log("Title:", data.title || "IPC Crime Statistics");
    console.log("Records received:", data.records?.length || 0);
    if (data.records && data.records.length > 0) {
        console.log("Sample Record:", data.records[0]);
    }
} catch (e) {
    console.error("Fetch failed:", e);
}
