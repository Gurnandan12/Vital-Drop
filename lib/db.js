import fs from 'fs';
import path from 'path';
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'users.json');
// Initialize database safely
const initDB = () => {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
};
export const getDB = () => {
    initDB();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
};
export const saveDB = (data) => {
    initDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};
export const findUserByEmail = (email) => {
    const users = getDB();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};
export const findUserById = (id) => {
    const users = getDB();
    return users.find(u => u.id === id);
};
export const updateUser = (id, updates) => {
    const users = getDB();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
        const existing = users[idx];
        // Safely append simulations if provided
        let newSimulations = existing.simulations || [];
        if (updates.simulations && Array.isArray(updates.simulations)) {
            newSimulations = [...newSimulations, ...updates.simulations];
        }
        users[idx] = {
            ...existing,
            ...updates,
            simulations: newSimulations
        };
        saveDB(users);
        return users[idx];
    }
    return null;
};
