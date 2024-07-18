const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const {
  checkValidUsername,
  checkForeignPrimaryKey,
  checkValidPostedComment,
  formatObjectToArray,
  validateParameters,
  checkValidVoteIncrease,
} = require("../models/model-utils");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe.only("checkValidUsername", () => {
  test("Returns a boolean", () => {
    const input = "Hello";
    const output = checkValidUsername(input);
    expect(typeof output).toBe("boolean");
  });

  test("Returns false on a blank string", () => {
    const input = "";
    const output = checkValidUsername(input);
    expect(output).toBe(false);
  });

  test("Returns true if only /characters between/ are present: /A-Za-z0-9-_/", () => {
    const input = "A-Za-z0-9-_";
    const output = checkValidUsername(input);
    expect(output).toBe(true);
  });

  test("Returns false if any other character is present", () => {
    const input = ";";
    const output = checkValidUsername(input);
    expect(output).toBe(false);
  });
});

describe("checkForeignPrimaryKey", () => {
  test("Returns true when the id exists in the provided columnName and table", () => {
    const [foreignTable, columnName, id] = ["articles", "article_id", 7];

    checkForeignPrimaryKey(foreignTable, columnName, id)
      .then((result) => {
        expect(result).toBe(true);
      })
      .catch((error) => {
        console.log(error);
        expect("Test error occured").toBe("Check console logs"); // Fail the test on an error
      });
  });

  test("Returns false when the id doesn't exist in the provided columnName and table", () => {
    const [foreignTable, columnName, id] = ["comments", "article_id", 99];

    checkForeignPrimaryKey(foreignTable, columnName, id)
      .then((result) => {
        expect(result).toBe(false);
      })
      .catch((error) => {
        console.log(error);
        expect("Test error occured").toBe("Check console logs"); // Fail the test on an error
      });
  });
});

describe("checkValidPostedComment", () => {
  test("Returns false on a blank object", () => {
    const input = {};
    const output = checkValidPostedComment(input);
    expect(output).toBe(false);
  });

  test("Returns true if the postedComment only has keys: username, body, article_id", () => {
    const input = { username: "hello", body: "world", article_id: 1 };
    const output = checkValidPostedComment(input);
    expect(output).toBe(true);
  });

  test("Returns false if the postedComment has any other key", () => {
    const input = { username: "hello", body: "world", article_id: 1, extra: 2 };
    const output = checkValidPostedComment(input);
    expect(output).toBe(false);
  });

  test("Returns false is the postedComment is missing username or body", () => {
    const input = { username: "hello", article_id: 1, extra: 2 };
    const output = checkValidPostedComment(input);
    expect(output).toBe(false);
  });

  test("Adds an article_id key if provided", () => {
    const input = { username: "hello", body: "world" };
    const article_id = 1;
    const output = checkValidPostedComment(input, article_id);
    expect(output).toBe(true);
  });

  test("Does not mutate the input", () => {
    const input = { username: "hello", body: "world" };
    const article_id = 1;
    const inputCopy = JSON.parse(JSON.stringify(input));
    checkValidPostedComment(input, article_id);
    expect(input).toEqual(inputCopy);
  });
});

describe("formatObjectToArray", () => {
  test("Returns an outer array", () => {
    const input = {};
    const sortOrder = [];
    const output = formatObjectToArray(input, sortOrder);
    expect(output).toEqual([[]]);
  });

  test("Returns 1 [key, value] pair as a [value] inside an outer array", () => {
    const input = { hello: "world" };
    const sortOrder = ["hello"];
    const output = formatObjectToArray(input, sortOrder);
    expect(output).toEqual([["world"]]);
  });

  test("Returns all [key, value] pairs as arrays of [value1, value2, valueN] inside an outer array", () => {
    const input = { hello: "world", timeIs: 14.46, dataType: ["array", true] };
    const sortOrder = ["hello", "timeIs", "dataType"];
    const output = formatObjectToArray(input, sortOrder);
    expect(output).toEqual([["world", 14.46, ["array", true]]]);
  });

  test("Returns formatted nested array values in the key order specified", () => {
    const input = { hello: "world", timeIs: 14.46, dataType: ["array", true] };
    const sortOrder = ["timeIs", "dataType", "hello"];
    const output = formatObjectToArray(input, sortOrder);
    expect(output).toEqual([[14.46, ["array", true], "world"]]);
  });

  test("Does not mutate the input", () => {
    const input = { hello: "world", timeIs: 14.46, dataType: ["array", true] };
    const sortOrder = ["hello", "timeIs", "dataType"];
    const inputCopy = JSON.parse(JSON.stringify(input));
    formatObjectToArray(input, sortOrder);
    expect(input).toEqual(inputCopy);
  });
});

describe("validateParameters", () => {
  test("Promise resolves to an array of the formatted inputs when given valid inputs", () => {
    const inputs = ["created_at", "asc", "cats"];
    return validateParameters(...inputs)
      .then((results) => {
        expect(Array.isArray(results)).toBe(true);
        expect(results).toEqual(["created_at", "ASC", "'cats'"]);
      })
      .catch((error) => {
        console.log(error, "<<<<<<<<<error in test");
        expect(1).toBe(0); // Promise should resolve not reject
      });
  });

  test("400: Promise rejects with message 'Bad request' on an invalid sort_by", () => {
    const inputs = ["dog", "ASC", "cats"];
    return validateParameters(...inputs)
      .then(() => {
        expect(1).toBe(0); // Promise should reject not resolve
      })
      .catch((results) => {
        expect(results).toEqual({ status: 400, message: "Bad request" });
      });
  });

  test("Promise resolves on an invalid order, setting it to DESC", () => {
    const inputs = ["created_at", "tail", "cats"];
    return validateParameters(...inputs)
      .then((results) => {
        expect(Array.isArray(results)).toBe(true);
        expect(results).toEqual(["created_at", "DESC", "'cats'"]);
      })
      .catch(() => {
        expect(1).toBe(0); // Promise should resolve not reject
      });
  });

  test("404: Promise rejects with message 'Topic not found' on an invalid topic", () => {
    const inputs = ["created_at", "DESC", "bananas"];
    return validateParameters(...inputs)
      .then(() => {
        expect(1).toBe(0); // Promise should reject not resolve
      })
      .catch((results) => {
        expect(results).toEqual({ status: 404, message: "Topic not found" });
      });
  });
});

describe("checkValidVoteIncrease", () => {
  test("Returns a boolean", () => {
    const input = { inc_votes: 1 };
    const output = checkValidVoteIncrease(input);
    expect(typeof output).toBe("boolean");
  });

  describe("Test functionality", () => {
    test("Returns true if input is in format { inc_votes: <INT> }", () => {
      const input = { inc_votes: 1 };
      const output = checkValidVoteIncrease(input);
      expect(output).toBe(true);
    });

    test("Returns false if inc_votes does not exist", () => {
      const input = { test: 1 };
      const output = checkValidVoteIncrease(input);
      expect(output).toBe(false);
    });

    test("Returns false if any other key exists", () => {
      const input = { inc_votes: 1, test: 1 };
      const output = checkValidVoteIncrease(input);
      expect(output).toBe(false);
    });

    test("Returns false if value of inc-votes is not an INT", () => {
      const input = { inc_votes: 1.5 };
      const output = checkValidVoteIncrease(input);
      expect(output).toBe(false);
    });
  });

  test("Function purity - Does not mutate the input", () => {
    const input = { inc_votes: 2 };
    const inputCopy = JSON.parse(JSON.stringify(input));
    checkValidVoteIncrease(input);
    expect(input).toEqual(inputCopy);
  });
});
