import { Offer } from './types';

export class Notifier {
    private webhookUrl: string;

    constructor() {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            throw new Error('Brak zmiennej DISCORD_WEBHOOK_URL w środowisku (plik .env)');
        }

        this.webhookUrl = webhookUrl;
    }

    public async sendOffer(offer: Offer) {
        // Kolory nawiązujące do portali (OLX = ciemny cyjan, Otodom = jasny zielony)
        const color = offer.source === 'OLX' ? 0x002f34 : 0x00c5a0;

        const embed = {
            title: `🏠 Nowa oferta na ${offer.source}!`,
            url: offer.url,
            color: color,
            fields: [
                {
                    name: 'Tytuł',
                    value: offer.title,
                    inline: false
                },
                {
                    name: 'Cena',
                    value: offer.price,
                    inline: true
                }
            ],
            image: offer.imageUrl ? { url: offer.imageUrl } : undefined
        };

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [embed]
                })
            });

            if (!response.ok) {
                console.error(`[Discord] Otrzymano status ${response.status} z API Discorda.`);
            } else {
                console.log(`[Discord] Wysłano powiadomienie o ofercie: ${offer.id}`);
            }
        } catch (error) {
            console.error(`[Discord] Błąd podczas wysyłania oferty ${offer.id}:`, error);
        }
    }
}
