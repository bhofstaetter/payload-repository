import {describe, expect, it} from 'vitest';
import {applyTransformer} from '@/RepositorySupport';

describe('applyTransformer', () => {
    it('returns data unchanged when no transformer is provided', async () => {
        const data = {foo: 'bar'};
        const result = await applyTransformer(undefined, data);

        expect(result).toStrictEqual({foo: 'bar'});
    });

    it('returns undefined when no transformer is provided and data is undefined', async () => {
        const result = await applyTransformer(undefined, undefined);

        expect(result).toBeUndefined();
    });

    it('applies transformer to data', async () => {
        const result = await applyTransformer(data => ({...data, extra: true}), {foo: 'bar'});

        expect(result).toStrictEqual({foo: 'bar', extra: true});
    });

    it('overrides passed values when transformer sets the same keys', async () => {
        const result = await applyTransformer(data => ({...data, foo: 'overridden'}), {foo: 'original'});

        expect(result).toStrictEqual({foo: 'overridden'});
    });

    it('supports async transformers', async () => {
        const result = await applyTransformer(async data => {
            await Promise.resolve();
            return {...data, foo: 'async'};
        }, {foo: 'bar'});

        expect(result).toStrictEqual({foo: 'async'});
    });

    it('passes undefined data to transformer when data is undefined', async () => {
        const result = await applyTransformer(() => ({fallback: true}), undefined);

        expect(result).toStrictEqual({fallback: true});
    });
});
