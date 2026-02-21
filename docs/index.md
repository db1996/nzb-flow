---
layout: default
title: NZB Flow
description: A GUI application to automate usenet posting using external CLI tools
permalink: /
nav_order: 1
---

# NZB Flow
{: .mb-6 }

![NZB Flow Logo](images/logo-dark.svg){: .mx-auto .d-block .mb-6 }

A powerful GUI application to automate usenet posting. Built with modern web technologies, it orchestrates external CLI tools for the complete posting workflow: rar for compression, parpar for par2 creation, and nyuu for posting.
{: .lead }

## Quick Start
{: .mb-4 }

### Download
[📥 Download Latest Release](https://github.com/db1996/nzb-flow/releases/latest){: .btn .btn-primary .btn-lg .mr-2 }
[📖 View Documentation](profiles.html){: .btn .btn-outline }

### Prerequisites

The application requires access to three external CLI commands:
- **RAR**: Automatically detects WinRAR installation on Windows
- **ParPar & Nyuu**: Built-in installation option through Node.js

### Setup

1. **Configure Servers**: Set up your usenet server settings in the main settings screen
2. **Multiple Servers**: Full support with profile linking
3. **Default Profile**: Comes with sensible defaults for posting
4. **Start Posting**: Simply drag and drop files to begin

📚 [Check out the profile settings docs](profiles.html) for detailed and advanced posting settings.

## Features
{: .mb-5 }

### 🎯 Core Functionality
- **Easy drag and drop interface**
- **Smart queue system**: Separate queues for compression/par2 creation and uploading
- **Profile-based settings** for different posting scenarios
- **Folder monitoring** with profile assignment
- **Approval system** for upload tasks (optional)

### 🔐 Security & Obfuscation
- **Complete obfuscation capabilities**:
  - Random file names
  - Random archive passwords with encrypted headers
  - Subject obfuscation
  - YENC name obfuscation
  - Filename metadata obfuscation
  - Fully customizable nyuu templates

### ⚙️ Advanced Options
- **RAR Configuration**:
  - Preserve folder structure
  - Custom volume sizes
  - Solid archive support
  - File exclusion patterns
  - Option to disable RAR completely
- **ParPar Options**: Advanced redundancy and slice settings
- **Nyuu Customization**: Post checks, retry attempts, and comprehensive CLI options
- **Custom CLI Arguments** for all external tools

### 🌐 Automation & Integration
- **Optional API server** for remote control
- **WebSocket server** for real-time updates
- **Automatic updates** (configurable)
- **Automatic file generation** (.txt, .nfo, etc.) per post

## Documentation
{: .mb-5 }

| Topic                                           | Description                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| [📁 Profile Settings](profiles.html)             | Comprehensive guide to posting profiles and all available options |
| [📅 Queue System](Queues.html)                   | Details about the dual-queue architecture and settings            |
| [🌐 API Server](API%20server.html)               | Remote control API with Postman collection                        |
| [🔌 WebSocket Server](Websocket%20server.html)   | Real-time event system documentation                              |
| [📝 Content Templates](Content%20Templates.html) | File generation and templating system                             |
{: .table .table-hover }

## Configuration
{: .mb-4 }

### Replace Existing Files
{: .mb-3 }

Under **General Settings**, the "Replace existing files" option controls conflict resolution:

- **✅ Enabled**: Deletes existing files (rar/par folders, NZB files) before starting new jobs
- **❌ Disabled**: Automatically renames tasks (e.g., "post-name-1", "post-name-2") to avoid conflicts

> ⚠️ **Note**: Disabling this option will also alter the post name to match the renamed task.
{: .alert .alert-warning }

## External Tool Documentation
{: .mb-4 }

| Tool           | Documentation Link                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------- |
| **RAR CLI**    | [Complete Command Reference](https://gist.github.com/YenForYang/5953ad8355cf32188aa75c0139cc9261) |
| **ParPar CLI** | [Full Help Documentation](https://github.com/animetosho/ParPar/blob/master/help-full.txt)         |
| **Nyuu CLI**   | [Complete Usage Guide](https://github.com/animetosho/Nyuu/blob/master/help-full.txt)              |
{: .table }


## Troubleshooting
{: .mb-4 }

### Common Issues

#### Special Characters in Post Names
{: .text-red-200 }

> ⚠️ **Important**: Avoid special characters in post names as they can cause file creation errors.
{: .alert .alert-danger }

Use only alphanumeric characters, spaces, hyphens, and underscores for reliable operation.

---

## Development
{: .mb-5 }

### Project Status

NZB Flow is an active passion project focused on providing a robust usenet posting solution. While built on Electron (for UI familiarity), all core operations use native CLI executables for optimal performance.

**Current Focus Areas:**
- Performance testing and optimization
- UI/UX improvements for better table layouts
- Enhanced mobile responsiveness

**Planned Features:**
- 🔄 **Backup server support** per profile with automatic failover
- 🎨 **Visual improvements** for better wide-screen layouts
- 📦 More compression format support

💬 [**Suggest Features**](https://github.com/db1996/nzb-flow/issues): Have ideas? Open an issue on GitHub!

### Build From Source
{: .mb-4 }

**Prerequisites:** Node.js and pnpm

#### Install Dependencies
```bash
pnpm install
```

#### Build for Production
```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

#### Development Mode
```bash
pnpm dev
```

---

**Repository:** [github.com/db1996/nzb-flow](https://github.com/db1996/nzb-flow)
**License:** [View License](https://github.com/db1996/nzb-flow/blob/main/LICENSE)
