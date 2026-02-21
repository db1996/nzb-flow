---
layout: default
title: Template Variables
description: Complete reference for content template variables and helpers
nav_order: 7
parent: Content Templates
---

# Content Template Variables & Helpers
{: .mb-6 }

Comprehensive reference for all built-in variables, custom helpers, and template syntax available in NZB Flow content templates.
{: .lead }

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Handlebars Template Engine
{: .mb-5 }

Content templates use the **Handlebars** template language (also known as "mustache") for dynamic content generation.

### Basic Syntax
{: .mb-3 }

| Syntax              | Purpose               | Example                           |
| ------------------- | --------------------- | --------------------------------- |
| `{{variable}}`      | Insert variable value | `{{jobname}}`                     |
| `{{helper value}}`  | Apply helper function | `{{sizeHuman raw_size}}`          |
| `{{#if condition}}` | Conditional blocks    | `{{#if rar_files}}...{{/if}}`     |
| `{{#each array}}`   | Loop over arrays      | `{{#each raw_files}}...{{/each}}` |
{: .table }

### Built-in Handlebars Helpers
{: .mb-3 }

All standard Handlebars helpers are available for advanced templating:

📚 [**Complete Handlebars Documentation**](https://handlebarsjs.com/guide/builtin-helpers.html)

---

## File List Variables
{: .mb-5 }

Several variables contain arrays of file objects that you can iterate over using `{{#each}}`.

### File Object Structure
Each file object contains these properties:

| Property       | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `name`         | `string` | Filename with extension             |
| `relativePath` | `string` | Path relative to upload root folder |
| `absolutePath` | `string` | Complete system path                |
| `size`         | `number` | File size in bytes                  |
{: .table }

### Example Usage
```handlebars
{{#each raw_files}}
📁 {{this.relativePath}} — {{sizeHuman this.size}}
{{/each}}
```

---

## Custom Helper Functions
{: .mb-5 }

NZB Flow provides specialized helpers for formatting sizes and durations.

### Size Formatting Helpers
{: .mb-4 }

Transform byte values into human-readable formats.

#### Automatic Unit Selection
```handlebars
{{sizeHuman raw_size}}
```

**Auto-selection rules:**
- ≥ 1 TB → TB format
- ≥ 1 GB → GB format  
- ≥ 1 MB → MB format
- ≥ 1 KB → KB format
- < 1 KB → bytes

#### Fixed Unit Helpers
```handlebars
{{sizeTB raw_size}}    <!-- Always shows TB -->
{{sizeGB raw_size}}    <!-- Always shows GB -->
{{sizeMB raw_size}}    <!-- Always shows MB -->
{{sizeKB raw_size}}    <!-- Always shows KB -->
```

### Time Formatting Helpers
{: .mb-4 }

Convert millisecond values into readable time formats.

> **Input Format**: All time variables represent duration in milliseconds
{: .alert .alert-info }

#### Component Helpers (Modular)
Extract specific time components for custom formatting:

```handlebars
{{timeH total_time}}   <!-- Hours (0-∞) -->
{{timeM total_time}}   <!-- Minutes within hour (0-59) -->
{{timeS total_time}}   <!-- Seconds within minute (0-59) -->
{{timeMS total_time}}  <!-- Remaining milliseconds (0-999) -->
```

**Custom Format Example:**
```handlebars
Duration: {{timeH total_time}}:{{timeM total_time}}:{{timeS total_time}}.{{timeMS total_time}}
```
*Input: 5410456 ms → Output: "Duration: 1:30:10.456"*

#### Total Helpers
Get complete duration in a single unit:

```handlebars
{{totalS total_time}}  <!-- Total seconds -->
{{totalM total_time}}  <!-- Total minutes -->
{{totalH total_time}}  <!-- Total hours -->
{{totalMS total_time}} <!-- Total milliseconds -->
```

**Usage Example:**
```handlebars
Completed in {{totalM total_time}} minutes
```
*Input: 5410456 ms → Output: "Completed in 90 minutes"*

## Complete Variable Reference
{: .mb-5 }

### Custom Variables
{: .mb-4 }

Create dynamic, user-editable fields by referencing undefined variables:

```handlebars
Quality: {{video_quality}}
Source: {{content_source}}
Notes: {{release_notes}}
```

These become editable fields in task logs after upload completion.

> **Note**: Block helpers like `{{#each}}` won't work with custom variables and will render as empty.
{: .alert .alert-warning }

### Built-in Variables
{: .mb-4 }

These variables represent single values from the posting process:

> **Null Handling**: Variables return empty strings when data isn't available (e.g., RAR variables when compression is disabled).
{: .alert .alert-info }

| Variable     | Type             | Description                                                               |
| ------------ | ---------------- | ------------------------------------------------------------------------- |
| `jobname`    | `string \| null` | Post name/title                                                           |
| `fname`      | `string \| null` | Original file/folder name used as base                                    |
| `raw_size`   | `number \| null` | Original file size before compression (bytes)                             |
| `rar_size`   | `number \| null` | Total RAR file size (bytes)                                               |
| `rar_count`  | `number \| null` | Number of RAR files created                                               |
| `rar_time`   | `number \| null` | RAR creation time (milliseconds)                                          |
| `par_size`   | `number \| null` | Total PAR2 file size (bytes)                                              |
| `par_count`  | `number \| null` | Number of PAR2 files created                                              |
| `par_time`   | `number \| null` | PAR2 creation time (milliseconds)                                         |
| `nyuu_size`  | `number \| null` | Total upload size: rar_size + par_size (or raw_size + par_size if no RAR) |
| `nyuu_time`  | `number \| null` | Upload duration (milliseconds)                                            |
| `total_time` | `number \| null` | Complete job duration including queue time (milliseconds)                 |
{: .table }

### File List Variables
{: .mb-4 }

Arrays of file objects for iteration with `{{#each}}`:

| Variable     | Type                 | Description                                                       |
| ------------ | -------------------- | ----------------------------------------------------------------- |
| `raw_files`  | `TaskVariableFile[]` | Original files selected for posting (recursive)                   |
| `rar_files`  | `TaskVariableFile[]` | Generated RAR archive files                                       |
| `par_files`  | `TaskVariableFile[]` | Generated PAR2 recovery files                                     |
| `nyuu_files` | `TaskVariableFile[]` | All files uploaded to usenet (rar_files or raw_files + par_files) |
{: .table }
