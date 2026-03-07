import type {BasePayload, CollectionSlug} from 'payload';
import type {AnyCollectionConfig} from '@/types';
import {CollectionRepository} from './CollectionRepository.js';

export abstract class CollectionOperations<TConfig extends AnyCollectionConfig, TSlug extends CollectionSlug> {
    protected readonly repository: CollectionRepository<TConfig, TSlug>;

    protected constructor(payload: BasePayload, collectionSlug: TSlug) {
        this.repository = new CollectionRepository(payload, collectionSlug);
    }
}
