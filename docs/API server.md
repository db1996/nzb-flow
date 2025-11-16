# API Server docs

This programs comes with an optional web API (settings -> automation)
If enabled, a local web API will be available. It can manipulate the queues, approval queue, get queue status

[Download the postman collection here](<nzb flow.postman_collection.json>). In includes docs per request.

You can change the port and authentication in the settings -> automation tab

## TaskSettings and TaskConfig

In a lot of cases, you will retrieve data that is called TaskConfig. Which contain taskSettings.

The taskSettings are all the settings related to a profile. And can be manipulated using the API.
To get a good idea of all of those variables you can open a profile JSON file (all settings are stored in JSON). You will see a filled in settings there.

TaskConfig is the generated task based on those settings. So the name, nzb path, rarpar path, and more.
If you change the name of the task it will also regenerate the nzb path, rarpar path.

### Regenerate name/password

If you want to regenerate a random name/password based on the settings, just set the name/password to an empty string in the update config. And it will auto regenerate those details.
