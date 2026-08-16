import { Page } from 'playwright';
import { Offer } from '../types';
import crypto from 'crypto';

const OLX_URL = 'https://www.olx.pl/nieruchomosci/mieszkania/wynajem/krakow/?search%5Bfilter_float_price%3Ato%5D=2500&search%5Bfilter_enum_rooms%5D%5B0%5D=two';

export async function scrapeOLX(page: Page): Promise<Offer[]> {
    console.log('[OLX] Zaczynam scrapowanie...');
    await page.goto(OLX_URL, { waitUntil: 'domcontentloaded' });
    
    try {
        const acceptBtn = page.locator('#onetrust-accept-btn-handler');
        if (await acceptBtn.isVisible({ timeout: 5000 })) {
            await acceptBtn.click();
        }
    } catch (e) {}

    const offers: Offer[] = [];
    
    const cards = page.locator('[data-testid="l-card"]');
    await cards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    
    const count = await cards.count();
    
    for (let i = 0; i < count; i++) {
        try {
            const card = cards.nth(i);
            const title = await card.locator('h6').first().innerText();
            const price = await card.locator('[data-testid="ad-price"]').first().innerText();
            let url = await card.locator('a').first().getAttribute('href') || '';
            
            if (url.startsWith('/')) {
                url = `https://www.olx.pl${url}`;
            }

            const idHash = crypto.createHash('md5').update(url.split('#')[0]).digest('hex');
            const id = `OLX-${idHash}`;

            const imgUrl = await card.locator('img').first().getAttribute('src').catch(() => null);

            offers.push({
                id,
                title: title.trim(),
                url,
                price: price.trim(),
                imageUrl: imgUrl || undefined,
                source: 'OLX'
            });
        } catch (e) {
            // Ignorowanie pojedynczych kart
        }
    }

    console.log(`[OLX] Pobrano ${offers.length} ofert.`);
    return offers;
}
