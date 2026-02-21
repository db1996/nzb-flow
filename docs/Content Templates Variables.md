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

- [Content templates Variables](#content-templates-variables)
  - [Handlebars Templates](#handlebars-templates)
  - [File Lists](#file-lists)
  - [Custom helpers](#custom-helpers)
    - [Size helpers](#size-helpers)
    - [Time Helpers](#time-helpers)
      - [Modular Helpers (HH/MM/SS)](#modular-helpers-hhmmss)
      - [Total Helpers](#total-helpers)
  - [List of variables](#list-of-variables)
    - [Custom variables](#custom-variables)
    - [Single value variables](#single-value-variables)
    - [File list variables](#file-list-variables)


## Handlebars Templates

Content templates use the Handlebars template language (also known as “mustache”).

This means you can use:

simple variables `{{variable}}`

helpers `{{helper value}}`

conditionals `{{#if}}`

loops `{{#each}}` ... `{{/each}}`

You can also use any other built-in Handlebars helper:

👉 https://handlebarsjs.com/guide/builtin-helpers.html

## File Lists

Some built-in variables contain lists of files.
You can loop over these using Handlebars’ each block:

```
{{#each raw_files}}
  {{this.relativePath}} - {{sizeHuman this.size}}
{{/each}}
```

Every file object contains:

- `name` – filename with extension
- `relativePath` – the path relative to the uploaded root folder
- `absolutePath` – full absolute path (e.g., C:/Users/Me/Desktop/test.txt)
- `size` – size in bytes

These structures are provided by the app and cannot be modified.

## Custom helpers

I have made a couple custom helpers to make some properties human readable.

### Size helpers

For any of the sizes of files/sections of the post. You can use a couple helpers to display the size in a specific way or an automatic way.

If you do not use a helper the size in bytes is shown.

For this example I will be using raw_size as an example.

`{{sizeHuman raw_size}}`: Will use KB/MB/GB/TB based on how large the files are.

It determines like this (in order of priority)

- ≥ 1 TB → TB
- ≥ 1 GB → GB
- ≥ 1 MB → MB
- ≥ 1 KB → KB
- Otherwise → bytes

Fixed-unit helpers:

- {{sizeTB raw_size}}
- {{sizeGB raw_size}}
- {{sizeMB raw_size}}
- {{sizeKB raw_size}}

### Time Helpers

Some variables contain the **number of milliseconds** a task took, such as the duration of each step or the total time of an upload job.

If you do not use a helper, the raw value in milliseconds is shown.

For this example, we will use `total_time`.

#### Modular Helpers (HH/MM/SS)

These helpers return hours, minutes, seconds, or leftover milliseconds **modularly**, so you can build your own custom formats:

- `{{timeH total_time}}` – Hours (floor of total hours)
- `{{timeM total_time}}` – Minutes **within the current hour** (0–59)
- `{{timeS total_time}}` – Seconds **within the current minute** (0–59)
- `{{timeMS total_time}}` – Milliseconds **left over after calculating HH:MM:SS** (0–999)

Example:

`{{timeH total_time}}:{{timeM total_time}}:{{timeS total_time}}.{{timeMS total_time}}`

If `total_time` = 90 minutes + 10 seconds + 456 ms, this renders as:

`1:30:10.456`


#### Total Helpers

These helpers return the **total value** of the task in a single unit:

- `{{totalS total_time}}` – Total seconds (rounded down)
- `{{totalM total_time}}` – Total minutes (rounded down)
- `{{totalH total_time}}` – Total hours (rounded down)
- `{{totalMS total_time}}` – Total milliseconds

Example:

`{{totalM total_time}} minutes, {{timeMS total_time}} ms`

If `total_time` = 90 minutes + 10 seconds + 456 ms, this renders as:

90 minutes, 5410456 ms

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
