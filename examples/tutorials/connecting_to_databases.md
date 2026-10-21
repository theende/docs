---
last_modified: 2026-10-20
title: "Connecting to databases"
description: "Connect Ende to SQLite and PostgreSQL with database drivers from JSR."
url: /examples/connecting_to_databases_tutorial/
oldUrl:
  - /runtime/tutorials/connecting_to_databases/
---

It is common for applications to store and retrieve data from databases. Ende
supports connecting to many database management systems.

You can find database drivers on [JSR](https://jsr.io/@db). This page connects
to SQLite and PostgreSQL.

## SQLite

SQLite is a self-contained, serverless, zero-configuration, and transactional
SQL database engine. It is a popular choice for local storage in applications.

To use the [sqlite](https://jsr.io/@db/sqlite) module to connect to SQLite in
your Ende apps:

```sh
ende add jsr:@db/sqlite
```

Then, import the `Database` class from the module and create a new database
instance. You can then execute SQL queries against the database:

```ts title="main.ts"
import { Database } from "@db/sqlite";

const db = new Database("test.db");

const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
console.log(version);

db.close();
```

This module depends on Ende FFI, so you need to run your script with the
`--allow-ffi` flag:

```sh
ende run --allow-ffi main.ts
```

## Postgres

PostgreSQL is a powerful, open source object-relational database system. The
[postgres](https://jsr.io/@db/postgres) module on JSR connects to it:

```sh
ende add jsr:@db/postgres
```

Import the `Client` class, create a client with the connection details, and
connect:

```ts title="main.ts"
import { Client } from "@db/postgres";

const client = new Client({
  hostname: Ende.env.get("PGHOST") || "localhost",
  port: Number(Ende.env.get("PGPORT") || "5432"),
  user: Ende.env.get("PGUSER") || "postgres",
  password: Ende.env.get("PGPASSWORD") || "postgres",
  database: Ende.env.get("PGDATABASE") || "postgres"
});

await client.connect();
const result = await client.queryObject<{ version: string }>(
  "SELECT version() AS version"
);
console.log("Postgres version:", result.rows[0].version);
await client.end();
```

The driver needs network and environment access:

```sh
ende run -N -E main.ts
```
