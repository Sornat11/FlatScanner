import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { Storage } from './storage';
import { Notifier } from './notifier';
import { scrapeOLX } from './scrapers/olx';
import { scrapeOtodom } from './scrapers/otodom';

// Wczytanie zmiennych środowiskowych z pliku .env
dotenv.config();

async function main() {
    console.log('Uruchamianie bota FlatScanner...');

    let notifier: Notifier;
    try {
        notifier = new Notifier();
    } catch (e: any) {
        console.error('Błąd konfiguracji Discorda:', e.message);
        console.log('Zakończono działanie - brak poprawnej konfiguracji w .env');
        process.exit(1);
    }

    const storage = new Storage();

    console.log('Uruchamianie przeglądarki...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        locale: 'pl-PL'
    });

    try {
        const page = await context.newPage();

        // 1. Scrapowanie
        const olxOffers = await scrapeOLX(page);
        const otodomOffers = await scrapeOtodom(page);

        const allOffers = [...olxOffers, ...otodomOffers];
        let newOffersCount = 0;

        console.log(`Pobrano łącznie ${allOffers.length} ofert. Sprawdzam, czy są nowe...`);

        // 2. Weryfikacja i powiadamianie
        for (const offer of allOffers) {
            if (!storage.isSeen(offer.id)) {
                console.log(`Nowa oferta! [${offer.source}] ${offer.title}`);
                await notifier.sendOffer(offer);
                storage.markSeen(offer.id);
                newOffersCount++;
                
                // Opóźnienie aby nie przekroczyć Rate Limitu API Telegrama
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (newOffersCount === 0) {
            console.log('Brak nowych ofert od ostatniego sprawdzenia.');
        } else {
            console.log(`Znaleziono ${newOffersCount} nowych ofert. Zapisywanie stanu do bazy...`);
            storage.save();
        }
        
    } catch (error) {
        console.error('Wystąpił błąd podczas działania scrapera:', error);
    } finally {
        await browser.close();
        console.log('Przeglądarka zamknięta. Koniec przebiegu bota.');
    }
}

main();
