import {getTestContext} from '@test/helpers/getTestContext';
import type {Config} from '@test/helpers/payload.test.types';
import type {BasePayload} from 'payload';
import {expect, it} from 'vitest';
import {GlobalOperations} from '@/global/GlobalOperations';

const ctx = getTestContext();

class GlobalUpdate extends GlobalOperations<Config, 'dummy'> {
    constructor(payload: BasePayload) {
        super(payload, 'dummy');
    }

    // methods just for the test setup, normally they do not belong here

    find() {
        return this.repository.find();
    }

    // update methods

    update(foo: string, bar: number) {
        return this.repository.update({foo, bar});
    }
}

it('updates the global', async () => {
    // prepare
    const globalUpdate = new GlobalUpdate(ctx.payload);
    const original = await globalUpdate.find();

    // test
    const result = await globalUpdate.update('new-foo', 99);

    // verify
    expect(original.foo).not.toStrictEqual('new-foo');
    expect(result.foo).toStrictEqual('new-foo');
    expect(result.bar).toStrictEqual(99);
});
