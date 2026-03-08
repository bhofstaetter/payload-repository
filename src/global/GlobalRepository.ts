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
import type {AnyGlobalConfig} from '@/types';

export class GlobalRepository<TConfig extends AnyGlobalConfig, TSlug extends GlobalSlug> {
    protected readonly payload: BasePayload;
    protected readonly globalSlug: TSlug;

    constructor(payload: BasePayload, globalSlug: TSlug) {
        this.payload = payload;
        this.globalSlug = globalSlug;
    }

    async find<TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>>(
        options?: FindGlobalOptions<TConfig, TSlug, TSelect>,
    ): Promise<GlobalSelectResult<TSlug, TSelect>> {
        return this.payload.findGlobal({
            slug: this.globalSlug,
            ...options,
        });
    }

    async findVersionById(
        id: TypeWithVersion<unknown>['id'],
        options?: FindGlobalVersionByIdOptions,
    ): Promise<TypeWithVersion<DataFromGlobalSlug<TSlug>>> {
        return this.payload.findGlobalVersionByID({
            slug: this.globalSlug,
            id,
            ...options,
        });
    }

    async findVersions(
        options?: FindGlobalVersionsOptions,
    ): Promise<PaginatedDocs<TypeWithVersion<DataFromGlobalSlug<TSlug>>>> {
        return this.payload.findGlobalVersions({
            slug: this.globalSlug,
            ...options,
        });
    }

    async countVersions(options?: GlobalCountVersionsOptions): CountVersionsResult {
        return this.payload.countGlobalVersions({
            global: this.globalSlug,
            ...options,
        });
    }

    async update<TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>>(
        data: UpdateGlobalData<TSlug>,
        options?: UpdateGlobalOptions<TConfig, TSlug, TSelect>,
    ): Promise<GlobalSelectResult<TSlug, TSelect>> {
        return this.payload.updateGlobal({
            slug: this.globalSlug,
            data,
            ...options,
        });
    }
}

type TypedGlobalSelect<TConfig extends AnyGlobalConfig, TSlug extends GlobalSlug> = TConfig['globalsSelect'][TSlug &
    string] &
    SelectType;

type GlobalSelectResult<TSlug extends GlobalSlug, TSelect extends SelectType = SelectType> = TransformGlobalWithSelect<
    TSlug,
    TSelect
>;

type FindGlobalOptions<
    TConfig extends AnyGlobalConfig,
    TSlug extends GlobalSlug,
    TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['findGlobal']>[0], 'slug' | 'select'> & {select?: TSelect};

type FindGlobalVersionByIdOptions = Omit<Parameters<BasePayload['findGlobalVersionByID']>[0], 'slug' | 'id'>;
type FindGlobalVersionsOptions = Omit<Parameters<BasePayload['findGlobalVersions']>[0], 'slug'>;

type GlobalCountVersionsOptions = Omit<Parameters<BasePayload['countGlobalVersions']>[0], 'global'>;
type CountVersionsResult = ReturnType<BasePayload['countGlobalVersions']>;

type UpdateGlobalData<TSlug extends GlobalSlug> = DeepPartial<Omit<DataFromGlobalSlug<TSlug>, 'id'>>;
type UpdateGlobalOptions<
    TConfig extends AnyGlobalConfig,
    TSlug extends GlobalSlug,
    TSelect extends TypedGlobalSelect<TConfig, TSlug> = TypedGlobalSelect<TConfig, TSlug>,
> = Omit<Parameters<BasePayload['updateGlobal']>[0], 'slug' | 'select' | 'data'> & {select?: TSelect};
