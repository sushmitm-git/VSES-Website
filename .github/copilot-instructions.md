---
title: Guidance for AI Coding Agents
description: Project-specific conventions, workflows, and patterns for VSES-Website
---

# VSES-Website – AI Agent Instructions

Focus on practical, project-specific guidance for this static website and its asset pipeline.

## Overview
- Static site with primary entry `index.html` and supporting pages (`prospectus.html`, `preview/index.html`, `index_old.html`).
- Styling via Tailwind CDN; no local build step for CSS.
- Photo assets live under `assets/photos/` organized into buckets: `gallery/`, `departments/`, `staff/`, `media/`.
- A Node script generates `assets/photos/manifest.json` for galleries and captioned lists; HTML consumes that manifest on the client.

## Developer Workflow
- Install Node.js (project uses ESM: `"type": "module"`).
- Generate image manifest after adding or renaming photos:
  - `npm run gen:photos`
  - Output: `assets/photos/manifest.json` with structure:
    - `gallery`: array of image paths (e.g., `"gallery/event-1.jpg"`).
    - `media`: array of image paths.
    - `departments`: array of objects `{ src, caption }`.
    - `staff`: array of objects `{ src, caption }`.
- Local preview: open `preview/index.html` or `index.html` in a browser. If using a local server, any static server works (no bundling required).

## Asset and Naming Conventions
- Supported image extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`.
- Kebab-case filenames enforced by the manifest generator:
  - Converts names to lowercase, replaces non-alphanumeric with `-`, collapses repeats, and trims edges.
  - If missing or unsupported extension, coerces to `.jpg`.
  - Respects dotfiles (e.g., `.keep`) and only renames regular files.
- Place photos under the correct bucket:
  - `assets/photos/gallery/` and `assets/photos/media/` → plain arrays in manifest.
  - `assets/photos/departments/` and `assets/photos/staff/` → objects with auto-generated `caption` from filename.

## Frontend Patterns
- Language toggling via `data-i18n` attributes and `#lang-selector`. Body classes `lang-hi`/`lang-mr` switch to Devanagari fonts.
- Accordion sections use `toggleAccordion(id)` and `.accordion-content.open`; ensure new sections follow the existing button/content structure.
- Random gallery expects `assets/photos/manifest.json` and injects items from `gallery`; keep manifest paths relative to `assets/photos/`.
- Fallback images use `onerror` with `placehold.co`; maintain this pattern when adding new image tags.

## File Structure Highlights
- `index.html`: main page, Tailwind CDN, i18n hooks, gallery, leadership cards, accordions.
- `prospectus.html`: supporting page (keep styling consistent with `index.html`).
- `assets/photos/manifest.json`: generated; do not hand-edit, regenerate via script.
- `scripts/generate-manifest.mjs`: source of truth for asset scanning, renaming, and manifest shape.
- `package.json`: defines `gen:photos` script; project is ESM.

## Common Tasks (Examples)
- Add staff photo:
  - Save `assets/photos/staff/dr-sapate.jpeg` → run `npm run gen:photos` → HTML can reference via manifest `staff[i].src` and `staff[i].caption`.
- Add gallery images:
  - Drop files into `assets/photos/gallery/` → run generator → frontend random gallery picks them up.
- Fix bad filenames:
  - Place `IMG_0001.JPG` in any bucket → generator renames to `img-0001.jpg` automatically.

## Gotchas
- Do not edit `manifest.json` manually; changes will be overwritten.
- Generator will rename files in-place; avoid relying on original filenames post-run.
- Ensure `assets/college-building.jpg` exists or keep the `onerror` placeholder for the hero image.
- Keep image paths web-safe (no backslashes); the script normalizes to forward slashes in manifest.

## PR Hygiene
- Commit both new/renamed files and updated `assets/photos/manifest.json` after running the generator.
- For HTML changes, keep accessibility attributes and existing class patterns; match Tailwind utility usage.
