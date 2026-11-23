# FlatScanner

Automated scanner for real estate listings from **OLX** and **Otodom** with instant Discord notifications.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-5865F2?style=flat-square&logo=discord&logoColor=white)

---

## Features

- **Automated Scraping**: Periodically extracts latest flat listings from OLX and Otodom using Playwright.
- **Deduplication**: Tracks seen offer IDs in local JSON storage (`data/seen_offers.json`) to prevent duplicate alerts.
- **Discord Notifications**: Sends formatted embeds with price, thumbnail, title, and direct link.
- **Modular Scrapers**: Separate scraper implementations for each portal, easily extensible to new sources.

---

## Architecture

```text
src/
├── scrapers/          # Scraper implementations per portal
│   ├── olx.ts         # OLX listing parser
│   └── otodom.ts      # Otodom listing parser
├── notifier.ts        # Discord webhook dispatch
├── storage.ts         # Local persistence & duplicate filtering
├── types.ts           # Shared data interfaces
└── index.ts           # Runner and orchestration
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Discord Webhook URL

### Installation

```bash
git clone https://github.com/Sornat11/FlatScanner.git
cd FlatScanner
npm install
npx playwright install chromium
```

### Configuration

Create a `.env` file in the project root:

```env
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"
```

### Running

```bash
npm start
```

---

## Tech Stack

- **Runtime & Language:** Node.js, TypeScript (`tsx`)
- **Web Automation:** Playwright (Chromium)
- **Integration:** Discord Webhook API
