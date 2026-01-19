const fs = require('fs');
const { DateTime } = require('luxon');

// ===== CONFIG =====
const yearsToGenerate = 20; 
const notes = {
    newMoon: "Begin cycle. Set direction, not pressure. Observe energy and clarity.",
    fullMoon: "Peak awareness. Release excess. No impulsive decisions."
};
const today = DateTime.utc();

// ===== HELPER FUNCTIONS =====
function getMoonPhases(year) {
    let phases = [];
    let lunarCycle = 29.53059;
    let baseDate = DateTime.fromISO("2000-01-06T18:14:00Z");
    let daysSinceBase = DateTime.utc(year, 1, 1).diff(baseDate, 'days').days;
    let cyclesSinceBase = Math.floor(daysSinceBase / lunarCycle);
    let firstCycle = baseDate.plus({ days: cyclesSinceBase * lunarCycle });

    let date = firstCycle;
    while (date.year <= year) {
        phases.push({
            type: 'New Moon',
            date: date.toISODate(),
            note: notes.newMoon
        });
        let fullMoonDate = date.plus({ days: lunarCycle / 2 });
        phases.push({
            type: 'Full Moon',
            date: fullMoonDate.toISODate(),
            note: notes.fullMoon
        });
        date = date.plus({ days: lunarCycle });
    }
    return phases;
}

function generateICS(phases) {
    let events = phases.map((p, i) => {
        return `BEGIN:VEVENT
UID:${i}@morph-lunar
DTSTAMP:${DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'")}
DTSTART;VALUE=DATE:${p.date.replace(/-/g, '')}
SUMMARY:${p.type}
DESCRIPTION:${p.note}
END:VEVENT`;
    }).join("\n");

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Morph Lunar Calendar//EN
${events}
END:VCALENDAR`;
}

// ===== MAIN =====
let allPhases = [];
for (let y = today.year; y < today.year + yearsToGenerate; y++) {
    allPhases = allPhases.concat(getMoonPhases(y));
}

let icsData = generateICS(allPhases);

if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
}

fs.writeFileSync("public/morph-lunar.ics", icsData);

console.log("✅ Morph Lunar Calendar generated successfully!");
