---
layout: default
title: WebSocket Server
description: Real-time event system for live updates and monitoring
nav_order: 5
---

# WebSocket Server Documentation
{: .mb-6 }

NZB Flow provides an optional WebSocket server for real-time updates on task progress, queue status, and system events. Perfect for building custom dashboards or monitoring tools.
{: .lead }

## Configuration
{: .mb-4 }

Enable and configure the WebSocket server in **Settings → Automation**.

| Setting            | Description                | Default |
| ------------------ | -------------------------- | ------- |
| **Port**           | WebSocket server port      | `3001`  |
| **Authentication** | Token-based authentication | Enabled |
{: .table }

## Connection
{: .mb-4 }

```javascript
const ws = new WebSocket('ws://localhost:3001?token=YOUR_TOKEN');
```

## Event Structure
{: .mb-5 }

All events follow a consistent structure:

```json
{
  "success": true,
  "data": {
    "type": "event-name",
    // Event-specific data
  }
}
```

---

## Event Types
{: .mb-5 }

### 🔄 Queue Updates
{: .mb-3 }

Triggered whenever compression or upload queues change state.

**Event Data:**
```json
{
  "type": "queue-update",
  "compressionActive": true,
  "uploadActive": true,
  "compressionRunning": 2,
  "compressionRunningConfigs": [...],
  "uploadRunning": 1,
  "uploadRunningConfigs": [...],
  "compressionQueued": 5,
  "compressionQueuedConfigs": [...],
  "uploadQueued": 3,
  "uploadQueuedConfigs": [...]
}
```

**Queue Properties:**
- **Active**: Queue is enabled/paused
- **Running**: Number of active workers
- **RunningConfigs**: Array of current task configurations
- **Queued**: Number of pending jobs
- **QueuedConfigs**: Array of pending tasks

### 📊 Command Progress Updates
{: .mb-3 }

Real-time progress updates during RAR, ParPar, and Nyuu operations.

**Event Data:**
```json
{
  "type": "command-progress",
  "id": "task-uuid",
  "currentStep": "COMPRESSION",
  "percentage": 45.67
}
```

**Command Steps:**
- `COMPRESSION` - RAR creation phase
- `PAR_CREATION` - ParPar processing
- `UPLOADING` - Nyuu posting

> 📝 **Reference**: See [CommandStep enum](https://github.com/db1996/nzb-flow/blob/main/src/main/enums/CommandStep.ts) for complete step definitions
{: .alert .alert-info }

### ✅ Task Completion
{: .mb-3 }

Notification when tasks finish processing (including post-upload instructions).

**Event Data:**
```json
{
  "type": "task-finished",
  "taskConfig": {
    "id": "task-uuid",
    "name": "my-post",
    "status": "completed",
    // Complete task configuration and CLI outputs
  }
}
```

The `taskConfig` includes the full task configuration plus complete CLI outputs for debugging and logging.

---

## Integration Examples
{: .mb-4 }

### Basic Monitoring
```javascript
const ws = new WebSocket('ws://localhost:3001?token=YOUR_TOKEN');

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);

  if (response.success) {
    switch (response.data.type) {
      case 'queue-update':
        console.log('Queue status:', response.data);
        break;
      case 'command-progress':
        console.log(`Task ${response.data.id}: ${response.data.percentage}%`);
        break;
      case 'task-finished':
        console.log('Task completed:', response.data.taskConfig.name);
        break;
    }
  }
};
```
