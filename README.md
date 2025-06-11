# kport-anno

This project is a Vite-based Korean portrait annotation viewer and editor with Supabase integration.

## GitHub Codespaces

1. Open this repository in **GitHub Codespaces**. The dev container installs Node.js 18 and automatically runs `npm install`.
2. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_KEY=your-anon-key
   ```

## Development

Run the dev server:

```bash
npm run dev
```

The app will be available on port **5173**.

## Features

- Canvas based polygon annotation interface
- Create, edit, and delete annotations
- Filter annotations by author and object
- Download annotations as JSON
- Data loaded from and saved to the Supabase `annotations` table

## Build & Preview

```bash
npm run build
npm run preview
```

The project is configured to deploy the built `dist/` folder to the `gh-pages` branch using GitHub Actions.
