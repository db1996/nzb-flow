# Websocket docs

This application provides an optional websocket server where you can receive live updates about task progress, queue updates and more.

You can change the port and authentication in the settings -> automation tab

## Connecting

Connection goes through `ws://localhost:{PORT}?token={token}`

## Events

Every event's data looks like this:

```json
{
   "success":true,
   "data":{
      "type":"event-name"
      // other data

   }
}
```

### Queue update

Whenever the compression queue or upload queue updates, you will receive an event with the complete queue status.

This includes this data:

- compressionActive: Is the compression queue turned on
- uploadActive: Is the upload queue turned on
- compressionRunning: number, amount of jobs currently being compressed
- compressionRunningConfigs: array of task configs currently compressing
- uploadRunning: number, amount of jobs currently being uploaded
- uploadRunningConfigs: array of task configs currently uploading
- compressionQueued: number, amount of jobs currently in queue for compression
- compressionQueuedConfigs: array of task configs in queue for compression
- uploadQueued: number, amount of jobs currently in queue for upload
- uploadQueuedConfigs: array of task configs in queue for upload

### Command percentage update

When a command is running (rar, par or nyuu), this will send an update of the current percentage completion of that command. together with current step information.

This includes this data:

- id: task ID (can be found in the queue, also available from the API)
- currentStep: [Command step enum](../src/main/enums/CommandStep.ts)
- percentage: number rounded to 2

### Task finished

When a task is finished (uploaded and after job instructions) you will receive an update

This includes this data:

- taskConfig: full task config, includes the id for filtering, but also complete CLI outputs
