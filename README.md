# Payload Repository and Operations

Opinionated repository and operations object wrapper around Payload's Local API.

## Installation

```sh
npm install payload-repository
```

## Usage

Pass your generated Payload `Config` type as the first type argument to get full type safety on fields, select, and return types.

### CollectionOperations

Extend `CollectionOperations` to encapsulate domain-specific operations logic for a collection:

```ts
import type {BasePayload} from 'payload';
import type {Config} from '@/payload-types';
import {CollectionOperations} from 'payload-repository';

class PostsOperations extends CollectionOperations<Config, 'posts'> {
    constructor(payload: BasePayload) {
        super(payload, 'posts');
    }

    create(title: string) {
        return this.repository.create({title});
    }

    findAll() {
        return this.repository.find();
    }

    findById(id: number) {
        return this.repository.findById(id);
    }

    findPublished() {
        return this.repository.find({where: {status: {equals: 'published'}}});
    }

    publish(id: number) {
        return this.repository.updateById(id, {status: 'published'});
    }

    deleteById(id: number) {
        return this.repository.deleteById(id);
    }
}

// Usage
const postsOperations = new PostsOperations(payload);

const post = await postsOperations.create('Hello World');
const published = await postsOperations.findPublished();
await postsOperations.publish(post.id);
```

### GlobalOperations

Extend `GlobalOperations` to encapsulate domain-specific operations logic for a global:

```ts
import type {BasePayload} from 'payload';
import type {Config} from '@/payload-types';
import {GlobalOperations} from 'payload-repository';

class SettingsOperations extends GlobalOperations<Config, 'settings'> {
    constructor(payload: BasePayload) {
        super(payload, 'settings');
    }

    get() {
        return this.repository.find();
    }

    setSiteTitle(title: string) {
        return this.repository.update({siteTitle: title});
    }
}

// Usage
const settingsOperations = new SettingsOperations(payload);

const settings = await settingsOperations.get();
await settingsOperations.setSiteTitle('My Site');
```

## License

MIT

## Todo

- [ ] Github Actions
