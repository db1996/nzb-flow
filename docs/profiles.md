# Profile settings docs

Profile settings are used to generate a post, this can mean anything from random generating names, obfuscation, more advanced CLI parameters and linking servers.

Once you generate a task, either automatically by using folder monitoring or manually by choosing/dropping files in, a post with full details is generated.
In the pop-up you see, the settings can then be altered before actually posting. Or you can regenerate the task with the same files but with another profile. All details will be overwritten.

Here I will go through each setting individually and explain in more technical detail what it does and what it affects in the final result.

## Posting settings

### Post title

In the profile settings you can choose whether to use a randomly generated one, optionally with custom prefix and suffix that will always be the same. Or you can choose to fill in a custom name

`{fname}` can be used in the custom name, suffix and prefix. It will be replaced by the name of the first file/folder in the list (the first one you drop)

This will be used for the rar, par2 and NZB file names. Which results in the post title in nzb indexers. If obfuscation is used the filenames will still be the post title input (can be random, so still obfuscated). More details about the obfuscation methods [check here]()

### Password

Same as the post title, this can be random with optional prefix and suffix.

This will be used for the rar archive's password. This is the password downloaders like SABnzbd will need to unpack it.

Used in RAR CLI with the option:

`-p{password}` if encrypt headers is turned off

`-hp{password}` if encrypt headers is turned


### From

The email used for the usenet post, can be randomized for each post.

Used in the nyuu CLI with the option:

`--from {from}`

### Groups

The usenet groups to post to, can be seperated by commas and do not use spaces.

USed in the nyuu CLI with the option:

`--groups`


### Save Rar and Par2 files

Generated files are not deleted after the job if you turn this on. Folder path can be found and changed in the general settings. IF you open a task log and go to the files tab you will find the exact folder for that task.

### Obfuscation

#### Subject

Obfuscates the subject headers of the upload. If this is turned on this will be a random UUID. Making it unreadable for usenet indexers

Uses the nyuu CLI command parameter:

`--subject`

### filename

Obfuscates the filename headers of the upload, so the original rar/par2 filenames are obfuscated

Uses the nyuu CLI command parameter:

`--filename`

### YENC name

Obfuscates the YENC headers. Some indexers will use the YENC headers to still piece together obfuscated posts.

Uses the nyuu CLI command parameter:

`--yenc-name`
