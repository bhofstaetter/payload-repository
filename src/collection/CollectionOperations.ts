import type {BasePayload, CollectionSlug} from 'payload';
import type {AnyCollectionConfig} from '@/types.js';
import {CollectionRepository, type CollectionTransformers} from './CollectionRepository.js';

export abstract class CollectionOperations<TConfig extends AnyCollectionConfig, TSlug extends CollectionSlug> {
    protected readonly repository: CollectionRepository<TConfig, TSlug>;

    protected constructor(
        payload: BasePayload,
        collectionSlug: TSlug,
        transformers?: CollectionTransformers<TConfig, TSlug>,
    ) {
        this.repository = new CollectionRepository(payload, collectionSlug, transformers);
    }
}
