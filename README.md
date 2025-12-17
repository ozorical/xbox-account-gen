# Xbox Account Generator

A Node.js/Electron application that generates random Xbox/Microsoft accounts.

## Features
- Generates random email addresses (firstname + lastname + random string + @outlook.com)
- Creates strong passwords with mixed characters
- Provides random first and last names for profile creation
- Saves generated accounts to JSON format
- Opens browser to Xbox signup page for manual account creation

## Usage
1. Run the application
2. Copy the generated credentials from console
3. Manually create account in the opened browser
4. Accounts are automatically saved to `data/accounts.json`

## Installation
```bash
npm install
npm run start