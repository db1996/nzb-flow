# Content templates

Content templates are a way for you to generate files/texts with the post, or after the post.

This can be used for creating an automatic post text for forums, or generating an .nfo file. Anything you want really.

You can set per profile which content templates are active.

The file contents can be found in the task logs, and saved as a file there.

## How to use

For details on helpers and per-variable explanations, check the variables docs

The contents of the file is generated using Handlebars: https://handlebarsjs.com/

To use any variable, you can use `{{variable_name}}`

For any variables that contain files, like raw_files. You can loop over each one:

```
{{#each raw_files}}
  {{this.relativePath}} - {{this.size}}
{{/raw_files}}
```

A file variable will always contain these sub variables (this.*)

- name: Contains the file name without any path (with extension)
- relativePath: Contains the relative path of the file to the post. this will consider the rar archive/post files to be the root
- absolutePath: Contains the absolute path of the file. This contains your machine's paths
- size: size in bytes (use helpers to make this human readable)

## General Settings

If neither "Include in post" or "Include with NZB" is active and custom location is not filled in. The only place to find the completed template is in the task logs.

### Name (UI)

This name is only used for the UI (dropdowns, stuff like that). It is also used to generate the ID.

### Include in post

This makes sure the app generates this file before posting starts, and includes it in the RAR archive. If RAR creation is turned off, it will be included directly in the post just like the other files

NOTE: Not all variables are available in file generation if this is turned on. Stuff like nyuu_files, nyuu_time, total_time are not available. (see variables section for more info)

### Include with NZB

This saves the file next to the nzb file at the end of posting. You can turn on subfolders per NZB in the general settings of the app.


### Custom file location

This saves the file in a custom location, enter a **folder** here.

NOTE: This option is only recommended to use if you use variables in the file name. Otherwise files will be overwritten if they have the same name.

## File content and settings

### File extension

You can save this file as any extension

### File name

This is the eventual name of the file. You can use any of the variables here

### File contents

This is the full contents of the file. You can use any of the variables here
