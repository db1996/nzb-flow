# NZB Flow Documentation

This directory contains the documentation for NZB Flow, configured for GitHub Pages with Jekyll.

## Local Development

To run the documentation site locally:

1. **Install Dependencies**
   ```bash
   bundle install
   ```

2. **Serve Locally**
   ```bash
   bundle exec jekyll serve
   ```

3. **View Documentation**
   Open [http://localhost:4000](http://localhost:4000)

## GitHub Pages Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch. The site will be available at:

`https://[username].github.io/nzb-flow/`

## Theme

Uses the [Just the Docs](https://just-the-docs.github.io/just-the-docs/) theme for clean, searchable documentation.

## File Structure

- `index.md` - Main landing page
- `profiles.md` - Profile settings documentation
- `Queues.md` - Queue system documentation
- `API server.md` - API documentation
- `Websocket server.md` - WebSocket documentation
- `Content Templates.md` - Template system documentation
- `Content Templates Variables.md` - Template variables reference
- `examples/` - Example templates and code
- `_config.yml` - Jekyll configuration
- `images/` - Documentation assets

## Features

- 📱 **Responsive Design**: Mobile-friendly documentation
- 🔍 **Search**: Full-text search across all pages
- 📑 **Navigation**: Hierarchical page structure
- 👨‍💻 **Code Highlighting**: Syntax highlighting for code blocks
- 📖 **Table of Contents**: Auto-generated TOCs for long pages
