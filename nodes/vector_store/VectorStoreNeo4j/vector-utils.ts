import { IExecuteFunctions, INodeProperties, ISupplyDataFunctions } from "n8n-workflow";
import { getNeo4jCredentials, Neo4jVectorStoreArgs } from "../../../common-utils";

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



// todo - CHECK if more fields are needed
export const sharedFields: INodeProperties[] = [
    labelField,
    textField,
    indexNameField,
    embeddingField
];

const embeddingDimensions: INodeProperties = {
    displayName: 'Embedding Dimensions',
    name: 'embeddingDimensions',
    type: 'number',
    default: 1536,
    description: 'The dimension of the embedding',
};

// todo - CHECK if more fields are needed
export const insertFields: INodeProperties[] = [
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
            embeddingDimensions,
            {
                displayName: 'Clear Collection',
                name: 'clearCollection',
                type: 'boolean',
                default: false,
                description: 'Whether to clear the collection before inserting new data',
            },
        ],
    },
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
    //displayOptions: {
}

export const loadFields: INodeProperties[] = [
    retrieveField
]


export const getNeo4jCommonParameters = async (context: IExecuteFunctions | ISupplyDataFunctions, itemIndex: number): Promise<Neo4jVectorStoreArgs> => {

    const credentials = await getNeo4jCredentials(context);
    const embeddingNodeProperty = context.getNodeParameter(embeddingFieldName, itemIndex, embeddingFieldDefault) as string;
    const nodeLabel = context.getNodeParameter(labelFieldName, itemIndex, labelFieldDefault) as string;
    const textNodeProperty = context.getNodeParameter(textFieldName, itemIndex, textFieldDefault) as string;
    const indexName = context.getNodeParameter(indexNameFieldName, itemIndex, indexNameFieldDefault) as string;

    // TODO - other params: Neo4jVectorStoreArgs

    return {...credentials, embeddingNodeProperty, nodeLabel, textNodeProperty, indexName};
}