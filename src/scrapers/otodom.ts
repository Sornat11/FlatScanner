import { Page } from 'playwright';
import { Offer } from '../types';
import crypto from 'crypto';

const OTODOM_URL = 'https://www.otodom.pl/pl/wyniki/wynajem/mieszkanie/malopolskie/krakow/krakow/krakow?priceMax=2500&roomsNumber=%5BTWO%5D&viewType=listing';

export async function scrapeOtodom(page: Page): Promise<Offer[]> {
    console.log('[Otodom] Zaczynam scrapowanie...');
    await page.goto(OTODOM_URL, { waitUntil: 'domcontentloaded' });
    
    try {
        const acceptBtn = page.locator('#onetrust-accept-btn-handler');
        if (await acceptBtn.isVisible({ timeout: 5000 })) {
            await acceptBtn.click();
        }
    } catch (e) {}

    const offers: Offer[] = [];
    
    const cards = page.locator('[data-cy="listing-item"]');
    await cards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    
    const count = await cards.count();
    
    for (let i = 0; i < count; i++) {
        try {
            const card = cards.nth(i);
            const title = await card.locator('[data-cy="listing-item-title"]').first().innerText();
            
            // Szukamy elementu z ceną
            const price = await card.locator('span:has-text("zł")').first().innerText().catch(() => 'Brak ceny');
            
            let url = await card.locator('a[data-cy="listing-item-link"]').first().getAttribute('href') || '';
            
            if (url.startsWith('/')) {
                url = `https://www.otodom.pl${url}`;
            }

            const idHash = crypto.createHash('md5').update(url.split('#')[0]).digest('hex');
            const id = `OTODOM-${idHash}`;

            const imgUrl = await card.locator('picture img').first().getAttribute('src').catch(() => null);

            offers.push({
                id,
                title: title.trim(),
                url,
                price: price.trim(),
                imageUrl: imgUrl || undefined,
                source: 'Otodom'
            });
        } catch (e) {
            // Ignorowanie pojedynczych błędów
        }
    }

    console.log(`[Otodom] Pobrano ${offers.length} ofert.`);
    return offers;
}
