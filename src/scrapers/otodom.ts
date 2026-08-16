import { Page } from 'playwright';
import { Offer } from '../types';
import crypto from 'crypto';

const OTODOM_URL = 'https://www.otodom.pl/pl/wyniki/wynajem/mieszkanie/malopolskie/krakow/krakow/krakow?priceMax=2500&roomsNumber=%5BTWO%5D&viewType=listing';

export async function scrapeOtodom(page: Page): Promise<Offer[]> {
    console.log('[Otodom] Zaczynam scrapowanie...');
    await page.goto(OTODOM_URL, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    
    await page.waitForTimeout(2000);

    const offers = await page.$$eval('[data-cy="listing-item"]', (cards) => {
        return cards.map(card => {
            const titleEl = card.querySelector('[data-cy="listing-item-title"]');
            
            // Szukamy spana z "zł"
            const spans = Array.from(card.querySelectorAll('span'));
            const priceEl = spans.find(s => s.textContent && s.textContent.includes('zł'));
            
            const linkEl = card.querySelector('a[data-cy="listing-item-link"]');
            const imgEl = card.querySelector('picture img');

            return {
                title: titleEl ? titleEl.textContent : '',
                price: priceEl ? priceEl.textContent : 'Brak ceny',
                url: linkEl ? linkEl.getAttribute('href') : '',
                imageUrl: imgEl ? imgEl.getAttribute('src') : null
            };
        });
    });

    const results: Offer[] = [];
    for (const offer of offers) {
        let url = offer.url || '';
        if (!url || !offer.title) continue;

        if (url.startsWith('/')) {
            url = `https://www.otodom.pl${url}`;
        }

        const idHash = crypto.createHash('md5').update(url.split('#')[0]).digest('hex');
        
        results.push({
            id: `OTODOM-${idHash}`,
            title: offer.title.trim(),
            url: url,
            price: offer.price ? offer.price.trim() : 'Brak',
            imageUrl: offer.imageUrl || undefined,
            source: 'Otodom'
        });
    }

    console.log(`[Otodom] Pobrano ${results.length} ofert.`);
    return results;
}
