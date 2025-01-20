# Deployment

## Production

### Requirements

Docker 25.0.0 or higher

### Installation and running

1. Clone the repository

```bash
$ git clone git@github.com:kohalpet/advanced-stock-price-checker.git
```

2. Change the directory

```bash
$ cd advanced-stock-price-checker
```

3. Create a `.env` file based on the `.env.example` file

```bash
$ cp .env.example .env
```

4. Set the environment variables in the `.env` file

5. Build the Docker image

```bash
$ docker compose build
```

6. Run the Docker container

```bash
$ docker compose up
```

You can now access the Swagger at `http://localhost:3000/api`.

## Development

For development, you can use external PostgreSQL database or the dockerized one.
If you want to use the dockerized one, just make sure that the environment variable `DATABASE_URL` is set to
the right value in the `.env` file.

### Requirements

Node.js 20.0.0 or higher
PostgreSQL 13.0 or higher

### Installation and running

1. Clone the repository

```bash
$ git clone git@github.com:kohalpet/advanced-stock-price-checker.git
```

2. Change the directory

```bash
$ cd advanced-stock-price-checker
```

3. Create a `.env` file based on the `.env.example` file

```bash
$ cp .env.example .env
```

4. Set the environment variables in the `.env` file

5. Install the dependencies

```bash
$ npm install
```

6. Generate the Prisma client

```bash
$ npx prisma generate
```

7. Run db migrations

```bash
$ npx prisma migrate dev
```

8. Start the development server

```bash
$ npm run start:dev
```

You can now access the Swagger at `http://localhost:3000/api`.

### Testing

To run the unit tests, run the following command:

```bash
$ npm run test
```

To run the end-to-end tests, run the following command:

```bash
$ npm run test:e2e
```

To run the test coverage, run the following command:

```bash
$ npm run test:cov
```
