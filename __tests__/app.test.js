const app = require("../endpoints/app.endpoints");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("ANY /not-a-route", () => {
  test("404: Responds with 404 and 'Not a valid route' when an invalid route is requested", () => {
    return request(app)
        .get("/api/helloworld")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Not a valid route");
        });
  })
})

describe("/api/topics", () => {
  describe("GET", () => {
    test("Returns an object with topics key", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).toBeTruthy();
        });
    });

    test("Returns topics array of objects with slug, description keys", () => {
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
