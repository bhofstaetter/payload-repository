import {getTestContext} from '@test/helpers/getTestContext';
import type {Config} from '@test/helpers/payload.test.types';
import type {BasePayload} from 'payload';
import {expect, it} from 'vitest';
import {CollectionOperations} from '@/collection/CollectionOperations';

const ctx = getTestContext();

class CollectionDuplicate extends CollectionOperations<Config, 'dummies'> {
    constructor(payload: BasePayload) {
        super(payload, 'dummies');
    }

    // methods just for the test setup, normally they do not belong here

    create() {
        return this.repository.create({foo: 'foo'});
    }

    // duplicate methods

    duplicate(id: number) {
        return this.repository.duplicate(id);
    }

    duplicateWithOverrides(id: number) {
        return this.repository.duplicate(id, {draft: true, data: {bar: 2}});
    }
}

it('duplicates a document', async () => {
    // prepare
    const collectionDuplicate = new CollectionDuplicate(ctx.payload);
    const created = await collectionDuplicate.create();

    // test
    const duplicated = await collectionDuplicate.duplicate(created.id);

    // verify
    expect(created.id).toBeDefined();
    expect(duplicated.id).toBeDefined();

    expect(duplicated.id).not.toStrictEqual(created.id);

    expect(duplicated._status).toStrictEqual(created._status);
    expect(duplicated.foo).toStrictEqual(duplicated.foo);
});

it('duplicates a document with overrides', async () => {
    // prepare
    const collectionDuplicate = new CollectionDuplicate(ctx.payload);
    const created = await collectionDuplicate.create();

    // test
    const duplicated = await collectionDuplicate.duplicateWithOverrides(created.id);

    // verify
    expect(created.id).toBeDefined();
    expect(duplicated.id).toBeDefined();

    expect(duplicated.id).not.toStrictEqual(created.id);

    expect(created._status).toStrictEqual('published');
    expect(duplicated._status).toStrictEqual('draft');

    expect(created.bar).toStrictEqual(null);
    expect(duplicated.bar).toStrictEqual(2);
});
