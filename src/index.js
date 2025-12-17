const { writeFileSync, readFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const electron = require("electron");

const ACCOUNTS_FILE = join(__dirname, "..", "data", "accounts.json");

if (!existsSync(join(__dirname, "..", "data"))) {
    require("node:fs").mkdirSync(join(__dirname, "..", "data"), { recursive: true });
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

function generateRandomString(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateEmailName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomSuffix = generateRandomString(5);
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomSuffix}`;
}

function generatePassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()-_=+';
    
    const getRandomChar = (str) => str.charAt(Math.floor(Math.random() * str.length));
    
    const passwordParts = [
        getRandomChar(lowercase) + getRandomChar(lowercase),
        getRandomChar(uppercase) + getRandomChar(uppercase),
        getRandomChar(numbers) + getRandomChar(numbers),
        getRandomChar(symbols) + getRandomChar(symbols)
    ];
    
    return passwordParts
        .sort(() => Math.random() - 0.5)
        .join('')
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

function saveAccount(email, password, firstName, lastName) {
    const currentData = JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8'));
    currentData.push({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        createdAt: new Date().toISOString()
    });
    writeFileSync(ACCOUNTS_FILE, JSON.stringify(currentData, null, 2));
    console.log(`Account saved: ${email}`);
}

(async () => {
    electron.app.on("ready", async () => {
        const mainWindow = new electron.BrowserWindow({
            width: 1000,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                partition: "persist:main",
            }
        });

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const emailName = `${firstName.toLowerCase()}${lastName.toLowerCase()}${generateRandomString(5)}`;
        const email = `${emailName}@outlook.com`;
        const password = generatePassword();
        
        console.log('\n==============================');
        console.log('ACCOUNT GENERATOR');
        console.log('==============================\n');
        console.log('Generated credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`First Name: ${firstName}`);
        console.log(`Last Name: ${lastName}`);
        console.log('\nBrowser opening...');
        console.log('Create account manually with these credentials.');
        console.log('Account will be saved to data/accounts.json\n');
        
        saveAccount(email, password, firstName, lastName);
        
        mainWindow.loadURL("https://www.xbox.com/en-CA/auth/msa?action=logIn&returnUrl=https%3A%2F%2Fwww.xbox.com%2Fen-CA%2F");
        
        console.log('Press Ctrl+C to exit.');
    });
    
    electron.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electron.app.quit();
        }
    });
})();