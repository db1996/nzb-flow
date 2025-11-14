# Profile settings docs

Profile settings are used to generate a post, this can mean anything from random generating names, obfuscation, more advanced CLI parameters and linking servers.

Once you generate a task, either automatically by using folder monitoring or manually by choosing/dropping files in, a post with full details is generated.
In the pop-up you see, the settings can then be altered before actually posting. Or you can regenerate the task with the same files but with another profile. All details will be overwritten.

Here I will go through each setting individually and explain in more technical detail what it does and what it affects in the final result.

- [Profile settings docs](#profile-settings-docs)
  - [Posting settings](#posting-settings)
    - [Post title](#post-title)
    - [Password](#password)
    - [From](#from)
    - [Groups](#groups)
    - [Save Rar and Par2 files](#save-rar-and-par2-files)
    - [Obfuscation](#obfuscation)
      - [Subject](#subject)
      - [Filename](#filename)
      - [YENC name](#yenc-name)
  - [Server settings](#server-settings)
  - [Rar settings](#rar-settings)
    - [Skip rar creation](#skip-rar-creation)
    - [Exclude files](#exclude-files)
    - [Recursion](#recursion)
    - [Encrypt headers](#encrypt-headers)
    - [Solid archive](#solid-archive)
    - [Volume sizes](#volume-sizes)
  - [Par settings](#par-settings)
    - [Turn off par creation](#turn-off-par-creation)
    - [Redundancy](#redundancy)
    - [Slices](#slices)
  - [Nyuu Settings (posting)](#nyuu-settings-posting)
    - [Article size](#article-size)
    - [Include password in NZB](#include-password-in-nzb)
    - [Post checking - check connections](#post-checking-check-connections)
    - [Post checking - check tries](#post-checking-check-tries)
    - [Post checking - check delay](#post-checking-check-delay)
    - [Post checking - check post tries](#post-checking-check-post-tries)
    - [Post checking - Check queue size](#post-checking-check-queue-size)
    - [Nyuu advanced templates](#nyuu-advanced-templates)
      - [Subject override](#subject-override)
      - [Filename override](#filename-override)
      - [YENC name override](#yenc-name-override)
      - [Message-ID override](#message-id-override)
      - [Date override](#date-override)
      - [Article encoding override](#article-encoding-override)


## Posting settings

### Post title

In the profile settings you can choose whether to use a randomly generated one, optionally with custom prefix and suffix that will always be the same. Or you can choose to fill in a custom name

`{fname}` can be used in the custom name, suffix and prefix. It will be replaced by the name of the first file/folder in the list (the first one you drop)

This will be used for the rar, par2 and NZB file names. Which results in the post title in nzb indexers. If obfuscation is used the filenames will still be the post title input (can be random, so still obfuscated). More details about the obfuscation methods [check here](#obfuscation)

### Password

Same as the post title, this can be random with optional prefix and suffix.

This will be used for the rar archive's password. This is the password downloaders like SABnzbd will need to unpack it.

Rar CLI with the option:

`-p{password}` if encrypt headers is turned off

`-hp{password}` if encrypt headers is turned

### From

The email used for the usenet post, can be randomized for each post.

Nyuu CLI with the option:

`--from {from}`

### Groups

The usenet groups to post to, can be seperated by commas and do not use spaces.

Nyuu CLI with the option:

`--groups`


### Save Rar and Par2 files

Generated files are not deleted after the job if you turn this on. Folder path can be found and changed in the general settings. IF you open a task log and go to the files tab you will find the exact folder for that task.

### Obfuscation

All 3 obfuscation methods will generate a UUID if turned on (Seperate one for each).

#### Subject

Obfuscates the subject headers of the upload. If this is turned on this will be a random UUID. Making it unreadable for usenet indexers

Nyuu CLI command parameter:

`--subject`

#### Filename

Obfuscates the filename headers of the upload, so the original rar/par2 filenames are obfuscated. The rar/par2/NZB filenames are still used from the post title input. but this just obfuscates the headers of the usenet post.

Nyuu CLI command parameter:

`--filename`

#### YENC name

Obfuscates the YENC headers. Some indexers will use the YENC headers to still piece together obfuscated posts.

Nyuu CLI command parameter:

`--yenc-name`

## Server settings

You can set a primary and backup server. If the primary server fails the upload it will retry with the backup server (including the retries from nyuu settings).

Servers are managed on the settings page

## Rar settings

### Skip rar creation

This will skip the rar step entirely. This will also make it impossible to have a password.

### Exclude files

This can be a comma separated list. And it can use glob patterns like `*.txt` to exclude all txt files.

Rar cli parameter:

`-x{pattern}` for each pattern in the list

### Recursion

This keeps folder structures intact in the archive. If this is turned off it will only archive files in the main folder.

Rar CLI parameter:

`-r`

### Encrypt headers

Encrypts the headers so the filenames in the archive can't be read if the user doesn't have a password. This can only be used with a password set

Rar CLI parameter:

`-hp{password}` instead of `-p{password}`

### Solid archive

Turns on solid archives. This increases compression for archives with a lot of files.

Rar CLI parameter:

`-s`

### Volume sizes

Volumes means multi part archives. If you turn on automatic volume sizes rar will make volumes based on disk size. You can also fill in a custom size.

Rar CLI parameter:

`-v{size}` size is omitted if you pick automatic. If you leave it empty and do without automatic it will leave out the parameter.

## Par settings

### Turn off par creation

Not recommended, but in the spirit of full control there's still an option

### Redundancy

Set a redundancy percentage.  You can use a ton of different values here. Check the parpar cli help text for more info

ParPar CLI parameter:

`-r{redundancy}`

### Slices

Set number of input slices. The same values as redundancy can be used. Check the ParPar CLI help text for more info

ParPar CLI parameter:

`-s{slice_size}`


## Nyuu Settings (posting)

### Article size

Target size of each news post (default 700K). Note that yEnc makes the actual size larger.

Nyuu CLI parameter:

`-a {size}`

### Include password in NZB

If turned on it will pass the rar password through in the NZB, making unpacking automatic for download clients

Nyuu CLI parameter:

`--nzb-password {password}`

### Post checking - check connections

Number of connections used for checking, if set to 0 it will skip checking entirely. Default is 0

NOTE: this will increase the total number of server connections (servers->connections).

Nyuu CLI parameter:

`--check-connections {connections}`

### Post checking - check tries

Amount of times nyuu should try checking the post. Set to 0 for no checking, default is 2.

Nyuu CLI parameter

`--check-tries {tries}`

### Post checking - check delay

Delay between posting and checking. You can use units here like: ms, s, m. So for example: 1m = 1 minute, 5s = 5 seconds

Nyuu CLI parameter

`--check-delay {delay}`

### Post checking - check post tries

Amount of attempts to repost failed articles when checking posts.

Nyuu CLI parameter:

`--check-post-tries {tries}`

### Post checking - Check queue size

Maximum number of articles queued for checking. Posting will stall if the number of articles exceeds this number. Default 1000

Nyuu CLI parameter:

`--check-queue-size {queue_size}`


### Nyuu advanced templates

For all the advanced overrides, please check the nyuu CLI help thoroughly. These can drastically alter how your post shows up in indexers, if at all.

#### Subject override

This will use a custom template for the subject (post title). If this is not checked nyuu will use internal defaults. Which are comparable to:

`{comment} [{0filenum}/{files}] - "{filename}" yEnc ({part}/{parts}) {filesize} {comment2}`

If subject obfuscation is turned on this option is ignored entirely and a random UUID is used here.

Nyuu CLI parameter:

`--subject {template}`

#### Filename override

This will use a custom template for the subject (post title). If this is not checked nyuu will use internal defaults

`{basename}` - base file name without any paths

You can use the same variales here as the subject

If filename obfuscation is turned on this option is ignored entirely and a random UUID is used here.

Nyuu CLI parameter:

`--filename {template}`

#### YENC name override

This will use a custom template for the yenc name. If this is not checked nyuu will use internal defaults

`{filename}` - filename (including different parts)

You can use the same variales here as the subject

If yenc name obfuscation is turned on this option is ignored entirely and a random UUID is used here.

Nyuu CLI parameter:

`--yenc-name {template}`

#### Message-ID override

This will override the message ID.
If this is not checked nyuu will use the internal default, which is similar to:

`${rand(24)}-{timestamp}@nyuu`

You can use the same variales here as the subject

Nyuu CLI parameter:

`--message-id {template}`

#### Date override

This will override the date (Creation date) of the post.

If this is not checked nyuu will use the internal default, which is similar to:

`{now}`

You can use the same variales here as the subject

Nyuu CLI parameter:

`--date {date}`

#### Article encoding override

This will override the character encoding of article/yenc headers. If this is not checked nyuu will use the internal default:

`utf8`

Nyuu CLI parameter:

`--article-encoding {article-encoding}`
