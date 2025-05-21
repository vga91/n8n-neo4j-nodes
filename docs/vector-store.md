---
#https://www.notion.so/n8n/Frontmatter-432c2b8dff1f43d4b1c8d20075510fe4
title: Neo4j Vector Store node documentation
description: Learn how to use the Neo4j Vector Store node in n8n. Follow technical documentation to integrate Neo4j Vector Store node into your workflows.
contentType: [integration, reference]
priority: medium
---

# Neo4j Vector Store node

Use the Neo4j Vector Store node to store and retrieve [embeddings](/glossary.md#ai-embedding) in n8n's in-app memory. 

On this page, you'll find the node parameters for the Neo4j Vector Store node, and links to more resources.

/// note | Credentials You can find authentication information for this node [here](credentials.md). ///

--8<-- "_snippets/integrations/builtin/cluster-nodes/sub-node-expression-resolution.md"

/// note | This node is different from AI memory nodes
The simple vector storage described here is different to the AI memory nodes such as [Simple Memory](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/index.md).

This node creates a [vector database](/glossary.md#ai-vector-store) in the app memory.
///


/// warning | For development use only
This node stores data in memory only and isn't recommended for production use. All data is lost when n8n restarts and may also be purged in low-memory conditions.
///

## Node usage patterns

You can use the Neo4j Vector Store node in the following patterns.

### Use as a regular node to insert and retrieve documents

You can use the Neo4j Vector Store as a regular node to insert or get documents. This pattern places the Neo4j Vector Store in the regular connection flow without using an agent.

You can see an example of in step 2 of [this template](https://n8n.io/workflows/2465-building-your-first-whatsapp-chatbot/).

### Connect directly to an AI agent as a tool

You can connect the Neo4j Vector Store node directly to the [tool](/glossary.md#ai-tool) connector of an [AI agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) to use a vector store as a resource when answering queries.

Here, the connection would be: AI agent (tools connector) -> Neo4j Vector Store node.

### Use a retriever to fetch documents

You can use the [Vector Store Retriever](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrievervectorstore.md) node with the Neo4j Vector Store node to fetch documents from the Neo4j Vector Store node. This is often used with the [Question and Answer Chain](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/index.md) node to fetch documents from the vector store that match the given chat input.

An [example of the connection flow](https://n8n.io/workflows/1960-ask-questions-about-a-pdf-using-ai/) (the linked example uses Pinecone, but the pattern is the same) would be: Question and Answer Chain (Retriever connector) -> Vector Store Retriever (Vector Store connector) -> Neo4j Vector Store.

### Use the Vector Store Question Answer Tool to answer questions

Another pattern uses the [Vector Store Question Answer Tool](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolvectorstore.md) to summarize results and answer questions from the Neo4j Vector Store node. Rather than connecting the Neo4j Vector Store directly as a tool, this pattern uses a tool specifically designed to summarizes data in the vector store.

The [connections flow](https://n8n.io/workflows/2465-building-your-first-whatsapp-chatbot/) in this case would look like this: AI agent (tools connector) -> Vector Store Question Answer Tool (Vector Store connector) -> Neo4j Vector Store.

## Node parameters

--8<-- "_snippets/integrations/builtin/cluster-nodes/vector-store-mode.md"

<!-- vale from-write-good.Weasel = NO -->
### Get Many parameters
<!-- vale from-write-good.Weasel = YES -->

* **Label**: The label of the node used to store the embedding.

* **Text**: The property key of the node containing text.

* **Index Name**: The name of the vector index to use.

* **Embedding**: The property key of the node containing embedding.

* **Database**: The name of the database to use.

* **Index Type**: The type of index to use. It can be "NODE" or "RELATIONSHIP".

* **Prompt**: The search query.

* **Limit**: The number to set how many results to retrieve from the vector store. For example, set this to 10 to get the ten best results.

* **Retrieval Query**: The query to use for retrieval, e.g. "return node.text AS text, properties(node) AS metadata, score". See <a href="https://js.langchain.com/docs/integrations/vectorstores/neo4jvector/#use-retrievalquery-parameter-to-customize-responses">Neo4j documentation</a> for more details.

* **Keyword Index Name**: The name of the keyword index to use.

* **Search Type**: The type of search to use. It can be "vector" (default) or "hybrid" (to leverate full-text search as well).


### Insert Documents parameters

* **Label**: The label of the node used to store the embedding.

* **Text**: The property key of the node containing text.

* **Index Name**: The name of the vector index to use.

* **Embedding**: The property key of the node containing embedding.

* **Database**: The name of the database to use.

* **Index Type**: The type of index to use. It can be "NODE" or "RELATIONSHIP".

* **Create ID Index**: Whether to create an ID index for the node / relationshis.

* **Pre Delete Collection**: Whether to delete the collection before inserting new data (default: `false`).


### Update Documents parameters

* **Label**: The label of the node used to store the embedding.

* **Text**: The property key of the node containing text.

* **Index Name**: The name of the vector index to use.

* **Embedding**: The property key of the node containing embedding.

* **Database**: The name of the database to use.

* **Index Type**: The type of index to use. It can be "NODE" or "RELATIONSHIP".


### Retrieve Documents (As Vector Store for Chain/Tool) parameters

* **Label**: The label of the node used to store the embedding.

* **Text**: The property key of the node containing text.

* **Index Name**: The name of the vector index to use.

* **Embedding**: The property key of the node containing embedding.

* **Database**: The name of the database to use.

* **Index Type**: The type of index to use. It can be "NODE" or "RELATIONSHIP".

* **Prompt**: The search query.

* **Limit**: The number to set how many results to retrieve from the vector store. For example, set this to 10 to get the ten best results.

* **Retrieval Query**: The query to use for retrieval, e.g. "return node.text AS text, properties(node) AS metadata, score". See <a href="https://js.langchain.com/docs/integrations/vectorstores/neo4jvector/#use-retrievalquery-parameter-to-customize-responses">Neo4j documentation</a> for more details.

* **Keyword Index Name**: The name of the keyword index to use.

* **Search Type**: The type of search to use. It can be "vector" (default) or "hybrid" (to leverate full-text search as well).


### Retrieve Documents (As Tool for AI Agent) parameters

* **Name**: The name of the vector store.

* **Description**: Explain to the LLM what this tool does. A good, specific description allows LLMs to produce expected results more often.

* **Label**: The label of the node used to store the embedding.

* **Text**: The property key of the node containing text.

* **Index Name**: The name of the vector index to use.

* **Embedding**: The property key of the node containing embedding.

* **Database**: The name of the database to use.

* **Index Type**: The type of index to use. It can be "NODE" or "RELATIONSHIP".

* **Prompt**: The search query.

* **Limit**: The number to set how many results to retrieve from the vector store. For example, set this to 10 to get the ten best results.

* **Retrieval Query**: The query to use for retrieval, e.g. "return node.text AS text, properties(node) AS metadata, score". See <a href="https://js.langchain.com/docs/integrations/vectorstores/neo4jvector/#use-retrievalquery-parameter-to-customize-responses">Neo4j documentation</a> for more details.

* **Keyword Index Name**: The name of the keyword index to use.

* **Search Type**: The type of search to use. It can be "vector" (default) or "hybrid" (to leverate full-text search as well).

* **Include Metadata**: Whether or not to include document metadata (default `true`).



## Related resources

Refer to [LangChains's Memory Vector Store documentation](https://js.langchain.com/docs/integrations/vectorstores/memory/){:target=_blank .external-link} for more information about the service.

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-overview-link.md"
--8<-- "_glossary/ai-glossary.md"