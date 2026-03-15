export type AnyCollectionConfig = {collectionsSelect: Record<string, unknown>};
export type AnyGlobalConfig = {globalsSelect: Record<string, unknown>};
export type Transformer<T> = (value: T) => T | Promise<T>;
export type OperationsTransformerMap = Record<TransformerMethodName, ArgumentTransformerMap | undefined>;

type TransformerArgumentName = string;
type TransformerMethodName = string;
type ArgumentTransformerMap = Record<TransformerArgumentName, Transformer<any> | undefined>;
