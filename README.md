# tdm - *Terraform* for Test Data

*tdm* (short for Test Data Management) is an open-source library to help you manage your test data. You can think of it as a *Terraform for Test Data*: You define the state your test data should be in, and TDM interfaces with your data stores (e.g. your own APIs and/or third-party APIs) to get things into that desired state.

## Usage

Installation

```
npm install
```

Build the project

```
npm run build
```

See the [examples](examples/) directory for some example projects using TDM.

## Overview

When creating end-to-end tests, you'll often need to make assumptions about the state of the data in the system you're testing. These assumptions could be simple, like assuming you can sign-in using a specific username and password. Usually these assumptions end up being much more complex. Imagine you're testing the checkout process of a Shopify store. A single test of the checkout flow will end up making several big assumptions about your test environment, including:

- The product that the test is scripted to purchase must not only exist, but must have the correct product name, description, and other associated metadata.
- The product appears in search results and is assigned to the appropriate categories in the category hierarchy.
- The product is in-stock and has inventory available for a specific size and color.
- The correct shipping rates exist in the third-party shipping provider.
- The correct tax rates exist in the third-party tax provider.
- The payment gateway is set up to accept payments from a test card number.

To get the system into the proper state (in other words, to fulfill the assumptions above), you could write a set of SQL scripts to load this data, or maybe restore your database from a snapshot that's a known-good version of the system. In most cases you're likely not managing your data explicitly at all, but instead are setting it up once and hoping it doesn't change. The current approaches for actively managing test data are difficult to use and maintain, and lack support for handling third-party data (like the tax, shipping, and payment information in the checkout example above).

TDM is an alternative approach for managing test data that lets you manage first-party and third-party data as a **set of fixtures** in your codebase. These fixtures are **strongly-typed**, and the types can mostly be **auto-generated** based on the OpenAPI definitions of both internal and third-party APIs. Under the hood, TDM gets your data into the desired state by interacting with these existing internal and third-party APIs.

## Concepts

### Fixtures

*Fixtures* are objects used by TDM to collectively represent the desired state of your system. Unlike other tools which use configuration formats like JSON or YAML to represent fixtures, Fixtures in TDM are just Typescript objects. Using Typescript vs. something like JSON provides a few key benefits:

1. You can take advantage of the structural typing features of Typescript to get compile-time type checking for situations that would normally be runtime error in other tools, such as defining a fixture without a populating a required field.
2. Typescript's built-in Utility Types, like `Omit<T>` and `Required<T>`, combined with structural typing semantics mean you don't have to write much boilerplate code.
3. Fixtures are not constrained by whatever constructs are present (or not present) in your configuration schema. TDM fixtures have all the expressivity of a normal Typescript object. This means implementing things like randomly generated values or large amounts of synthetic data can be done in a few lines of code.

### Entities

Each Fixture is closely associated with an *Entity*, which is an object retrieved from either a first-party or third-party data store, and whose interface is defined by that data store. TDM provides first-class support for entities defined by an OpenAPI specification, however you can also define your own entities pulled from data stores such as GraphQL APIs and database tables.

To reduce boilerplate, we encourage users to define a Fixture in relation to an entity. For example, consider a simpleEntity returned from a REST API that is defined like this:

```
export interface User {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
}
```

A Fixture representing this Entity should likely not store the `id` field, since that is an internal identifier that we'd rather have the REST API auto-generate for us. We can make use of the `Omit<T>` utility type to define a Fixture with this property:

```
export type UserFixture = Omit<User, 'id'>
```

...and define our fixtures using the `UserFixture` type:

```
export const users: UserFixture[] = [
  {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
  },
]
```

#### Fixture References

Often an entity will reference one or more other types of entities. Expanding on the example above, imagine the `User` entity contains an `accountId` which represents the account that the user belongs to. The details of that account can be retrieved using a separate endpoint in that same REST API. In a database schema, you'd normally model this as a foreign key relationship wherein the Users table has a foreign key (`accountId`) to the Accounts table.

When modelling this in a fixture, we don't want to store the `accountId` value itself since it lacks any semantic meaning. TDM instead provides a special way of referencing these "foreign key" relationships using information that is semantically relevant, and preserves referential integrity within your fixtures:

```
export interface User {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  accountId: number, // Reference to the 'Account' entity
}

// In a separate file...

type UserRelations = {
  [Fixture.References]: {
    account: { name: string },
  }
}

export type UserFixture = Omit<User, 'id' | 'accountId'> & UserRelations

export const users: UserFixture[] = [
  {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    [Fixture.References]: {
      account: { name: 'Foo Industries' },
    },
  },
  {
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    [Fixture.References]: {
      account: { name: 'Bar Incorporated' },
    },
  },
]
```

When present as a property in a Fixture, the `[Fixture.References]` Symbol conveys to TDM that this fixture needs to reference some information that exists in another Fixture type that's defined elsewhere.

### Transformers

Transformers define how a Fixture is mapped to an Entity. It also defined how to determine if a given Fixture and Entity represent the same *thing* (e.g. same User, Account, etc), and if so, what metadata may differ between the Fixture and Entity.

In the User example above, a Transformer could be defined like this:

```
export class UserTransformer extends FixtureTransformer<UserFixture, User, 'id'> {
  isMatchesEntity(existing: User, candidate: UserFixture): boolean {
    return existing.slug === candidate.slug
  }

  mapping(fixture: UserFixture, relations: { account?: Account }): Omit<User, 'id'> {
    if (relations.account?.id === undefined) {
      throw new Error('No account found')
    }

    return {
      email: fixture.email,
      firstName: fixture.firstName,
      lastName: fixture.lastName,
      accountId: relations.account.id,
    }
  }

  primaryKey(): 'id' {
    return 'id'
  }
}
```

### Executors

Executors define the CRUD operations for each Fixture definition. So for the `User` example, the `UserExecutor` defines how to insert/select/update/delete rows into the table:

```
export class UserExecutor extends Executor<User> {
  api: ExampleApi

  constructor(api: SupabaseApi) {
    super()
    this.api = api
  }

  async create(obj: User): Promise<unknown> {
    return this.api.createUser(obj)
  }

  async readCollection(): Promise<User[]> {
    return this.api.getUsers()
  }

  async read(objOrId: User | number): Promise<User | undefined> {
    const id = isUser(objOrId) ? objOrId.id : objOrId

    return this.api.getUser(id)
  }

  async update(obj: User): Promise<unknown> {
    return await this.api.updateUser(obj.id, obj)
  }

  async delete(objOrId: User | number): Promise<unknown> {
    const id = isUser(objOrId) ? objOrId.id : objOrId

    return await this.api.deleteUser(id)
  }
}

function isUser(objOrId: User | number): objOrId is User {
  return (objOrId as User).id != undefined
}

```

Since we need to know how to create/read/update/delete each type of Fixture, each Fixture definition must have it’s own corresponding Executor.


## Generating entities using OpenAPI specifications

Entities can be generated from OpenAPI 3.x specifications by using the following command:

```
node dist/index.js generate <source-type> <source-url> <destination-folder>
```
