# kport-anno

This project is a Vite-based Korean portrait annotation viewer and editor with Supabase integration.

## GitHub Codespaces

1. Open this repository in **GitHub Codespaces**. The dev container installs Node.js 18 and automatically runs `npm install`.
2. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_KEY=your-anon-key
   ```

After the container starts, run `npm run dev` to launch the Vite dev server. The
app will be available on port **5173**.

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

## Using the Annotation Editor

1. Click **Start Polygon** and click on the image to place vertices.
2. Double click to finish the polygon and create a pending annotation.
3. Select the pending polygon and click **Add Annotation** to enter metadata.
4. Use **Edit Selected** to change metadata of an existing annotation.
5. Use **Edit Polygon** to adjust vertices or **Delete Selected** to remove.
6. Click **Download JSON** to export all annotations.

## Build & Preview

```bash
npm run build
npm run preview
```

The project is configured to deploy the built `dist/` folder to the `gh-pages` branch using GitHub Actions.


