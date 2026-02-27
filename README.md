# AACM - AA Content Machine

The Bar Raiser content review tool for Agile Academy. Paste your draft, select the content type, and get rigorous editorial feedback before it reaches the founder.

## Prerequisites

- **Node.js 18+** (download from https://nodejs.org if you don't have it)
- **Anthropic API key** (get one at https://console.anthropic.com)

## Setup

1. Open your terminal and navigate to this folder:

   ```
   cd path/to/aacm
   ```

2. Copy the example environment file and add your API key:

   ```
   cp .env.example .env.local
   ```

   Open `.env.local` in any text editor and replace `your-key-here` with your actual Anthropic API key.

3. Install dependencies:

   ```
   npm install
   ```

4. Start the application:

   ```
   npm run dev
   ```

5. Open your browser and go to:

   ```
   http://localhost:3000
   ```

## How to Use

1. Select the content type (LinkedIn Post, Website Article, or Whitepaper)
2. Paste your draft into the text area
3. Optionally add context about the piece (target audience, related content, etc.)
4. Click "Run Bar Raiser Review"
5. Read the review, then click "Copy Review" to paste the feedback into your writing tool

## Troubleshooting

- **"API key is not configured"**: Make sure you've created `.env.local` with your key. Restart the server after adding it.
- **App won't start**: Make sure you've run `npm install` first. Check that you have Node.js 18 or newer (`node --version`).
