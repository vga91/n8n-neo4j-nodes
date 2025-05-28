![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# Neo4j nodes and credentials for n8n and self-hosted starter pack

This repo contains Neo4j custom nodes. It includes the node linter and other dependencies.

To make this custom node available to the community, you must create it as an npm package, and [submit it to the npm registry](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

It also contains a Docker Compose file to initialize a comprehensive self-hosted local AI and low-code development environment.
It leverages:
- [**Ollama**](https://ollama.com/): a Cross-platform LLM platform to install
and run the latest local LLMs 
- [**SQLite**](https://sqlite.org/): to store internal n8n data, such as Workflow definitions, credentials, user accounts, settings, etc..

If you want to use a local n8n instance, you can install this node (see here for more info) and import the workflows placed in `self-hosted-starter/n8n/demo-data/workflows/`, by executing:
```
n8n import:workflow --separate --input=<workflow-path>
```

## What’s included

### 1. [**Neo4j Vector Store node**](https://github.com/vga91/n8n-neo4j-nodes/tree/master/nodes/vector_store/VectorStoreNeo4j)

You can use this node to interact with the Neo4j vector properties. 

You can insert documents into Neo4j vector properties, get documents from a vector properties, retrieve documents to provide them to a retriever connected to a chain, or connect directly to an agent as a tool.

See [here](docs/vector-store.md) for more details

### 2. [**Neo4j Chat Memory node**](https://github.com/vga91/n8n-neo4j-nodes/tree/master/nodes/memory)

You can use the Neo4j Chat Memory node to use Neo4j as a memory server for storing chat history.

See [here](docs/chat-memory-store.md) for more details

### 3. [**Neo4j Credentials**](https://github.com/vga91/n8n-neo4j-nodes/blob/master/credentials/Neo4jCredentialsApi.credentials.ts)

You can use these credentials to authenticate the above nodes.
See [here](docs/credentials.md) for more details






## Prerequisites

You need the following installed on your development machine:

* [git](https://git-scm.com/downloads)
* Node.js and pnpm. Minimum version Node 20. You can find instructions on how to install both using nvm (Node Version Manager) for Linux, Mac, and WSL [here](https://github.com/nvm-sh/nvm). For Windows users, refer to Microsoft's guide to [Install NodeJS on Windows](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows).
* Use the docker compose file OR install n8n globally with: `npm install n8n -g`.
* Recommended: follow n8n's guide to [set up your development environment](https://docs.n8n.io/integrations/creating-nodes/build/node-development-environment/).

## Using this starter

These are the basic steps for working with the starter. For detailed guidance on creating and publishing nodes, refer to the [documentation](https://docs.n8n.io/integrations/creating-nodes/).

1. Clone the repo:
   ```
   git clone https://github.com/vga91/n8n-neo4j-nodes.git
   ```
2. Run `npm i` to install dependencies.
3. Run `rm -r dist & npm run build & npm link` to build the project.
4. (Optional) Test your node using the docker-compose file or locally. Refer to [Run your node locally](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/) for guidance.
5. Possibly, if you start ollama locally, e.g. with `ollama serve`, run the `docker-compose up` command. Check the
[Ollama homepage](https://ollama.com/) for installation instructions.
5a. Otherwise, execute the `starter.sh` script, possibly modifying it or follows the below sections.
7. After that the Docker Compose images are up, go to [Quick start and usage](#️-quick-start-and-usage) section.

### Running n8n using Docker Compose

#### For Nvidia GPU users

```
docker compose --profile gpu-nvidia up
```

> [!NOTE]
> If you have not used your Nvidia GPU with Docker before, please follow the
> [Ollama Docker instructions](https://github.com/ollama/ollama/blob/main/docs/docker.md).

### For AMD GPU users on Linux

```
docker compose --profile gpu-amd up
```

#### For Mac / Apple Silicon users

If you’re using a Mac with an M1 or newer processor, you can't expose your GPU
to the Docker instance, unfortunately. There are two options in this case:

1. Run the starter kit fully on CPU, like in the section "For everyone else"
   below
2. Run Ollama on your Mac for faster inference, and connect to that from the
   n8n instance

If you want to run Ollama on your mac, check the
[Ollama homepage](https://ollama.com/)
for installation instructions, and run the starter kit as follows:

```
docker compose up
```

##### For Mac users running OLLAMA locally

If you're running OLLAMA locally on your Mac (not in Docker), you need to modify the OLLAMA_HOST environment variable
in the n8n service configuration. Update the x-n8n section in your Docker Compose file as follows:

```yaml
x-n8n: &service-n8n
  # ... other configurations ...
  environment:
    # ... other environment variables ...
    - OLLAMA_HOST=host.docker.internal:11434
```

Additionally, after you see "Editor is now accessible via: <http://localhost:5678/>":

1. Head to <http://localhost:5678/home/credentials>
2. Click on "Local Ollama service"
3. Change the base URL to "http://host.docker.internal:11434/"

#### For everyone else

```
git clone https://github.com/n8n-io/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit
docker compose --profile cpu up
```

## ⚡️ Quick start and usage

The core of the Self-hosted AI Starter Kit is a Docker Compose file, pre-configured with network and storage settings, minimizing the need for additional installations.
After completing the installation steps above, simply follow the steps below to get started.

1. Open <http://localhost:5678/> in your browser to set up n8n. You’ll only
   have to do this once.
   Log in with user name: "giuseppe.villani@larus-ba.it" and password "Qwerty12345".

2. Open the 1st included workflow: <http://localhost:5678/workflow/adYVK8YgDDszqcEh>

   a. If needed, click the 3 dots button on the "Neo4j Vector Store Save" button, select "Open" and change the "Credential to connect with" using `Bolt URL`, `User Name`, `Database` and `password` respectively `bolt://neo4j:7687`, `neo4j`, `neo4j` and `password1234`

   b. If this is the first time you’re running the workflow and you run Ollama dockerized, you may need to wait until Ollama finishes downloading it. You can inspect the docker console logs to check on the progress.
   If needed, click the "Embeddings Ollama" 3 dots button and change the credentials (if running it locally, with `http://host.docker.internal:11434/`) and the "Model" used

   a. Click the **Test workflow** button at the bottom of the canvas, to start running the workflow.

   b. Click the **Chat** button at the bottom of the canvas and type a message, 
      e.g. 'What are the company's sick leave policies?'

4. Open the 2nd included workflow:
   <http://localhost:5678/workflow/FPkRbwf9zJLYZUuc>

   a. Click the **Test workflow** button

   b. If needed, click the "Embeddings Ollama" 3 dots button and change the credentials (if running it locally, with `http://host.docker.internal:11434/`) and the "Model" used

   c. Click the **Chat** button at the bottom of the canvas and type a message, e.g. 'italiano'




To open n8n at any time, visit <http://localhost:5678/> in your browser.

With your n8n instance, you’ll have access to over 400 integrations and a
suite of basic and advanced AI nodes such as
[AI Agent](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/),
[Text classifier](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.text-classifier/),
and [Information Extractor](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.information-extractor/)
nodes. To keep everything local, just remember to use the Ollama node for your
language model and Qdrant as your vector store.


## Upgrading

* ### For Nvidia GPU setups:

```bash
docker compose --profile gpu-nvidia pull
docker compose create && docker compose --profile gpu-nvidia up
```

* ### For Mac / Apple Silicon users

```
docker compose pull
docker compose create && docker compose up
```

* ### For Non-GPU setups:

```bash
docker compose --profile cpu pull
docker compose create && docker compose --profile cpu up
```

## 👓 Recommended reading

n8n is full of useful content for getting started quickly with its AI concepts
and nodes. If you run into an issue, go to [support](#support).

- [AI agents for developers: from theory to practice with n8n](https://blog.n8n.io/ai-agents/)
- [Tutorial: Build an AI workflow in n8n](https://docs.n8n.io/advanced-ai/intro-tutorial/)
- [Langchain Concepts in n8n](https://docs.n8n.io/advanced-ai/langchain/langchain-n8n/)
- [Demonstration of key differences between agents and chains](https://docs.n8n.io/advanced-ai/examples/agent-chain-comparison/)
- [What are vector databases?](https://docs.n8n.io/advanced-ai/examples/understand-vector-databases/)

## 🎥 Video walkthrough

- [Installing and using Local AI for n8n](https://www.youtube.com/watch?v=xz_X2N-hPg0)

## 🛍️ More AI templates

For more AI workflow ideas, visit the [**official n8n AI template
gallery**](https://n8n.io/workflows/?categories=AI). From each workflow,
select the **Use workflow** button to automatically import the workflow into
your local n8n instance.

### Learn AI key concepts

- [AI Agent Chat](https://n8n.io/workflows/1954-ai-agent-chat/)
- [AI chat with any data source (using the n8n workflow too)](https://n8n.io/workflows/2026-ai-chat-with-any-data-source-using-the-n8n-workflow-tool/)
- [Chat with OpenAI Assistant (by adding a memory)](https://n8n.io/workflows/2098-chat-with-openai-assistant-by-adding-a-memory/)
- [Use an open-source LLM (via Hugging Face)](https://n8n.io/workflows/1980-use-an-open-source-llm-via-huggingface/)
- [Chat with PDF docs using AI (quoting sources)](https://n8n.io/workflows/2165-chat-with-pdf-docs-using-ai-quoting-sources/)
- [AI agent that can scrape webpages](https://n8n.io/workflows/2006-ai-agent-that-can-scrape-webpages/)



## More information

Refer to our [documentation on creating nodes](https://docs.n8n.io/integrations/creating-nodes/) for detailed information on building your own nodes.



