# Queues in NZB flow

In NZB flow there are 2 queues running simultaniously.

## General behaviour

- Pausing/Resuming the queue from the UI/API will pause both of these queues.
- If a command is currently running (rar, parpar, nyuu), the command will finish before it is queued.
- If a command is queued inbetween steps, it will pause and continue after you've resumed

## Upload queue

The upload queue processing posting jobs with the nyuu CLI after all files have been prepared.

- In the settings -> queues you can set `max upload workers`.
  - If you set this to more than 1, if the same server is involved, the amount of connections will be: (server connections + post check connections) x amount of workers
- In the settings -> queues you can set `Max uploads in queue before pausing compression`
  - If set to 1 or higher, it will auto pause the compression queue until an upload has been processed.
  - If set to 0, compression queue will never be auto paused

NOTE:
It can sometimes happen that an extra compression job is ran before it's paused properly if you have more than 1 compression worker if the timings are precise

## Compression queue

The compression queue runs both the RAR and parpar commands. And has it's own `max compression workers` setting.




