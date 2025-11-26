# NZB Flow
![alt text](docs/images/logo-dark.svg)

A GUI application to automate usenet posting. It uses external cli tools for the whole process: rar for compression (others coming soon), parpar for par2 creation and nyuu for posting.

## quick start

[Go to releases](https://github.com/db1996/nzb-flow/releases/latest) to download the latest installer.

The application requires access to all 3 external cli commands. It will automatically detect WinRAR installation on windows. And It has a built in option to install parpar and nyuu through nodejs.

Change your usenet server settings in the main settings screen. Multiple servers are supported and are linked in profiles.

You will have a default profile for posting settings with sensible defaults. You can start drag and dropping files to open the upload screen.

[Check out the profile settings docs](docs/profiles.md) for detailed and advanced settings for posting.

## Features

- Easy drag and drop
- Full obfuscation capabilities
  - random file names
  - random archive password with encrypted headers
  - subject obfuscation
  - yenc name obfuscation
  - filename metadata obfuscation
  - ability to fully customize nyuu templates for all of these
- All relevant CLI flags can be changed in the GUI.
- Profiles for post settings
- Folder monitoring, assign a profile for easy management
- double queue system. One for compression and par2 creation, and another for uploading so they can work simultaneously. Settings for their behaviour
- approval system for upload tasks (if you want to)
- preserve folder structure (with rar)
- More advanced rar options like volume sizes, solid archive, exclude patterns
- ability to turn rar off completely
- more advanced parpar options for redundancy and slices
- fully customizable nyuu command options like post checks, retry attempts and a lot more
- custom arguments for all CLIs
- Automatically update application (can be turned on)
- Optional API server for remote control
- Optional Websocket server for live updates
- Automatic file generation per post (.txt, .nfo etc)

## Docs

- [profile settings](docs/profiles.md): Details about what every option affects under the hood. These are the settings that generate the info you see in the pop-up when you drop in files
- [Queues docs](docs/Queues.md): Details about how the queue system works. And how the settings affect them.
- [API Server docs](docs/API%20server.md): Has a link to the postman collection and some general notes
- [Websocket server docs](docs/Websocket%20server.md): Details about received events

### Replace existing files

under general settings, there is a setting "Replace existing files"

When a job starts it now checks if the rar/par folder already exists, and if the nzb exists.

If this setting is on, it will delete these files before starting the job
If this is turned off, it will rename the task to "{name-of-post} - 1" etc until it finds a new name. This will also alter the name of the post of course

### Links

[Rar cli help](https://gist.github.com/YenForYang/5953ad8355cf32188aa75c0139cc9261)

[ParPar cli help](https://github.com/animetosho/ParPar/blob/master/help-full.txt)

[Nyuu cli help](https://github.com/animetosho/Nyuu/blob/master/help-full.txt)


## Causes of errors

### Special characters in the post name

Please do not use any special characters in the post name (rar/par/nzb file names). This results in errors in the process due to files not being made.

## still a work in progress

This is a little passion project of mine, so it's never really done.

But performance is something I need to test thoroughly. This application is written in electron which is not the most optimized framework. But that's really just for visuals and familiarity. Under the hood the clis are directly ran through their executables. Would love some help testing this.

### features I'm working on/thinking about

- Backup server per profile so if it fails uploading it should retry with the backup server
- a bit better visuals, I am not quite happy with all the tables yet, the screen needs to be quite wide to make it all fit.

If you can think of any missing features please open an issue!

## Build yourself

Make sure you have nodejs and pnpm installed

### Install dependencies

```bash
$ pnpm install
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

### Development

```bash
$ pnpm dev
```
