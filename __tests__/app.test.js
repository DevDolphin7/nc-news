const app = require("../endpoints/app.endpoints");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    test("Responds with an object of objects with keys representing endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const endpoints = body.endpoints;
          const routes = Object.keys(endpoints);
          expect(routes.length).toBeGreaterThan(0);

          validRoute = /^(GET|PUT|POST|PATCH|DELETE){1} (\/[A-Za-z_:=?]+)*$/;
          routes.forEach((route) => {
            expect(validRoute.test(route)).toBe(true);
          });
        });
    });

    test("Each endpoint key is an object containing up to 4 keys description, queries, format, exampleResponse", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const endpoints = body.endpoints;
          const routes = Object.keys(endpoints);
          expect(routes.length).toBeGreaterThan(0);

          const allowedKeys = [
            "description",
            "queries",
            "format",
            "exampleResponse",
          ];
          const endpointDetails = Object.values(endpoints);
          endpointDetails.forEach((endpoint) => {
            const endpointKeys = Object.keys(endpoint);

            expect(endpointKeys.length).toBeGreaterThan(0);
            expect(endpointKeys.length).toBeLessThanOrEqual(4);
            endpointKeys.forEach((key) => {
              expect(allowedKeys.includes(key)).toBe(true);
            });
          });
        });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("Responds with topics array of objects with keys: slug, description", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const topics = body.topics;
          expect(topics).toHaveLength(3);

          topics.forEach((topic) => {
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("Responds with an array of all articles with only the 8 valid keys", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles).toHaveLength(13);

          const allowedKeys = [
            "author",
            "title",
            "article_id",
            "topic",
            "created_at",
            "votes",
            "article_img_url",
            "comment_count",
          ];
          articles.forEach((article) => {
            const keys = Object.keys(article);
            expect(keys).toHaveLength(8);
            keys.forEach((key) => expect(allowedKeys.includes(key)).toBe(true));
          });
        });
    });

    test("comment_count should reflect the number of comments on the article", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles).toHaveLength(13);

          const testDataComments = {
            1: "11",
            3: "2",
            5: "2",
            6: "1",
            9: "2",
          };
          articles.forEach((article) => {
            const commentCount = testDataComments[article.article_id];
            if (commentCount) {
              expect(article.comment_count).toBe(commentCount);
            } else {
              expect(article.comment_count).toBe(null);
            }
          });
        });
    });

    test("The articles should be sorted by created_at date in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles).toHaveLength(13);

          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    describe("Happy paths", () => {
      test("Article is an object with keys: author, title, article_id, body, topic, created_at, votes, article_img_url", () => {
        return request(app)
          .get("/api/articles/3")
          .expect(200)
          .then(({ body }) => {
            const keys = Object.keys(body.article);
            expect(keys).toHaveLength(8);

            const allowedKeys = [
              "author",
              "title",
              "article_id",
              "body",
              "topic",
              "created_at",
              "votes",
              "article_img_url",
            ];
            keys.forEach((key) => expect(allowedKeys.includes(key)).toBe(true));
          });
      });

      test("Responds with an object is the requested article (article_id = requested number", () => {
        return request(app)
          .get("/api/articles/4")
          .expect(200)
          .then(({ body }) => {
            const article = body.article;
            expect(article.article_id).toBe(4);
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 400 Bad Request on a non positive integer input", () => {
        return request(app)
          .get("/api/articles/dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 404 Not Found on a valid input that doesn't exist", () => {
        return request(app)
          .get("/api/articles/888")
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Article not found");
          });
      });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    describe("Happy paths", () => {
      test("Comment is an object with keys: comment_id, votes, created_at, author, body, article_id", () => {
        return request(app)
          .get("/api/articles/3/comments")
          .expect(200)
          .then(({ body }) => {
            const comments = body.comments;
            expect(comments).toHaveLength(2);

            const allowedKeys = [
              "comment_id",
              "votes",
              "created_at",
              "author",
              "body",
              "article_id",
            ];
            comments.forEach((comment) => {
              const keys = Object.keys(comment);
              expect(keys).toHaveLength(6);

              keys.forEach((key) => {
                expect(allowedKeys.includes(key)).toBe(true);
              });
            });
          });
      });

      test("Responds with all comments associated with the specified article_id", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body }) => {
            const comments = body.comments;
            expect(comments).toHaveLength(11);

            comments.forEach((comment) => {
              expect(comment.article_id).toBe(1);
            });
          });
      });

      test("Responds with an empty array if no comments exist for the given article", () => {
        return request(app)
          .get("/api/articles/7/comments")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).toEqual([]);
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 400 Bad Request on a non positive integer input", () => {
        return request(app)
          .get("/api/articles/cat/comments")
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 404 Not Found on a positive integer input that doesn't exist", () => {
        return request(app)
          .get("/api/articles/99/comments")
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Article not found");
          });
      });
    });
  });

  describe("POST", () => {
    describe("Happy paths", () => {
      test("201: Responds with comment - an object with keys: comment_id, votes, created_at, author, body, article_id", () => {
        return request(app)
          .post("/api/articles/5/comments")
          .send({ username: "rogersop", body: "Hello, world!" })
          .expect(201)
          .then(({ body }) => {
            const comment = body.comment;
            const [keys, values] = [
              Object.keys(comment),
              Object.values(comment),
            ];
            expect(keys).toHaveLength(6);

            const validKeys = [
              "comment_id",
              "votes",
              "created_at",
              "author",
              "body",
              "article_id",
            ];
            for (let i = 0; i < keys.length; i++) {
              expect(validKeys.includes(keys[i])).toBe(true);
              const output = typeof values[i];
              expect(output === "string" || output === "number").toBe(true);
            }
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 'Bad request' on a non positive integer article_id", () => {
        return request(app)
          .post("/api/articles/cat/comments")
          .send({ username: "rogersop", body: "Hello, world!" })
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 'Article not found' on a positive integer article_id that doesn't exist", () => {
        return request(app)
          .post("/api/articles/99/comments")
          .send({ username: "rogersop", body: "Hello, world!" })
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Article not found");
          });
      });

      test("400: Responds with 'Bad request' where the posted data is not in format { username: `<string>`, body: `<string>` }", () => {
        return request(app)
          .post("/api/articles/7/comments")
          .send({
            username: "rogersop",
            body: "Hello, world!",
            sneakyKey: "drop all databases?",
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });
    });
  });
});

describe("ANY /not-a-route", () => {
  test("404: Responds with 404 and 'Not a valid route' when an invalid route is requested", () => {
    return request(app)
      .get("/api/helloworld")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not a valid route");
      });
  });
});
