import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'seen_offers.json');

export class Storage {
    private seenIds: Set<string>;

    constructor() {
        this.seenIds = new Set<string>();
        this.load();
    }

    private load() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (fs.existsSync(FILE_PATH)) {
            try {
                const data = fs.readFileSync(FILE_PATH, 'utf-8');
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    this.seenIds = new Set(parsed);
                }
            } catch (error) {
                console.error('Błąd odczytu pliku seen_offers.json:', error);
            }
        }
    }

    public isSeen(id: string): boolean {
        return this.seenIds.has(id);
    }

    public markSeen(id: string) {
        this.seenIds.add(id);
    }

    public save() {
        try {
            fs.writeFileSync(FILE_PATH, JSON.stringify(Array.from(this.seenIds), null, 2));
        } catch (error) {
            console.error('Błąd zapisu pliku seen_offers.json:', error);
        }
    }
}
