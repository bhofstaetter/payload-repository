import type {CollectionConfig, GlobalConfig} from 'payload';
import {getTestContextFor} from 'payload-integration-test-utils';

const DummyCollection: CollectionConfig = {
    slug: 'dummies',
    versions: {drafts: true},
    fields: [
        {
            type: 'text',
            name: 'foo',
            required: true,
        },
        {
            type: 'number',
            name: 'bar',
        },
    ],
};

const DummyCollectionUnversioned: CollectionConfig = {
    slug: 'unversioned',
    fields: [
        {
            type: 'text',
            name: 'foo',
            required: true,
        },
        {
            type: 'number',
            name: 'bar',
        },
    ],
};

const DummyGlobal: GlobalConfig = {
    slug: 'dummy',
    typescript: {
        interface: 'DummyGlobal',
    },
    versions: {drafts: true},
    fields: [
        {
            type: 'text',
            name: 'foo',
            defaultValue: 'foo',
            required: true,
        },
        {
            type: 'number',
            name: 'bar',
        },
    ],
};

export const getTestContext = () =>
    getTestContextFor({
        collections: [DummyCollection, DummyCollectionUnversioned],
        globals: [DummyGlobal],
        tsOutputFile: './test/helpers/payload.test.types.ts',
    });
