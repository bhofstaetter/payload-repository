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
import type {AnyCollectionConfig} from '@/types';

export class CollectionRepository<TConfig extends AnyCollectionConfig, TSlug extends CollectionSlug> {
    protected readonly payload: BasePayload;
    protected readonly collectionSlug: TSlug;

    constructor(payload: BasePayload, collectionSlug: TSlug) {
        this.payload = payload;
        this.collectionSlug = collectionSlug;
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
        const {draft, ...createOptions} = options ?? {};

        if (draft) {
            return this.payload.create({
                collection: this.collectionSlug,
                data: data as DraftDataFromCollectionSlug<TSlug>,
                draft: true,
                ...createOptions,
            });
        }

        return this.payload.create({
            collection: this.collectionSlug,
            data: {...data, _status: 'published'} as RequiredDataFromCollectionSlug<TSlug>,
            ...createOptions,
        });
    }

    async duplicate<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        options?: DuplicateOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        return this.payload.duplicate({
            collection: this.collectionSlug,
            id,
            ...options,
        });
    }

    async find<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        options?: FindOptions<TConfig, TSlug, TSelect>,
    ): Promise<PaginatedSelectResult<TSlug, TSelect>> {
        return this.payload.find({
            collection: this.collectionSlug,
            ...options,
        });
    }

    async findById<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        options?: FindByIdOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        return this.payload.findByID({
            collection: this.collectionSlug,
            id,
            ...options,
        });
    }

    async findByIds<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        ids: DefaultDocumentIDType[],
        options?: FindOptions<TConfig, TSlug, TSelect>,
    ): Promise<PaginatedSelectResult<TSlug, TSelect>> {
        return this.payload.find({
            collection: this.collectionSlug,
            where: {id: {in: ids}},
            ...options,
        });
    }

    async findDistinct<TField extends keyof DataFromCollectionSlug<TSlug> & string>(
        field: TField,
        options?: FindDistinctOptions,
    ): Promise<PaginatedDistinctDocs<Record<TField, DataFromCollectionSlug<TSlug>[TField]>>> {
        return this.payload.findDistinct({
            collection: this.collectionSlug,
            field,
            ...options,
        });
    }

    async findVersionById(
        id: TypeWithVersion<unknown>['id'],
        options?: FindVersionByIdOptions,
    ): Promise<TypeWithVersion<DataFromCollectionSlug<TSlug>>> {
        return this.payload.findVersionByID({
            collection: this.collectionSlug,
            id,
            ...options,
        });
    }

    async findVersions(
        options?: FindVersionsOptions,
    ): Promise<PaginatedDocs<TypeWithVersion<DataFromCollectionSlug<TSlug>>>> {
        return this.payload.findVersions({
            collection: this.collectionSlug,
            ...options,
        });
    }

    async count(options?: CountOptions): CountResult {
        return this.payload.count({
            collection: this.collectionSlug,
            ...options,
        });
    }

    async countVersions(options?: CollectionCountVersionsOptions): CountVersionsResult {
        return this.payload.countVersions({
            collection: this.collectionSlug,
            ...options,
        });
    }

    async update<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        where: Where,
        data: UpdateData<TSlug>,
        options?: UpdateOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        return this.payload.update({
            collection: this.collectionSlug,
            where,
            data,
            ...options,
        });
    }

    async updateById<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        data: UpdateData<TSlug>,
        options?: UpdateByIdOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        return this.payload.update({
            collection: this.collectionSlug,
            id,
            data,
            ...options,
        });
    }

    async updateByIds<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        ids: DefaultDocumentIDType[],
        data: UpdateData<TSlug>,
        options?: UpdateOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        return this.payload.update({
            collection: this.collectionSlug,
            where: {id: {in: ids}},
            data,
            ...options,
        });
    }

    async delete<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        where: Where,
        options?: DeleteOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        return this.payload.delete({
            collection: this.collectionSlug,
            where,
            ...options,
        });
    }

    async deleteById<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        id: DefaultDocumentIDType,
        options?: DeleteOptions<TConfig, TSlug, TSelect>,
    ): Promise<SelectResult<TSlug, TSelect>> {
        return this.payload.delete({
            collection: this.collectionSlug,
            id,
            ...options,
        });
    }

    async deleteByIds<TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>>(
        ids: DefaultDocumentIDType[],
        options?: DeleteOptions<TConfig, TSlug, TSelect>,
    ): Promise<BulkOperationResult<TSlug, TSelect>> {
        return this.payload.delete({
            collection: this.collectionSlug,
            where: {id: {in: ids}},
            ...options,
        });
    }
}

type TypedSelect<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
> = TConfig['collectionsSelect'][TSlug & string] & SelectType;

type SelectResult<
    TSlug extends CollectionSlug,
    TSelect extends SelectType = SelectType,
> = TransformCollectionWithSelect<TSlug, TSelect>;

type PaginatedSelectResult<TSlug extends CollectionSlug, TSelect extends SelectType = SelectType> = PaginatedDocs<
    SelectResult<TSlug, TSelect>
>;

type DraftDataFromCollectionSlug<TSlug extends CollectionSlug> = Partial<DataFromCollectionSlug<TSlug>>;

type CreateOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['create']>[0], 'collection' | 'select' | 'data' | 'draft'> & {select?: TSelect};

type DuplicateOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['duplicate']>[0], 'collection' | 'id' | 'select' | 'data'> & {
    select?: TSelect;
    data?: DeepPartial<RequiredDataFromCollectionSlug<TSlug>>;
};

type FindByIdOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['findByID']>[0], 'collection' | 'select' | 'id'> & {select?: TSelect};

type FindOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['find']>[0], 'collection' | 'select' | 'where'> & {select?: TSelect};

type FindDistinctOptions = Omit<Parameters<BasePayload['findDistinct']>[0], 'collection' | 'field'>;
type FindVersionByIdOptions = Omit<Parameters<BasePayload['findVersionByID']>[0], 'collection' | 'id'>;
type FindVersionsOptions = Omit<Parameters<BasePayload['findVersions']>[0], 'collection'>;

type CountOptions = Omit<Parameters<BasePayload['count']>[0], 'collection'>;
type CollectionCountVersionsOptions = Omit<Parameters<BasePayload['countVersions']>[0], 'collection'>;
type CountResult = ReturnType<BasePayload['count']>;
type CountVersionsResult = ReturnType<BasePayload['countVersions']>;

type UpdateData<TSlug extends CollectionSlug> = DeepPartial<RequiredDataFromCollectionSlug<TSlug>>;

type UpdateByIdOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['update']>[0], 'collection' | 'select' | 'id' | 'data'> & {select?: TSelect};

type UpdateOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['update']>[0], 'collection' | 'select' | 'data' | 'where' | 'id'> & {select?: TSelect};

type DeleteOptions<
    TConfig extends AnyCollectionConfig,
    TSlug extends CollectionSlug,
    TSelect extends TypedSelect<TConfig, TSlug> = TypedSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['delete']>[0], 'collection' | 'select' | 'where' | 'id'> & {select?: TSelect};
