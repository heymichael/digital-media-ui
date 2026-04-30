# Digital Media UI

React/Vite frontend for the Haderach Digital Media library.

## Quick Start

### Prerequisites

- Node.js 20+
- The `haderach-home` repo cloned alongside this repo (for `@haderach/shared-ui`)

### Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create `.env` file:**

   ```bash
   cp ../site/.env .env
   ```

3. **Start the dev server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5176/media/`.

4. **Run the backend:**

   In a separate terminal, start the Digital Media API:

   ```bash
   cd ../digital-media
   uvicorn service.app:app --reload --port 8000
   ```

### Building

```bash
npm run build
```

Output goes to `dist/media/`.

## Architecture

See [docs/architecture.md](docs/architecture.md) for component structure and data flow.

## Related

- Backend: [heymichael/digital-media](../digital-media)
- Task: [300 — Digital Media MVP](https://github.com/heymichael/haderach-tasks/blob/main/tasks/features/300-media-app.md)
