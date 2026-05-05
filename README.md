# Wanna Track

Personal expense tracking system with AI-powered receipt analysis via Telegram bot. In personal use for 2+ years.

## How it works

1. Send a receipt photo or text to the Telegram bot
2. The bot runs OCR + LLM analysis to extract merchant, amount, currency, and date
3. Select a category and account from inline buttons in the chat
4. The expense is saved to the web app automatically

## System architecture

The project consists of three services:

| Service | Stack | Description |
|---------|-------|-------------|
| [wanna-track](https://github.com/shataev/wanna-track) | Vue 3, Vite, Vuetify 3 | Web app for expense management |
| [wannatrack-receipt-api](https://github.com/shataev/wannatrack-receipt-api) | NestJS, TypeScript, Telegraf | Telegram bot + REST API |
| [wannatrack-ai-analyzer](https://github.com/shataev/wannatrack-ai-analyzer) | FastAPI, Python | OCR + LLM receipt parsing microservice |

## Features

- Send receipt photo or text to Telegram — amount, merchant, and date extracted automatically
- Manage multiple accounts/funds with balances
- Organize expenses by categories
- Spending charts and history
- User authentication with Telegram account binding

## Tech stack (this repo)

- **Vue 3** + Vite
- **Vuetify 3** — UI components
- **Pinia** — state management
- **Vue Router** — routing
- **Chart.js** — spending visualization
- **VeeValidate** — form validation

## Setup

```sh
npm install
npm run dev
```

For the full system, also run:
- [wannatrack-receipt-api](https://github.com/shataev/wannatrack-receipt-api) — Telegram bot and API
- [wannatrack-ai-analyzer](https://github.com/shataev/wannatrack-ai-analyzer) — AI receipt analysis service

## Project structure

```
src/
├── api/          # API layer
├── components/   # Reusable UI components
├── composables/  # Vue composables
├── layouts/      # Page layouts
├── pages/        # Page components
├── router/       # Vue Router config
├── stores/       # Pinia stores
└── utils/        # Utilities
```
