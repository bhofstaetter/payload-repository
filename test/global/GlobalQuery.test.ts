import {getTestContext} from '@test/helpers/getTestContext';
import type {Config} from '@test/helpers/payload.test.types';
import type {BasePayload} from 'payload';
import {expect, it} from 'vitest';
import {GlobalOperations} from '@/global/GlobalOperations';

const ctx = getTestContext();

class GlobalQuery extends GlobalOperations<Config, 'dummy'> {
    constructor(payload: BasePayload) {
        super(payload, 'dummy');
    }

    // methods just for the test setup, normally they do not belong here

    update(foo: string) {
        return this.repository.update({foo});
    }

    // query methods

    find() {
        return this.repository.find();
    }

    findVersions() {
        return this.repository.findVersions();
    }

    findVersionById(id: string) {
        return this.repository.findVersionById(id);
    }
}

it('finds the global', async () => {
    // prepare
    const globalQuery = new GlobalQuery(ctx.payload);

    // test
    const result = await globalQuery.find();

    // verify
    expect(result.id).toBeDefined();
});

it('finds a version by its id', async () => {
    // prepare
    const globalQuery = new GlobalQuery(ctx.payload);

    await globalQuery.update('foo 2');
    await globalQuery.update('foo 3');

    // test
    const secondVersion = await globalQuery.findVersions().then(page => page.docs[1]);
    const result = await globalQuery.findVersionById(secondVersion.id);

    // verify
    expect(result.version.foo).toStrictEqual('foo 2');
});
