const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");
const { randomInt } = require("node:crypto");
const electron = require("electron");

const { app, BrowserWindow } = electron;

const DATA_DIR = join(__dirname, "..", "data");
const ACCOUNTS_FILE = join(DATA_DIR, "accounts.json");

if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
}
if (!existsSync(ACCOUNTS_FILE)) {
    writeFileSync(ACCOUNTS_FILE, JSON.stringify([], null, 2));
}

const firstNames = [
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
    "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
    "Alex", "Chris", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Drew"
];

const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Wilson", "Anderson", "Taylor", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia",
    "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott", "Green", "Baker"
];

function pickRandom(arr) {
    return arr[randomInt(0, arr.length)];
}

function generateRandomString(length = 6) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars[randomInt(0, chars.length)];
    }
    return result;
}

function generateEmailName(firstName, lastName) {
    const randomSuffix = generateRandomString(5);
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomSuffix}`;
}

function generatePassword(length = 12) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_=+";
    const all = lowercase + uppercase + numbers + symbols;

    const password = [
        lowercase[randomInt(0, lowercase.length)],
        uppercase[randomInt(0, uppercase.length)],
        numbers[randomInt(0, numbers.length)],
        symbols[randomInt(0, symbols.length)]
    ];

    while (password.length < Math.max(8, length)) {
        password.push(all[randomInt(0, all.length)]);
    }

    for (let i = password.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join("");
}

function readAccountsSafe() {
    try {
        const raw = readFileSync(ACCOUNTS_FILE, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveAccount({ email, password, firstName, lastName }) {
    const currentData = readAccountsSafe();
    currentData.push({
        email,
        password,
        firstName,
        lastName,
        createdAt: new Date().toISOString()
    });
    writeFileSync(ACCOUNTS_FILE, JSON.stringify(currentData, null, 2));
    console.log(`Account saved: ${email}`);
}

function generateIdentity() {
    const firstName = pickRandom(firstNames);
    const lastName = pickRandom(lastNames);
    const emailName = generateEmailName(firstName, lastName);
    const email = `${emailName}@outlook.com`;
    const password = generatePassword();
    return { email, password, firstName, lastName };
}

(async () => {
    app.whenReady().then(async () => {
        const mainWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                partition: "persist:main"
            }
        });

        const identity = generateIdentity();

        console.log("\n==============================");
        console.log("ACCOUNT GENERATOR");
        console.log("==============================\n");
        console.log("Generated credentials:");
        console.log(`Email: ${identity.email}`);
        console.log(`Password: ${identity.password}`);
        console.log(`First Name: ${identity.firstName}`);
        console.log(`Last Name: ${identity.lastName}`);
        console.log("\nBrowser opening...");
        console.log("Create account manually with these credentials.");
        console.log("Account will be saved to data/accounts.json\n");

        saveAccount(identity);

        await mainWindow.loadURL("https://www.xbox.com/en-CA/auth/msa?action=logIn&returnUrl=https%3A%2F%2Fwww.xbox.com%2Fen-CA%2F");

        console.log("Press Ctrl+C to exit.");
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            app.emit("ready");
        }
    });

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
})();
