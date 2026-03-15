import type {
    BasePayload,
    DataFromGlobalSlug,
    GlobalSlug,
    PaginatedDocs,
    SelectType,
    TransformGlobalWithSelect,
    TypeWithVersion,
} from 'payload';
import type {DeepPartial} from 'ts-essentials';
import {applyTransformer} from '@/transfomer.js';
import type {AnyGlobalConfig, OperationsTransformerMap, Transformer} from '@/types.js';

export interface GlobalTransformers<TConfig extends AnyGlobalConfig, TSlug extends GlobalSlug>
    extends OperationsTransformerMap {
    find?: {
        options?: Transformer<FindGlobalOptions<TConfig, TSlug>>;
    };
    findVersionById?: {
        options?: Transformer<FindGlobalVersionByIdOptions>;
    };
    findVersions?: {
        options?: Transformer<FindGlobalVersionsOptions>;
    };
    countVersions?: {
        options?: Transformer<GlobalCountVersionsOptions>;
    };
    update?: {
        data?: Transformer<UpdateGlobalData<TSlug>>;
        options?: Transformer<UpdateGlobalOptions<TConfig, TSlug>>;
    };
}

export class GlobalRepository<TConfig extends AnyGlobalConfig, TSlug extends GlobalSlug> {
    protected readonly payload: BasePayload;
    protected readonly globalSlug: TSlug;
    protected readonly transformers?: GlobalTransformers<TConfig, TSlug>;

    constructor(payload: BasePayload, globalSlug: TSlug, transformers?: GlobalTransformers<TConfig, TSlug>) {
        this.payload = payload;
        this.globalSlug = globalSlug;
        this.transformers = transformers;
    }

    async find<TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>>(
        options?: FindGlobalOptions<TConfig, TSlug, TSelect>,
    ): Promise<GlobalSelectResult<TSlug, TSelect>> {
        const transformedOptions = await applyTransformer(this.transformers?.find?.options, options);

        return this.payload.findGlobal({
            slug: this.globalSlug,
            ...transformedOptions,
        });
    }

    async findVersionById(
        id: TypeWithVersion<unknown>['id'],
        options?: FindGlobalVersionByIdOptions,
    ): Promise<TypeWithVersion<DataFromGlobalSlug<TSlug>>> {
        const transformedOptions = await applyTransformer(this.transformers?.findVersionById?.options, options);

        return this.payload.findGlobalVersionByID({
            slug: this.globalSlug,
            id,
            ...transformedOptions,
        });
    }

    async findVersions(
        options?: FindGlobalVersionsOptions,
    ): Promise<PaginatedDocs<TypeWithVersion<DataFromGlobalSlug<TSlug>>>> {
        const transformedOptions = await applyTransformer(this.transformers?.findVersions?.options, options);

        return this.payload.findGlobalVersions({
            slug: this.globalSlug,
            ...transformedOptions,
        });
    }

    async countVersions(options?: GlobalCountVersionsOptions): CountVersionsResult {
        const transformedOptions = await applyTransformer(this.transformers?.countVersions?.options, options);

        return this.payload.countGlobalVersions({
            global: this.globalSlug,
            ...transformedOptions,
        });
    }

    async update<TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>>(
        data: UpdateGlobalData<TSlug>,
        options?: UpdateGlobalOptions<TConfig, TSlug, TSelect>,
    ): Promise<GlobalSelectResult<TSlug, TSelect>> {
        const transformedData = await applyTransformer(this.transformers?.update?.data, data);
        const transformedOptions = await applyTransformer(this.transformers?.update?.options, options);

        return this.payload.updateGlobal({
            slug: this.globalSlug,
            data: transformedData,
            ...transformedOptions,
        });
    }
}

export type TypedGlobalSelect<
    TConfig extends AnyGlobalConfig,
    TSlug extends GlobalSlug,
> = TConfig['globalsSelect'][TSlug & string] & SelectType;

export type GlobalSelectResult<
    TSlug extends GlobalSlug,
    TSelect extends SelectType = SelectType,
> = TransformGlobalWithSelect<TSlug, TSelect>;

export type FindGlobalOptions<
    TConfig extends AnyGlobalConfig,
    TSlug extends GlobalSlug,
    TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['findGlobal']>[0], 'slug' | 'select'> & {select?: TSelect};

export type FindGlobalVersionByIdOptions = Omit<Parameters<BasePayload['findGlobalVersionByID']>[0], 'slug' | 'id'>;
export type FindGlobalVersionsOptions = Omit<Parameters<BasePayload['findGlobalVersions']>[0], 'slug'>;

export type GlobalCountVersionsOptions = Omit<Parameters<BasePayload['countGlobalVersions']>[0], 'global'>;
export type CountVersionsResult = ReturnType<BasePayload['countGlobalVersions']>;

export type UpdateGlobalData<TSlug extends GlobalSlug> = DeepPartial<Omit<DataFromGlobalSlug<TSlug>, 'id'>>;
export type UpdateGlobalOptions<
    TConfig extends AnyGlobalConfig,
    TSlug extends GlobalSlug,
    TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['updateGlobal']>[0], 'slug' | 'select' | 'data'> & {select?: TSelect};
