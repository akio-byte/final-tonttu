# TonttuTekijä - Elf Generator

A Next.js kiosk app that transforms users into Finnish elves using Google Gemini AI.

## Setup

1.  Clone repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    - Copy `.env.example` to `.env`
    - Add your `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/)

## Run Locally

```bash
npm run dev
```

## Deploy to Vercel

1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add the `GEMINI_API_KEY` in the Vercel **Settings > Environment Variables** section.
4.  Deploy.
