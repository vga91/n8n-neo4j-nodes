import { IExecuteFunctions, INodeProperties, ISupplyDataFunctions } from "n8n-workflow";
import { getNeo4jCredentials, Neo4jVectorStoreArgs } from "../../../common-utils";
import { IndexType, SearchType } from "@langchain/community/vectorstores/neo4j_vector";

const embeddingFieldName = 'embedding';
const embeddingFieldDefault = 'embedding';
const embeddingField: INodeProperties = {
    displayName: 'Embedding',
    name: embeddingFieldName,
    type: 'string',
    default: embeddingFieldDefault,
    description: 'The property key of the node containing embedding',
    required: true,
};

const labelFieldName = 'label';
const labelFieldDefault = 'Document';
const labelField: INodeProperties = {
    displayName: 'Label',
    name: labelFieldName,
    type: 'string',
    default: labelFieldDefault,
    description: 'The label of the node used to store the embedding',
    placeholder: 'Document',
}

const textFieldName = 'textNodeProperty';
const textFieldDefault = 'text';
const textField: INodeProperties = {
    displayName: 'Text',
    name: textFieldName,
    type: 'string',
    default: textFieldDefault,
    description: 'The property key of the node containing text',
    placeholder: 'text',
}

const indexNameFieldName = 'indexName';
const indexNameFieldDefault = 'vector';
const indexNameField: INodeProperties = {
    displayName: 'Index Name',
    name: indexNameFieldName,
    type: 'string',
    default: indexNameFieldDefault,
    description: 'The name of the vector index to use',
    placeholder: 'vector',
}

const keywodkIndexNameFieldName = 'keywordIndexName';
const keywordIndexNameFieldDefault = 'keyword';
const keywordIndexNameField: INodeProperties = {
    displayName: 'Keyword Index Name',
    name: keywodkIndexNameFieldName,
    type: 'string',
    default: keywordIndexNameFieldDefault,
    description: 'The name of the keyword index to use',
    placeholder: 'keyword'
}

const preDeleteCollectionFieldName = 'preDeleteCollection';
const preDeleteCollectionFieldDefault = false;
const preDeleteCollectionField: INodeProperties = {
    displayName: 'Pre Delete Collection',
    name: preDeleteCollectionFieldName,
    type: 'boolean',
    default: preDeleteCollectionFieldDefault,
    description: 'Whether to delete the collection before inserting new data',
    placeholder: 'false',
}

const databaseFieldName = 'database';
const databaseFieldDefault = 'neo4j';
const databaseField: INodeProperties = {
    displayName: 'Database',
    name: databaseFieldName,
    type: 'string',
    default: databaseFieldDefault,
    description: 'The name of the database to use',
    placeholder: 'neo4j'
}

// export type SearchType = "vector" | "hybrid";
const searchTypeFieldName = 'searchType';
const searchTypeFieldDefault = "vector";
const searchTypeField: INodeProperties = {
    displayName: 'Search Type',
    name: searchTypeFieldName,
    type: 'options',
    options: [
        {
            name: 'Vector',
            value: "vector",
            description: 'Use vector search',
        },
        {
            name: 'Hybrid',
            value: "hybrid",
            description: 'Use hybrid search',
        },
    ],
    default: searchTypeFieldDefault,
    description: 'The type of search to use',
    placeholder: 'vector',
}


const indexTypeFieldName = 'indexType';
const indexTypeFieldDefault = "NODE";
const indexTypeField: INodeProperties = {
    displayName: 'Index Type',
    name: indexTypeFieldName,
    type: 'options',
    options: [
        {
            name: 'Node',
            value: "NODE",
            description: 'Use node index',
        },
        {
            name: 'Relationship',
            value: "RELATIONSHIP",
            description: 'Use relationship index',
        },
    ],
    default: indexTypeFieldDefault,
    description: 'The type of index to use',
    placeholder: 'NODE',
}

const createIdIndexFieldName = 'createIdIndex';
const createIdIndexFieldDefault = true;
const createIdIndexField: INodeProperties = {
    displayName: 'Create ID Index',
    name: createIdIndexFieldName,
    type: 'boolean',
    default: createIdIndexFieldDefault,
    description: 'Whether to create an ID index for the entity',
    placeholder: 'true',
}

export const sharedFields: INodeProperties[] = [
    labelField,
    textField,
    indexNameField,
    embeddingField,
    databaseField,
    indexTypeField,
];

// TODO - check if migth be worth an 'options' field
export const insertFields: INodeProperties[] = [
    createIdIndexField,
    preDeleteCollectionField,
    // {
    //     displayName: 'Options',
    //     name: 'options',
    //     type: 'collection',
    //     placeholder: '...',
    //     default: {},
    //     options: [
    //         field1, field2, ...
    //     ],
    // },
];

export const retrievalQueryName = 'retrievalQuery';
export const retievalQueryDefault = 'return node.text AS text, properties(node) AS metadata, score';
const retrieveField: INodeProperties = {
    displayName: 'Retrieval Query',
    name: retrievalQueryName,
    type: 'string',
    default: retievalQueryDefault,
    description: 'The query to use for retrieval, e.g. "return node.text AS text, properties(node) AS metadata, score". See <a href="https://js.langchain.com/docs/integrations/vectorstores/neo4jvector/#use-retrievalquery-parameter-to-customize-responses">Neo4j documentation</a> for more details.',
    placeholder: 'return node.text AS text, properties(node) AS metadata, score',
}

export const loadFields: INodeProperties[] = [
    retrieveField,
    keywordIndexNameField,
    searchTypeField,
]


export const getNeo4jCommonParameters = async (context: IExecuteFunctions | ISupplyDataFunctions, itemIndex: number): Promise<Neo4jVectorStoreArgs> => {

    const credentials = await getNeo4jCredentials(context);
    const embeddingNodeProperty = context.getNodeParameter(embeddingFieldName, itemIndex, embeddingFieldDefault) as string;
    const nodeLabel = context.getNodeParameter(labelFieldName, itemIndex, labelFieldDefault) as string;
    const textNodeProperty = context.getNodeParameter(textFieldName, itemIndex, textFieldDefault) as string;
    const indexName = context.getNodeParameter(indexNameFieldName, itemIndex, indexNameFieldDefault) as string;
    const keywordIndexName = context.getNodeParameter(keywodkIndexNameFieldName, itemIndex, keywordIndexNameFieldDefault) as string;
    const database = context.getNodeParameter(databaseFieldName, itemIndex, databaseFieldDefault) as string;
    const searchType = context.getNodeParameter(searchTypeFieldName, itemIndex, searchTypeFieldDefault) as SearchType;
    const indexType = context.getNodeParameter(indexTypeFieldName, itemIndex, indexTypeFieldDefault) as IndexType;
    const preDeleteCollection = context.getNodeParameter(preDeleteCollectionFieldName, itemIndex, preDeleteCollectionFieldDefault) as boolean;
    const createIdIndex = context.getNodeParameter(createIdIndexFieldName, itemIndex, createIdIndexFieldDefault) as boolean;
    const retrievalQuery = context.getNodeParameter(retrievalQueryName, itemIndex, retievalQueryDefault) as string;

    return {
        ...credentials,
        embeddingNodeProperty,
        nodeLabel,
        textNodeProperty,
        indexName,
        database,
        keywordIndexName,
        searchType,
        indexType,
        preDeleteCollection,
        createIdIndex,
        retrievalQuery
    };
}