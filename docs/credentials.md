---
#https://www.notion.so/n8n/Frontmatter-432c2b8dff1f43d4b1c8d20075510fe4
title: Neo4j credentials
description: Documentation for Neo4j credentials. Use these credentials to authenticate Neo4j in n8n, a workflow automation platform.
contentType: [integration, reference]
priority: high
---

# Neo4j credentials

You can use these credentials to authenticate the following nodes:

- [Neo4j Vector Store](vector-store.md)
- [Neo4j Chat Memory Store](chat-memory-store.md)

/// note | Agent node users
The Agent node doesn't support SSH tunnels.
///

## Prerequisites

Create a user account on a [Neo4j](https://www.neo4j.com/){:target=_blank .external-link} server database.

## Supported authentication methods

- Database connection

## Related resources

Refer to [Neo4j's documentation](https://neo4j.com/docs/api/javascript-driver/current/){:target=_blank .external-link} for more information about the service.

## Using database connection

To configure this credential, you'll need:

- The server **Bolt URL**: The database's Bolt URL
- The **Database** name.
- A **User** name.
- A **Password** for that user.
