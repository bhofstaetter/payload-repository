import type {BasePayload, GlobalSlug} from 'payload';
import {GlobalRepository, type GlobalTransformers} from '@/global/GlobalRepository.js';
import type {AnyGlobalConfig} from '@/types.js';

export abstract class GlobalOperations<TConfig extends AnyGlobalConfig, TSlug extends GlobalSlug> {
    protected readonly repository: GlobalRepository<TConfig, TSlug>;

    protected constructor(payload: BasePayload, globalSlug: TSlug, transformers?: GlobalTransformers<TConfig, TSlug>) {
        this.repository = new GlobalRepository(payload, globalSlug, transformers);
    }
}
