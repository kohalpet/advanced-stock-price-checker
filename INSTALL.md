# Deployment

## Requirements

Node.js 20.0.0 or higher
PostgreSQL 13.0 or higher

## Installation

1. Clone the repository

## Project setup

```bash
# install dependencies
$ npm install

# generate prisma client
$ npx prisma generate
```

## Database setup

1. Create a `.env` file based on the `.env.example` file

```bash
$ cp .env.example .env
```

2. Set the environment variables in the `.env` file

3. Create a role with 'CREATEDB' privileges

```bash

$ psql -U postgres
postgres=# CREATE ROLE <role_name> WITH LOGIN PASSWORD '<password>';
postgres=# ALTER ROLE <role_name> CREATEDB;
postgres=# \q
```

4. Run migrations

```bash
# create a new migration (development)
$ npx prisma migrate dev

# create a new migration (production)
$ npx prisma migrate deploy
```

## Test the project

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
