import { NextResponse } from "next/server";
import { initialGovDatasets } from "../../../db/data";

// Dataset: City, Age Group & Gender-wise Persons Arrested under IPC Crimes
// Metropolitan Cities (2019) — National Crime Records Bureau
// Source: https://www.data.gov.in/resource/city-age-group-and-gender-wise-persons-arrested-under-ipc-crimes-metropolitan-cities-0
const DEFAULT_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const DEFAULT_RESOURCE_ID = "f28fb4fd-86cb-49e5-a222-6776bf371fdd";

export async function GET() {
    const apiKey = process.env.DATA_GOV_IN_API_KEY || DEFAULT_API_KEY;
    const resourceId = process.env.RESOURCE_ID || DEFAULT_RESOURCE_ID;

    try {
        const targetUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=20`;
        const res = await fetch(targetUrl, {
            headers: { Accept: "application/json" }
        });

        if (res.ok) {
            const data = await res.json() as any;
            const liveRecords = (data.records || []).map((r: any, i: number) => ({
                id: `NCRB-LIVE-${i + 1}`,
                state_ut: r.state_ut || r["state/ut"] || r.state || "N/A",
                city: r.city || r.metro_city || "Metropolitan",
                age_group: r.age_group || r.age || "All",
                gender: r.gender || "Total",
                ipc_offence: r.ipc_offence || r.offence_category || "IPC Crime",
                arrested_count: r.arrested || r.persons_arrested || r.total || 0,
                year: r.year || "2019"
            }));

            return NextResponse.json({
                status: "SUCCESS",
                source: "LIVE_DATA_GOV_IN",
                dataset_title: "City-wise IPC Crimes Arrest Statistics — Metro Cities 2019",
                resource_id: resourceId,
                total: data.total || liveRecords.length,
                records: liveRecords.length > 0 ? liveRecords : initialGovDatasets,
                live: liveRecords.length > 0,
                timestamp: Date.now()
            });
        }
    } catch (err) {
        console.error("[gov-data] Fetch error:", err);
    }

    // Resilient offline sandbox fallback
    return NextResponse.json({
        status: "SANDBOX_DEMO",
        source: "OPEN_DATA_CACHE",
        dataset_title: "State/UT IPC Crime Statistics (Open Data Sample Cache)",
        resource_id: DEFAULT_RESOURCE_ID,
        records: initialGovDatasets,
        live: false,
        timestamp: Date.now()
    });
}
