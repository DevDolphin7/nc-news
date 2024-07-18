# Dolphin News API

Check it out: [https://dolphin-news.onrender.com/api/articles](https://dolphin-news.onrender.com/api/articles)

## Description

Dolphin news is fun a mock news site to play with! It's written in JavaScript and SQL, utilising Express and PSQL. Currently, it's just a back-end... stay tuned until September 2024 for a front-end!

---

## Getting Started

### Pre-requisites

Developed on and designed for a UNIX based operating system.

You will need to install:
- Node >= v21.7.3 [How to install Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)
- Postgres >= v14 [How to install Postgres](https://www.postgresql.org/docs/current/tutorial-install.html)

### Install Dependencies

Fork or clone the repository: [https://github.com/DevDolphin7/nc-news.git](https://github.com/DevDolphin7/nc-news)

In the command line, navigate to the repository and run: `npm install`

### Setup Test Database Connection

- Add `.env.*` to `.gitignore` in the repository's root directory (root).
- Create `.env.test` to the root.
- Write `PGDATABASE=nc_news_test` as the only line in `.env.test`.

### Testing

For the first time only, the databases must be created: `npm run setup-dbs`

Every time after this: `npm test`

To test a specific file, for example `app.test.js` from root: `npm test __tests__/app.test.js`
> The test file will seed the database with test data before each test

--- 

## Acknowledgement

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
