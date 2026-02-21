---
layout: default
title: API Server
description: Remote control API documentation with authentication and endpoints
nav_order: 4
---

# API Server Documentation
{: .mb-6 }

NZB Flow includes an optional web API for remote control and automation. Enable it in **Settings → Automation** to access queue management, approval workflows, and status monitoring.
{: .lead }

## Quick Start
{: .mb-4 }

1. **Enable API**: Settings → Automation → Enable API Server
2. **Configure**: Set custom port and authentication credentials
3. **Test**: Download the Postman collection below

### 📦 Postman Collection
[Download API Collection](nzb%20flow.postman_collection.json){: .btn .btn-primary }

The collection includes comprehensive documentation for each endpoint with example requests and responses.

## Configuration
{: .mb-4 }

| Setting            | Description                           | Default        |
| ------------------ | ------------------------------------- | -------------- |
| **Port**           | API server port                       | `3000`         |
| **Authentication** | Enable/disable API key authentication | Enabled        |
| **API Key**        | Custom authentication token           | Auto-generated |
{: .table }

## Data Structures
{: .mb-5 }

### TaskConfig & TaskSettings
{: .mb-4 }

The API uses two main data structures for managing tasks:

#### TaskSettings
{: .mb-3 }
Profile-related configuration that can be modified via API:
- All profile settings (compression, encryption, server details)
- Stored in JSON format for easy manipulation
- Can be extracted from saved profile files

> 💡 **Tip**: Open any profile JSON file to see the complete TaskSettings structure
{: .alert .alert-info }

#### TaskConfig
{: .mb-3 }
Generated task information based on TaskSettings:
- Task name and paths (NZB, RAR/PAR folders)
- Computed values from profile settings
- Auto-regenerates dependent paths when name changes

### Dynamic Regeneration
{: .mb-4 }

#### Random Name/Password Reset
To regenerate random values based on current settings:

```json
{
  "name": "",
  "password": ""
}
```

Setting these fields to empty strings triggers automatic regeneration using the profile's randomization rules.

---

## API Endpoints
{: .mb-4 }

**📦 Complete Documentation**: All endpoints, parameters, and examples are included in the [Postman collection](nzb%20flow.postman_collection.json).

### Key Endpoint Categories
- **Queue Management**: Control compression and upload queues
- **Task Operations**: Create, modify, and monitor individual tasks
- **Approval Workflow**: Manage task approval system
- **Status Monitoring**: Real-time queue and task status
- **Profile Management**: CRUD operations for posting profiles

## Authentication
{: .mb-4 }

All API requests require authentication via header:

```
Authorization: Bearer YOUR_API_KEY
```

The API key can be found and regenerated in **Settings → Automation → API Key**.
