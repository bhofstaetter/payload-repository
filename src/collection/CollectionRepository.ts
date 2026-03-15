import type {
    BasePayload,
    BulkOperationResult,
    CollectionSlug,
    DataFromCollectionSlug,
    DefaultDocumentIDType,
    PaginatedDistinctDocs,
    PaginatedDocs,
    RequiredDataFromCollectionSlug,
    SelectType,
    TransformCollectionWithSelect,
    TypeWithVersion,
    Where,
} from 'payload';
import type {DeepPartial} from 'ts-essentials';
import {applyTransformer} from '@/transfomer.js';
import type {AnyCollectionConfig, OperationsTransformerMap, Transformer} from '@/types.js';

export interface CollectionTransformers<TConfig extends AnyCollectionConfig, TSlug extends CollectionSlug>
    extends OperationsTransformerMap {
    create?: {
        data?: Transformer<CreateData<TSlug>>;
        options?: Transformer<CreateOptions<TConfig, TSlug>>;
    };
    update?: {
        where?: Transformer<Where>;
        data?: Transformer<UpdateData<TSlug>>;
        options?: Transformer<UpdateOptions<TConfig, TSlug>>;
    };
    updateById?: {
        data?: Transformer<UpdateData<TSlug>>;
        options?: Transformer<UpdateByIdOptions<TConfig, TSlug>>;
    };
    updateByIds?: {
        data?: Transformer<UpdateData<TSlug>>;
        options?: Transformer<UpdateOptions<TConfig, TSlug>>;
    };
    duplicate?: {
        options?: Transformer<DuplicateOptions<TConfig, TSlug>>;
    };
    find?: {
        where?: Transformer<Where>;
        options?: Transformer<FindOptions<TConfig, TSlug>>;
    };
    findById?: {
        options?: Transformer<FindByIdOptions<TConfig, TSlug>>;
    };
    findByIds?: {
        options?: Transformer<FindOptions<TConfig, TSlug>>;
    };
    findDistinct?: {
        options?: Transformer<FindDistinctOptions>;
    };
    findVersionById?: {
        options?: Transformer<FindVersionByIdOptions>;
    };
    findVersions?: {
        options?: Transformer<FindVersionsOptions>;
    };
    count?: {
        options?: Transformer<CountOptions>;
    };
    countVersions?: {
        options?: Transformer<CollectionCountVersionsOptions>;
    };
    delete?: {
        where?: Transformer<Where>;
        options?: Transformer<DeleteOptions<TConfig, TSlug>>;
    };
    deleteById?: {
        options?: Transformer<DeleteOptions<TConfig, TSlug>>;
    };
    deleteByIds?: {
        options?: Transformer<DeleteOptions<TConfig, TSlug>>;
    };
}

export class CollectionRepository<TConfig extends AnyCollectionConfig, TSlug extends CollectionSlug> {
    protected readonly payload: BasePayload;
    protected readonly collectionSlug: TSlug;
    protected readonly transformers?: CollectionTransformers<TConfig, TSlug>;

    constructor(payload: BasePayload, collectionSlug: TSlug, transformers?: CollectionTransformers<TConfig, TSlug>) {
        this.payload = payload;
        this.collectionSlug = collectionSlug;
        this.transformers = transformers;
    }

    create<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        data: RequiredDataFromCollectionSlug<TSlug>,
        options?: CreateOptions<TConfig, TSlug, TSelect> & {draft?: false},
    ): Promise<SelectResult<TSlug, TSelect>>;
    create<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        data: DraftDataFromCollectionSlug<TSlug>,
        options: CreateOptions<TConfig, TSlug, TSelect> & {draft: true},
    ): Promise<SelectResult<TSlug, TSelect>>;
    async create<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        data: RequiredDataFromCollectionSlug<TSlug> | DraftDataFromCollectionSlug<TSlug>,
        options?: CreateOptions<TConfig, TSlug, TSelect> & {draft?: boolean},
    ): Promise<SelectResult<TSlug, TSelect>> {
        const transformedData = await applyTransformer(this.transformers?.create?.data, data);
        const {draft, ...createOptions} = options ?? {};
        const transformedOptions = await applyTransformer(this.transformers?.create?.options, createOptions);

        if (draft) {
            return this.payload.create({
                collection: this.collectionSlug,
                data: transformedData as DraftDataFromCollectionSlug<TSlug>,
                draft: true,
                ...transformedOptions,
            }) as Promise<SelectResult<TSlug, TSelect>>;
        }

        const hasDrafts = this.hasDrafts();
        const createData = hasDrafts
            ? ({...transformedData, _status: 'published'} as RequiredDataFromCollectionSlug<TSlug>)
            : (transformedData as RequiredDataFromCollectionSlug<TSlug>);

        return this.payload.create({
            collection: this.collectionSlug,
            data: createData,
            ...transformedOptions,
        }) as Promise<SelectResult<TSlug, TSelect>>;
    }

    async duplicate<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        options?: DuplicateOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        const transformedOptions = await applyTransformer(this.transformers?.duplicate?.options, options);

        return this.payload.duplicate({
            collection: this.collectionSlug,
            id,
            ...transformedOptions,
        }) as Promise<SelectResult<TSlug, TSelect>>;
    }

    async find<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        where: Where,
        options?: FindOptions<TConfig, TSlug, TSelect>,
    ): Promise<PaginatedSelectResult<TSlug, TSelect>> {
        const transformedOptions = await applyTransformer(this.transformers?.find?.options, options);
        const transformedWhere = await applyTransformer(this.transformers?.find?.where, where);

        return this.payload.find({
            collection: this.collectionSlug,
            where: transformedWhere,
            ...transformedOptions,
        }) as Promise<PaginatedSelectResult<TSlug, TSelect>>;
    }

    async findById<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        options?: FindByIdOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        const transformedOptions = await applyTransformer(this.transformers?.findById?.options, options);

        return this.payload.findByID({
            collection: this.collectionSlug,
            id,
            ...transformedOptions,
        }) as Promise<SelectResult<TSlug, TSelect>>;
    }

    async findByIds<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        ids: DefaultDocumentIDType[],
        options?: FindOptions<TConfig, TSlug, TSelect>,
    ): Promise<PaginatedSelectResult<TSlug, TSelect>> {
        const transformedOptions = await applyTransformer(this.transformers?.findByIds?.options, options);

        return this.payload.find({
            collection: this.collectionSlug,
            where: {id: {in: ids}},
            ...transformedOptions,
        }) as Promise<PaginatedSelectResult<TSlug, TSelect>>;
    }

    async findDistinct<TField extends keyof DataFromCollectionSlug<TSlug> & string>(
        field: TField,
        options?: FindDistinctOptions,
    ): Promise<PaginatedDistinctDocs<Record<TField, DataFromCollectionSlug<TSlug>[TField]>>> {
        const transformedOptions = await applyTransformer(this.transformers?.findDistinct?.options, options);

        return this.payload.findDistinct({
            collection: this.collectionSlug,
            field,
            ...transformedOptions,
        });
    }

    async findVersionById(
        id: TypeWithVersion<unknown>['id'],
        options?: FindVersionByIdOptions,
    ): Promise<TypeWithVersion<DataFromCollectionSlug<TSlug>>> {
        const transformedOptions = await applyTransformer(this.transformers?.findVersionById?.options, options);

        return this.payload.findVersionByID({
            collection: this.collectionSlug,
            id,
            ...transformedOptions,
        });
    }

    async findVersions(
        options?: FindVersionsOptions,
    ): Promise<PaginatedDocs<TypeWithVersion<DataFromCollectionSlug<TSlug>>>> {
        const transformedOptions = await applyTransformer(this.transformers?.findVersions?.options, options);

        return this.payload.findVersions({
            collection: this.collectionSlug,
            ...transformedOptions,
        });
    }

    async count(options?: CountOptions): CountResult {
        const transformedOptions = await applyTransformer(this.transformers?.count?.options, options);

        return this.payload.count({
            collection: this.collectionSlug,
            ...transformedOptions,
        });
    }

    async countVersions(options?: CollectionCountVersionsOptions): CountVersionsResult {
        const transformedOptions = await applyTransformer(this.transformers?.countVersions?.options, options);

        return this.payload.countVersions({
            collection: this.collectionSlug,
            ...transformedOptions,
        });
    }

    async update<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        where: Where,
        data: UpdateData<TSlug>,
        options?: UpdateOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        const transformedWhere = await applyTransformer(this.transformers?.update?.where, where);
        const transformedData = await applyTransformer(this.transformers?.update?.data, data);
        const transformedOptions = await applyTransformer(this.transformers?.update?.options, options);

        return this.payload.update({
            collection: this.collectionSlug,
            where: transformedWhere,
            data: transformedData,
            ...transformedOptions,
        }) as Promise<BulkOperationResult<TSlug, TSelect>>;
    }

    async updateById<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        data: UpdateData<TSlug>,
        options?: UpdateByIdOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        const transformedData = await applyTransformer(this.transformers?.updateById?.data, data);
        const transformedOptions = await applyTransformer(this.transformers?.updateById?.options, options);

        return this.payload.update({
            collection: this.collectionSlug,
            id,
            data: transformedData,
            ...transformedOptions,
        }) as Promise<SelectResult<TSlug, TSelect>>;
    }

    async updateByIds<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        ids: DefaultDocumentIDType[],
        data: UpdateData<TSlug>,
        options?: UpdateOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        const transformedData = await applyTransformer(this.transformers?.updateByIds?.data, data);
        const transformedOptions = await applyTransformer(this.transformers?.updateByIds?.options, options);

        return this.payload.update({
            collection: this.collectionSlug,
            where: {id: {in: ids}},
            data: transformedData,
            ...transformedOptions,
        }) as Promise<BulkOperationResult<TSlug, TSelect>>;
    }

    async delete<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        where: Where,
        options?: DeleteOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        const transformedWhere = await applyTransformer(this.transformers?.delete?.where, where);
        const transformedOptions = await applyTransformer(this.transformers?.delete?.options, options);

        return this.payload.delete({
            collection: this.collectionSlug,
            where: transformedWhere,
            ...transformedOptions,
        }) as Promise<BulkOperationResult<TSlug, TSelect>>;
    }

    async deleteById<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        options?: DeleteOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        const transformedOptions = await applyTransformer(this.transformers?.deleteById?.options, options);

        return this.payload.delete({
            collection: this.collectionSlug,
            id,
            ...transformedOptions,
        }) as Promise<SelectResult<TSlug, TSelect>>;
    }

    async deleteByIds<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        ids: DefaultDocumentIDType[],
        options?: DeleteOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        const transformedOptions = await applyTransformer(this.transformers?.deleteByIds?.options, options);

        return this.payload.delete({
            collection: this.collectionSlug,
            where: {id: {in: ids}},
            ...transformedOptions,
        }) as Promise<BulkOperationResult<TSlug, TSelect>>;
    }

    private hasDrafts(): boolean {
        const collection = this.payload.collections[this.collectionSlug];
        return !!collection.config.versions && collection.config.versions.drafts !== false;
    }
}

export type TypedSelect<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
> = TConfig['collectionsSelect'][TSlug & string] & SelectType;

export type SelectResult<
    TSlug extends CollectionSlug,
    TSelect extends SelectType = SelectType,
> = TransformCollectionWithSelect<TSlug, TSelect>;

export type PaginatedSelectResult<
    TSlug extends CollectionSlug,
    TSelect extends SelectType = SelectType,
> = PaginatedDocs<SelectResult<TSlug, TSelect>>;

export type CreateData<TSlug extends CollectionSlug> =
    | RequiredDataFromCollectionSlug<TSlug>
    | DraftDataFromCollectionSlug<TSlug>;
export type DraftDataFromCollectionSlug<TSlug extends CollectionSlug> = Partial<DataFromCollectionSlug<TSlug>>;

export type CreateOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['create']>[0], 'collection' | 'select' | 'data' | 'draft'> & {select?: TSelect};

export type DuplicateOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['duplicate']>[0], 'collection' | 'id' | 'select' | 'data'> & {
    select?: TSelect;
    data?: DeepPartial<RequiredDataFromCollectionSlug<TSlug>>;
};

export type FindByIdOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['findByID']>[0], 'collection' | 'select' | 'id'> & {select?: TSelect};

export type FindOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['find']>[0], 'collection' | 'select' | 'where'> & {select?: TSelect};

export type FindDistinctOptions = Omit<Parameters<BasePayload['findDistinct']>[0], 'collection' | 'field'>;
export type FindVersionByIdOptions = Omit<Parameters<BasePayload['findVersionByID']>[0], 'collection' | 'id'>;
export type FindVersionsOptions = Omit<Parameters<BasePayload['findVersions']>[0], 'collection'>;

export type CountOptions = Omit<Parameters<BasePayload['count']>[0], 'collection'>;
export type CollectionCountVersionsOptions = Omit<Parameters<BasePayload['countVersions']>[0], 'collection'>;
export type CountResult = ReturnType<BasePayload['count']>;
export type CountVersionsResult = ReturnType<BasePayload['countVersions']>;

export type UpdateData<TSlug extends CollectionSlug> = DeepPartial<RequiredDataFromCollectionSlug<TSlug>>;

export type UpdateByIdOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['update']>[0], 'collection' | 'select' | 'id' | 'data'> & {select?: TSelect};

export type UpdateOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['update']>[0], 'collection' | 'select' | 'data' | 'where' | 'id'> & {select?: TSelect};

export type DeleteOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['delete']>[0], 'collection' | 'select' | 'where' | 'id'> & {select?: TSelect};
