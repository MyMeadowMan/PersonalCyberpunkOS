# Personal System — Night City Interface

A mobile-first personal workspace with a Cyberpunk 2077-inspired HUD aesthetic. It is deliberately a personal tool, not a commercial product. The visual language is an original implementation inspired by the game's high-contrast yellow interface; no game assets, logos, fonts, or sounds are bundled. This is an unofficial fan-inspired interface and is not affiliated with or endorsed by CD PROJEKT RED.

## What's included

- **Overview:** daily directive, quick stats, active objectives, upcoming events, recent transmissions, daily log, and a rotating archive reminder.
- **Mission Control:** main quests, side quests, everyday tasks, priorities, due dates, pause/resume, and completion.
- **Archive:** searchable notes and research entries with categories and tags.
- **Creator Studio:** idea → drafting → editing → published pipeline, with script and production-note fields.
- **Media Library:** anime, manga, film, books, games, and personal notes/progress.
- **Exploration:** saved places, regions, notes, and map links.
- **Calendar:** monthly view and editable upcoming events.
- **Character:** skill levels and daily routines/check-ins.
- **Transmissions:** quick capture inbox for thoughts, links, and reminders.
- **Settings:** accent profiles, optional tiny interface sounds, compact mode, JSON backup/restore, and reset.
- **Global search:** click Search or press `Ctrl+K` / `⌘K`.
- **Installable PWA:** app manifest, icons, and an offline app-shell cache.

## Privacy model — read this before publishing

The **website and repository can be public**, but your entries are stored in `localStorage` in the browser profile on the device where you use the app. There is no server, account, analytics, tracking, cloud sync, or remote database in this project. Other visitors to the public website do not receive your local entries.

This also means:

- Data does **not** automatically sync between your iPhone and computer.
- Export a JSON backup in **System Settings → Export Full Backup** before clearing browser data, switching devices, or reinstalling the app.
- Import that JSON backup on the other device to move your workspace.
- Anyone with access to the same unlocked browser profile can open the app and see its local entries. This is local storage, **not encrypted storage**; do not put passwords, financial account details, or other secrets in it.
- Browser storage can be cleared by the browser or the user. Keep backups somewhere you control.

## Publish with a new public GitHub repository

1. Create a new repository on GitHub. Set it to **Public** (as requested). A simple repository name is `personal-system` or anything you like.
2. Upload the contents of this folder to the repository root. Keep the `.github/workflows/pages.yml` file and its folder structure.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Push to the `main` branch (or run the workflow manually from **Actions**). The included workflow will publish the static app to GitHub Pages.
5. Open the Pages URL on your iPhone in Safari. Tap **Share → Add to Home Screen** to install it like an app.

The Pages site is public. The data saved in the app is local to each browser/device and is not committed to GitHub.

## Run locally

This is a static app. You can open `index.html` directly for a quick preview. For full PWA/service-worker behavior, serve the folder over localhost, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Updating the app

Replace or edit the files in the repository and push to `main`. Your local workspace data remains in that browser's local storage as long as the storage key is not changed and the browser data is not cleared. Export a JSON backup before major changes.

## Technical notes

- Vanilla HTML, CSS, and JavaScript; no build step or external runtime dependencies.
- Designed mobile-first with an iPhone bottom navigation bar and a wider desktop navigation rail.
- Local persistence key: `nightcity_personal_os_v1`.
- Offline caching is provided by `service-worker.js` after the first successful visit.
