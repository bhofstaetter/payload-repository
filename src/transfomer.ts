import type {OperationsTransformerMap, Transformer} from '@/types.js';

export async function applyTransformer<T>(transformer: Transformer<T> | undefined, data: T): Promise<T>;
export async function applyTransformer<T>(
    transformer: Transformer<T> | undefined,
    data: T | undefined,
): Promise<T | undefined>;
export async function applyTransformer<T>(
    transformer: Transformer<T> | undefined,
    data: T | undefined,
): Promise<T | undefined> {
    if (transformer) {
        return transformer(data as T);
    }

    return data;
}

export function mergeTransformers<T extends OperationsTransformerMap>(...maps: T[]): T {
    if (maps.length <= 1) {
        return maps[0];
    }

    const mergedOperationsTransformerMap: OperationsTransformerMap = {};

    for (const map of maps) {
        const operationTransformers = Object.entries(map);

        for (const [operation, argumentTransformers] of operationTransformers) {
            if (!argumentTransformers) {
                continue;
            }

            mergedOperationsTransformerMap[operation] ??= {};

            for (const [argument, transformer] of Object.entries(argumentTransformers)) {
                if (!transformer) {
                    continue;
                }

                const existingArgumentTransformer = mergedOperationsTransformerMap[operation][argument];

                if (existingArgumentTransformer) {
                    mergedOperationsTransformerMap[operation][argument] = chainTransformers(
                        existingArgumentTransformer,
                        transformer,
                    );
                } else {
                    mergedOperationsTransformerMap[operation][argument] = transformer;
                }
            }
        }
    }

    return mergedOperationsTransformerMap as T;
}

function chainTransformers<T>(...transformers: Transformer<T>[]): Transformer<T> {
    if (transformers.length <= 1) {
        return transformers[0];
    }

    return async (value: T) => {
        let result = value;

        for (const transformer of transformers) {
            result = await transformer(result);
        }

        return result;
    };
}
