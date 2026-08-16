import { Page } from 'playwright';
import { Offer } from '../types';
import crypto from 'crypto';

const OLX_URL = 'https://www.olx.pl/nieruchomosci/mieszkania/wynajem/krakow/?search%5Bfilter_float_price%3Ato%5D=2500&search%5Bfilter_enum_rooms%5D%5B0%5D=two';

export async function scrapeOLX(page: Page): Promise<Offer[]> {
    console.log('[OLX] Zaczynam scrapowanie...');
    await page.goto(OLX_URL, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    
    // Czekamy chwilę na ułożenie elementów by upewnić się, że React załadował kafelki
    await page.waitForTimeout(2000);
    
    const offers = await page.$$eval('[data-testid="l-card"]', (cards) => {
        return cards.map(card => {
            const titleEl = card.querySelector('[data-testid="ad-card-title"], h6');
            const priceEl = card.querySelector('[data-testid="ad-price"]');
            const linkEl = card.querySelector('a');
            const imgEl = card.querySelector('img');

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
            url = `https://www.olx.pl${url}`;
        }

        const idHash = crypto.createHash('md5').update(url.split('#')[0]).digest('hex');
        
        results.push({
            id: `OLX-${idHash}`,
            title: offer.title.trim(),
            url: url,
            price: offer.price ? offer.price.trim() : 'Brak',
            imageUrl: offer.imageUrl || undefined,
            source: 'OLX'
        });
    }

    console.log(`[OLX] Pobrano ${results.length} ofert.`);
    return results;
}
