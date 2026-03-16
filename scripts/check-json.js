const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'data', '2026.json');

if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log("Checking 2026.json structure...");
    const months = data.months;
    if (months) {
        const firstMonthId = Object.keys(months)[0];
        const m = months[firstMonthId];
        console.log(`Month ${firstMonthId} keys:`, Object.keys(m));
        console.log(`Income sub-keys:`, Object.keys(m.income));
        console.log(`Expenses sub-keys:`, Object.keys(m.expenses));
        console.log(`Goals array exist:`, Array.isArray(m.goals));
    }
} else {
    console.log("2026.json does not exist yet.");
}
