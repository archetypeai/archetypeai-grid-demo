# Newton Grid Monitor

Real-time California power grid dashboard powered by [Newton](https://www.archetypeai.dev/) and [CAISO](https://www.caiso.com/) (California Independent System Operator).

Visualizes the California electricity grid's supply mix and demand in real-time with 5-minute resolution. Newton analyzes grid conditions, renewable performance, duck curve patterns, and battery dispatch.

## Features

- **Supply mix stacked area chart** — Solar, Wind, Natural Gas, Hydro, Nuclear, Batteries, Imports stacked over 24h
- **Demand line chart** — current demand vs day-ahead and hour-ahead forecasts
- **Stats bar** — live demand, peak, solar/wind output, renewable percentage
- **Newton chat** — ask about duck curve, battery strategy, grid stress, renewable performance
- **Quick prompts** — Duck Curve, Batteries, Summary one-click analysis
- **Expandable charts** — fullscreen any chart for detailed viewing
- **Auto-refresh** — data updates every 5 minutes matching CAISO cadence

## Stack

- **SvelteKit** with Svelte 5 runes
- **Archetype AI Design System** — semantic tokens, component primitives, composite patterns
- **Newton API** — Direct Query endpoint (`/v0.5/query`) for text reasoning with the C 2.6 fusion model (`Newton::c2_6_8b_fp8_260424d7a55d5e`), per the [`atai-newton-fusion-model`](https://github.com/archetypeai/agent-skills/tree/main/skills/atai-newton-fusion-model) skill
- **CAISO Today's Outlook** — public CSV feeds for demand and supply (5-min intervals)
- **Tailwind v4** — styling with semantic design tokens

## Setup

```bash
npm install
```

Create a `.env` file:

```
ATAI_API_KEY=your_api_key_here
ATAI_API_ENDPOINT=https://api.u1.archetypeai.app/
```

## Development

```bash
npm run dev
```

Open `http://localhost:5173`. Grid data loads automatically. Use the chat to ask Newton questions.

## Data Sources

| Endpoint | Data | Update Frequency |
|----------|------|-----------------|
| `caiso.com/outlook/history/{YYYYMMDD}/demand.csv` | Demand forecasts + actuals | 5 min |
| `caiso.com/outlook/history/{YYYYMMDD}/fuelsource.csv` | Generation by fuel source | 5 min |

## How It Works

1. Server fetches today's demand and supply CSVs from CAISO (288 rows/day at 5-min intervals)
2. Supply chart renders a stacked area showing the generation mix — solar dominates midday, gas ramps for evening
3. Demand chart overlays actual demand against day-ahead and hour-ahead forecasts
4. Chat sends recent grid data (last hour of demand + supply) as context to Newton's `/v0.5/query` endpoint
5. Newton reasons about grid conditions: duck curve timing, renewable curtailment, battery dispatch, peak stress

## Example Questions for Newton

- "Explain today's duck curve — when does solar peak and what happens at sunset?"
- "How are batteries being used today? When do they charge vs discharge?"
- "Is current demand higher or lower than the day-ahead forecast? Why might that be?"
- "What percentage of generation is from renewables right now?"
- "Are there signs of grid stress or tight supply conditions?"
