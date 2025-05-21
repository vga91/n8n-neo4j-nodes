---
#https://www.notion.so/n8n/Frontmatter-432c2b8dff1f43d4b1c8d20075510fe4
title: Neo4j Chat Memory node documentation
description: Learn how to use the Neo4j Chat Memory node in n8n. Follow technical documentation to integrate Neo4j Chat Memory node into your workflows.
contentType: [integration, reference]
---

# Neo4j Chat Memory node

Use the Neo4j Chat Memory node to use Neo4j as a [memory](/glossary.md#ai-memory) server for storing chat history.

On this page, you'll find a list of operations the Neo4j Chat Memory node supports, and links to more resources.

/// note | Credentials
You can find authentication information for this node [here](/integrations/builtin/credentials/Neo4j.md).
///

--8<-- "_snippets/integrations/builtin/cluster-nodes/sub-node-expression-resolution.md"

## Node parameters


* **Session ID**: The key to use to store the memory in the workflow data.

* **Session Key**: Use this parameter to make the session expire after a given number of seconds.

* **Window Length**: The number of previous interactions to consider for context.

* **Session node label**: The label of the node that stores the session. The default is "Session".

* **Message node label**: The label of the node that stores the message. The default is "Message".


