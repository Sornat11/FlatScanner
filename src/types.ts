export interface Offer {
    id: string;
    title: string;
    url: string;
    price: string;
    imageUrl?: string;
    source: 'OLX' | 'Otodom';
}
