import {getTestContext} from '@test/helpers/getTestContext';
import type {Config} from '@test/helpers/payload.test.types';
import type {BasePayload} from 'payload';
import {expect, it} from 'vitest';
import {CollectionOperations} from '@/collection/CollectionOperations';
import type {CollectionTransformers} from '@/collection/CollectionRepository';

const ctx = getTestContext();

class TransformedCollection extends CollectionOperations<Config, 'dummies'> {
    constructor(payload: BasePayload, transformers: CollectionTransformers<Config, 'dummies'>) {
        super(payload, 'dummies', transformers);
    }

    create(foo: string) {
        return this.repository.create({foo});
    }

    find(where: Parameters<TransformedCollection['repository']['find']>[0]) {
        return this.repository.find(where);
    }

    findById(id: number) {
        return this.repository.findById(id);
    }

    findByIds(ids: number[]) {
        return this.repository.findByIds(ids);
    }

    findDistinct() {
        return this.repository.findDistinct('foo');
    }

    findVersionById(id: string) {
        return this.repository.findVersionById(id);
    }

    findVersions() {
        return this.repository.findVersions();
    }

    count(options?: Parameters<TransformedCollection['repository']['count']>[0]) {
        return this.repository.count(options);
    }

    countVersions() {
        return this.repository.countVersions();
    }

    update(
        where: Parameters<TransformedCollection['repository']['update']>[0],
        data: Parameters<TransformedCollection['repository']['update']>[1],
    ) {
        return this.repository.update(where, data);
    }

    updateById(id: number, foo: string) {
        return this.repository.updateById(id, {foo});
    }

    updateByIds(ids: number[], foo: string) {
        return this.repository.updateByIds(ids, {foo});
    }

    delete(where: Parameters<TransformedCollection['repository']['delete']>[0]) {
        return this.repository.delete(where);
    }

    deleteById(id: number) {
        return this.repository.deleteById(id);
    }

    deleteByIds(ids: number[]) {
        return this.repository.deleteByIds(ids);
    }

    duplicate(id: number) {
        return this.repository.duplicate(id);
    }
}

it('transforms create data', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 42}),
        },
    });

    const result = await collection.create('hello');

    expect(result.foo).toStrictEqual('hello');
    expect(result.bar).toStrictEqual(42);
});

it('transforms create options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 42}),
            options: options => ({...options, select: {bar: true}}),
        },
    });

    const result = await collection.create('hello');

    expect(result.foo).toBeUndefined();
    expect(result.bar).toStrictEqual(42);
});

it('transforms find where', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        find: {
            where: () => ({foo: {equals: 'target'}}),
        },
    });

    await collection.create('target');
    await collection.create('other');

    const result = await collection.find({});

    expect(result.totalDocs).toStrictEqual(1);
    expect(result.docs[0].foo).toStrictEqual('target');
});

it('transforms find options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        find: {
            options: options => ({...options, limit: 1}),
        },
    });

    await collection.create('a');
    await collection.create('b');
    await collection.create('c');

    const result = await collection.find({});

    expect(result.docs).toHaveLength(1);
});

it('transforms findById options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        findById: {
            options: options => ({...options, select: {foo: true}}),
        },
    });

    const created = await collection.create('hello');
    const result = await collection.findById(created.id);

    expect(result.foo).toStrictEqual('hello');
    expect(result.bar).toBeUndefined();
});

it('transforms findByIds options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        findByIds: {
            options: options => ({...options, limit: 1}),
        },
    });

    const a = await collection.create('a');
    const b = await collection.create('b');

    const result = await collection.findByIds([a.id, b.id]);

    expect(result.docs).toHaveLength(1);
});

it('transforms findDistinct options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        findDistinct: {
            options: options => ({...options, where: {foo: {equals: 'a'}}}),
        },
    });

    await collection.create('a');
    await collection.create('a');
    await collection.create('b');

    const result = await collection.findDistinct();

    expect(result.totalDocs).toStrictEqual(1);
    expect(result.values[0].foo).toStrictEqual('a');
});

it('transforms findVersionById options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        findVersionById: {
            options: options => ({...options, depth: 0}),
        },
    });

    await collection.create('hello');
    const versions = await collection.findVersions();
    const version = await collection.findVersionById(versions.docs[0].id);

    expect(version.version.foo).toStrictEqual('hello');
});

it('transforms findVersions options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        findVersions: {
            options: options => ({...options, limit: 1}),
        },
    });

    await collection.create('a');
    await collection.create('b');

    const result = await collection.findVersions();

    expect(result.docs).toHaveLength(1);
});

it('transforms count options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        count: {
            options: options => ({...options, where: {foo: {equals: 'x'}}}),
        },
    });

    await collection.create('x');
    await collection.create('y');
    await collection.create('x');

    const result = await collection.count();

    expect(result.totalDocs).toStrictEqual(2);
});

it('transforms countVersions options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        countVersions: {
            options: options => ({...options, where: {version__foo: {equals: 'x'}}}),
        },
    });

    await collection.create('x');
    await collection.create('y');
    await collection.create('x');

    const result = await collection.countVersions();

    expect(result.totalDocs).toStrictEqual(2);
});

it('transforms update where', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        update: {
            where: () => ({foo: {equals: 'target'}}),
        },
    });

    await collection.create('target');
    await collection.create('other');

    const result = await collection.update({}, {bar: 77});

    expect(result.docs).toHaveLength(1);
    expect(result.docs[0].foo).toStrictEqual('target');
    expect(result.docs[0].bar).toStrictEqual(77);
});

it('transforms update data', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        update: {
            data: data => ({...data, bar: 99}),
        },
    });

    const created = await collection.create('hello');

    const result = await collection.update({id: {equals: created.id}}, {foo: 'updated'});

    expect(result.docs[0].foo).toStrictEqual('updated');
    expect(result.docs[0].bar).toStrictEqual(99);
});

it('transforms update options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 10}),
        },
        update: {
            options: options => ({...options, select: {foo: true}}),
        },
    });

    const created = await collection.create('hello');
    const result = await collection.update({id: {equals: created.id}}, {foo: 'updated'});

    expect(result.docs[0].foo).toStrictEqual('updated');
    expect(result.docs[0].bar).toBeUndefined();
});

it('transforms updateById data', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        updateById: {
            data: data => ({...data, bar: 55}),
        },
    });

    const created = await collection.create('hello');
    const result = await collection.updateById(created.id, 'updated');

    expect(result.foo).toStrictEqual('updated');
    expect(result.bar).toStrictEqual(55);
});

it('transforms updateById options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 10}),
        },
        updateById: {
            options: options => ({...options, select: {foo: true}}),
        },
    });

    const created = await collection.create('hello');
    const result = await collection.updateById(created.id, 'updated');

    expect(result.foo).toStrictEqual('updated');
    expect(result.bar).toBeUndefined();
});

it('transforms updateByIds data', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        updateByIds: {
            data: data => ({...data, bar: 33}),
        },
    });

    const a = await collection.create('a');
    const b = await collection.create('b');
    const result = await collection.updateByIds([a.id, b.id], 'updated');

    expect(result.docs.every(d => d.bar === 33)).toBe(true);
});

it('transforms updateByIds options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 10}),
        },
        updateByIds: {
            options: options => ({...options, select: {foo: true}}),
        },
    });

    const a = await collection.create('a');
    const b = await collection.create('b');
    const result = await collection.updateByIds([a.id, b.id], 'updated');

    expect(result.docs.every(d => d.foo === 'updated')).toBe(true);
    expect(result.docs.every(d => d.bar === undefined)).toBe(true);
});

it('transforms delete where', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        delete: {
            where: () => ({foo: {equals: 'delete-me'}}),
        },
    });

    await collection.create('keep');
    await collection.create('delete-me');
    await collection.create('delete-me');

    const result = await collection.delete({});

    expect(result.docs).toHaveLength(2);
    expect(result.docs.every(d => d.foo === 'delete-me')).toBe(true);
});

it('transforms delete options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 42}),
        },
        delete: {
            options: options => ({...options, select: {foo: true}}),
        },
    });

    await collection.create('hello');
    const result = await collection.delete({foo: {equals: 'hello'}});

    expect(result.docs).toHaveLength(1);
    expect(result.docs[0].foo).toStrictEqual('hello');
    expect(result.docs[0].bar).toBeUndefined();
});

it('transforms deleteById options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 42}),
        },
        deleteById: {
            options: options => ({...options, select: {foo: true}}),
        },
    });

    const created = await collection.create('hello');
    const result = await collection.deleteById(created.id);

    expect(result.foo).toStrictEqual('hello');
    expect(result.bar).toBeUndefined();
});

it('transforms deleteByIds options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        create: {
            data: data => ({...data, bar: 42}),
        },
        deleteByIds: {
            options: options => ({...options, select: {foo: true}}),
        },
    });

    const a = await collection.create('a');
    const b = await collection.create('b');
    const result = await collection.deleteByIds([a.id, b.id]);

    expect(result.docs).toHaveLength(2);
    expect(result.docs.every(d => d.bar === undefined)).toBe(true);
});

it('transforms duplicate options', async () => {
    const collection = new TransformedCollection(ctx.payload, {
        duplicate: {
            options: () => ({draft: true, data: {bar: 11}}),
        },
    });

    const created = await collection.create('hello');
    const duplicated = await collection.duplicate(created.id);

    expect(duplicated.id).not.toStrictEqual(created.id);
    expect(duplicated._status).toStrictEqual('draft');
    expect(duplicated.bar).toStrictEqual(11);
});

