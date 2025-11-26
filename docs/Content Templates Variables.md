# Content templates Variables

You can use built-in variables from the completed post to fill in your content template.
<!-- You can also define custom variables. If your template contains custom variables, the app will ask you to provide their values after the post completes.

Note: Custom variables cannot be used inside file lists (each blocks). They can only be simple scalars (strings/numbers), not arrays or objects. -->

- [Content templates Variables](#content-templates-variables)
  - [Handlebars Templates](#handlebars-templates)
  - [File Lists](#file-lists)
  - [Custom helpers](#custom-helpers)
    - [Size helpers](#size-helpers)
    - [Time Helpers](#time-helpers)
      - [Modular Helpers (HH/MM/SS)](#modular-helpers-hhmmss)
      - [Total Helpers](#total-helpers)
  - [List of variables](#list-of-variables)
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

## List of variables

### Single value variables

These variables represent single values (strings, numbers)

If a variable is null, it will be replaced by an empty string. This will only happen if you are using variables that are not generated. For example:

- Using variables that are only known after doing certain steps while setting the content template to include the file in the post.
- Using rar related variables if you don't generate RARS
- Using par related variables if you don't generate par2 files

| Variable     | Type             | Description                                                                                                             |
| ------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `jobname`    | `string \| null` | The name of the post.                                                                                                   |
| `fname`      | `string \| null` | The name of the selected file or folder used as the base for the post.                                                  |
| `raw_size`   | `number \| null` | Total size (in bytes) of the selected files/folders **before** RAR compression.                                         |
| `rar_size`   | `number \| null` | Total size (in bytes) of all generated RAR files.                                                                       |
| `rar_count`  | `number \| null` | Number of RAR files generated.                                                                                          |
| `rar_time`   | `number \| null` | Time (in milliseconds) taken to create the RAR files.                                                                   |
| `par_size`   | `number \| null` | Total size (in bytes) of all generated PAR files.                                                                       |
| `par_count`  | `number \| null` | Number of PAR files generated.                                                                                          |
| `par_time`   | `number \| null` | Time (in milliseconds) taken to create the PAR files.                                                                   |
| `nyuu_size`  | `number \| null` | Total size (in bytes) of the combined upload set (rar_size + par_size, if you don't use RAR, it's raw_size + par_size). |
| `nyuu_time`  | `number \| null` | Time (in milliseconds) taken for the Usenet upload (Nyuu).                                                              |
| `total_time` | `number \| null` | Total processing time for the entire job, including queue delays.                                                       |

### File list variables

These variables contain a list of file objects, which you can iterate over with `{{#each}}`.

| Variable     | Type                 | Description                                                                |
| ------------ | -------------------- | -------------------------------------------------------------------------- |
| `raw_files`  | `TaskVariableFile[]` | List of the original uncompressed files selected for posting (recursive).  |
| `rar_files`  | `TaskVariableFile[]` | List of generated RAR files.                                               |
| `par_files`  | `TaskVariableFile[]` | List of generated PAR recovery files.                                      |
| `nyuu_files` | `TaskVariableFile[]` | List of all files uploaded to Usenet (rar_files or raw_files + par_files). |
