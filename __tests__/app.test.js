const app = require("../endpoints/app.endpoints");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    test("200: Responds with an object of objects with keys representing endpoints", () => {
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

    test("200: Each endpoint key is an object containing up to 4 keys description, queries, format, exampleResponse", () => {
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

describe("/api/users", () => {
  test("200: Responds with users array of user objects with keys: username, name, avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const allUsers = body.users;
        expect(allUsers).toHaveLength(4);

        const allowedKeys = ["username", "name", "avatar_url"];
        allUsers.forEach((user) => {
          expect(Object.keys(user)).toHaveLength(3);

          allowedKeys.forEach((key) => {
            expect(typeof user[key]).toBe("string");
          });
        });
      });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    describe("Happy paths", () => {
      test("200: User is an object with keys: username, name, avatar_url", () => {
        return request(app)
          .get("/api/users/lurker")
          .expect(200)
          .then(({ body }) => {
            expect(body.user).toEqual({
              username: "lurker",
              name: "do_nothing",
              avatar_url:
                "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            });
          });
      });

      test("200: Responds with the requested user", () => {
        return request(app)
          .get("/api/users/lurker")
          .expect(200)
          .then(({ body }) => {
            const user = body.user;
            expect(user.username).toBe("lurker");
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 'Bad request' on an invalid username input", () => {
        return request(app)
          .get("/api/users/Droping;all;dbs")
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 'User not found' on a valid username input that doesn't exist", () => {
        return request(app)
          .get("/api/users/helloWorld")
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("User not found");
          });
      });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("200: Responds with topics array of objects with keys: slug, description", () => {
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
    describe("Happy paths", () => {
      test("200: Responds with an array of all articles with only the 8 valid keys", () => {
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
              keys.forEach((key) =>
                expect(allowedKeys.includes(key)).toBe(true)
              );
            });
          });
      });

      test("200: comment_count should reflect the number of comments on the article", () => {
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

      test("200: The articles should be sorted by created_at date in descending order", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const articles = body.articles;
            expect(articles).toHaveLength(13);

            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });

      test("200: ?sort_by should sort the articles by the name of any valid articles property", () => {
        return request(app)
          .get("/api/articles?sort_by=title")
          .expect(200)
          .then(({ body }) => {
            const articles = body.articles;
            expect(articles).toHaveLength(13);

            expect(articles).toBeSortedBy("title", { descending: true });
          });
      });

      test("200: ?order=asc should order the articles in ascending order (desc is default)", () => {
        return request(app)
          .get("/api/articles?sort_by=title&order=asc")
          .expect(200)
          .then(({ body }) => {
            const articles = body.articles;
            expect(articles).toHaveLength(13);

            expect(articles).toBeSortedBy("title", { ascending: true });
          });
      });

      test("200: ?topic should filter the articles to match the provided topic", () => {
        return request(app)
          .get("/api/articles?topic=cats")
          .expect(200)
          .then(({ body }) => {
            const articles = body.articles;
            expect(articles).toHaveLength(1);
            expect(articles[0].topic).toBe("cats");
          });
      });

      test("200: ?topic should return a blank array (on a key of articles) when the topic exists but has no associated articles", () => {
        return request(app)
          .get("/api/articles?topic=paper")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toEqual([]);
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 'Bad request' when sort_by isn't a valid property of an article object", () => {
        return request(app)
          .get("/api/articles?sort_by=dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("200: Responds in descending order when order is specified as anything other than 'asc'", () => {
        return request(app)
          .get("/api/articles?order=dog")
          .expect(200)
          .then(({ body }) => {
            const articles = body.articles;
            expect(articles).toHaveLength(13);

            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });

      test("404: Responds with 'Topic not found' when the topic doesn't exist", () => {
        return request(app)
          .get("/api/articles?topic=dog")
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Topic not found");
          });
      });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    describe("Happy paths", () => {
      test("200: Article is an object with keys: author, title, article_id, body, topic, created_at, votes, article_img_url, comment_count", () => {
        return request(app)
          .get("/api/articles/3")
          .expect(200)
          .then(({ body }) => {
            const keys = Object.keys(body.article);
            expect(keys).toHaveLength(9);

            const allowedKeys = [
              "author",
              "title",
              "article_id",
              "body",
              "topic",
              "created_at",
              "votes",
              "article_img_url",
              "comment_count",
            ];
            keys.forEach((key) => expect(allowedKeys.includes(key)).toBe(true));
          });
      });

      test("200: Responds with the requested article", () => {
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
      test("400: Responds with 'Bad request' on a non positive integer input", () => {
        return request(app)
          .get("/api/articles/dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 'Article not found' on a valid input that doesn't exist", () => {
        return request(app)
          .get("/api/articles/888")
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Article not found");
          });
      });
    });
  });

  describe("PATCH", () => {
    describe("Happy paths", () => {
      test("200: Responds with the updated article (vote count increased by requested amount)", () => {
        return request(app)
          .patch("/api/articles/3")
          .send({ inc_votes: 2 })
          .expect(200)
          .then(({ body }) => {
            const article = body.updatedArticle;
            expect(article).toEqual({
              article_id: 3,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              author: "icellusedkars",
              body: "some gifs",
              created_at: "2020-11-03T09:12:00.000Z",
              title: "Eight pug gifs that remind me of mitch",
              topic: "mitch",
              votes: 2, // Updated from 0
            });
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 'Bad request' on a non positive integer article_id", () => {
        return request(app)
          .patch("/api/articles/dog")
          .send({ inc_votes: 3 })
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 'Article not found' on a valid article_id that doesn't exist", () => {
        return request(app)
          .patch("/api/articles/99")
          .send({ inc_votes: 4 })
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Article not found");
          });
      });

      test("400: Responds with 'Bad request' on an object not in the format { inc_votes: `<integer>` }", () => {
        return request(app)
          .patch("/api/articles/7")
          .send({ hello: 4 }) // Not inc_votes
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
            return request(app);
          })
          .then((request) => {
            request
              .patch("/api/articles/7")
              .send({ inc_votes: "world" }) // Not an integer
              .expect(400)
              .then(({ body }) => {
                expect(body.message).toBe("Bad request");
              });
          });
      });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    describe("Happy paths", () => {
      test("200: Comment is an object with keys: comment_id, votes, created_at, author, body, article_id", () => {
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

      test("200: Responds with all comments associated with the specified article_id", () => {
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

      test("200: Responds with an empty array if no comments exist for the given article", () => {
        return request(app)
          .get("/api/articles/7/comments")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).toEqual([]);
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 'Bad request' on a non positive integer input", () => {
        return request(app)
          .get("/api/articles/cat/comments")
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 'Article not found' on a positive integer input that doesn't exist", () => {
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

describe("/api/comments/:comment_id", () => {
  describe("PATCH", () => {
    describe("Happy paths", () => {
      test("200: Responds with the updated comment (vote count increased by requested amount)", () => {
        return request(app)
          .patch("/api/comments/3")
          .send({ inc_votes: 3 })
          .expect(200)
          .then(({ body }) => {
            const comment = body.updatedComment;
            expect(comment).toEqual({
              body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
              votes: 103, // Increased by 3
              author: "icellusedkars",
              article_id: 1,
              comment_id: 3,
              created_at: "2020-03-01T01:13:00.000Z",
            });
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 'Bad request' on a non positive integer comment_id", () => {
        return request(app)
          .patch("/api/comments/comment_id")
          .send({ inc_votes: 1.5 })
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 'Comment not found' on a valid comment_id that doesn't exist", () => {
        return request(app)
          .patch("/api/comments/99")
          .send({ inc_votes: 1 })
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Comment not found");
          });
      });

      test("400: Responds with 'Bad request' on an object not in the format { inc_votes: `<integer>` }", () => {
        return request(app)
          .patch("/api/comments/3")
          .send({ inc_votes: 2, sneakyKey: "drop all databases?" })
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
            return request(app)
              .patch("/api/comments/4")
              .send({ inc_votes: 2.5 })
              .expect(400);
          })
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
            return request(app)
              .patch("/api/comments/5")
              .send({ wrong_key_provided: 2 })
              .expect(400);
          })
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });
    });
  });

  describe("DELETE", () => {
    describe("Happy paths", () => {
      test("204: Responds with a 204 status code upon successful deletion", () => {
        return request(app)
          .delete("/api/comments/4")
          .expect(204)
          .then(() => {
            return db;
          })
          .then((db) => {
            db.query("SELECT * FROM comments WHERE comment_id = 4").then(
              ({ rows }) => {
                expect(rows).toHaveLength(0);
              }
            );
          });
      });
    });

    describe("Sad paths", () => {
      test("400: Responds with 'Bad request' on a non positive integer comment_id", () => {
        return request(app)
          .delete("/api/comments/dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.message).toBe("Bad request");
          });
      });

      test("404: Responds with 'Comment not found' on a positive integer comment_id that doesn't exist", () => {
        return request(app)
          .delete("/api/comments/99")
          .expect(404)
          .then(({ body }) => {
            expect(body.message).toBe("Comment not found");
          });
      });
    });
  });
});

describe("ANY /not-a-route", () => {
  test("404: Responds with 'Not a valid route' when an invalid route is requested", () => {
    return request(app)
      .get("/api/helloworld")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not a valid route");
      });
  });
});
