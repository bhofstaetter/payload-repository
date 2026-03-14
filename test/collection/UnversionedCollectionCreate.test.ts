import {getTestContext} from '@test/helpers/getTestContext';
import type {Config} from '@test/helpers/payload.test.types';
import type {BasePayload} from 'payload';
import {expect, it} from 'vitest';
import {CollectionOperations} from '@/collection/CollectionOperations';

const ctx = getTestContext();

class UnversionedCollectionCreate extends CollectionOperations<Config, 'unversioned'> {
    constructor(payload: BasePayload) {
        super(payload, 'unversioned');
    }

    create() {
        return this.repository.create({foo: 'foo'});
    }

    createDraft() {
        return this.repository.create({bar: 1}, {draft: true});
    }
}

it('creates a published document', async () => {
    // prepare
    const collectionCreate = new UnversionedCollectionCreate(ctx.payload);

    // test
    const created = await collectionCreate.create();

    // verify
    expect(created.id).toBeDefined();
    expect(created.foo).toStrictEqual('foo');
    expect(created.bar).toStrictEqual(null);
    expect(created).not.toHaveProperty('_status');
});
