const { checkForeignPrimaryKey } = require("../models/model-utils");
const db = require("../db/connection");

afterAll(() => db.end());

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
