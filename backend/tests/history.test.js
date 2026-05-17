import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import History from "../models/History.js";

let token;
let productId;

beforeAll(async () => {
  // create user
  await request(app).post("/users").send({
    name: "Test User",
    email: "history@example.com",
    password: "123456",
  });

  // login
  const loginRes = await request(app).post("/users/login").send({
    email: "history@example.com",
    password: "123456",
  });

  token = loginRes.body.token;

  const productRes = await request(app)
    .post("/products")
    .set("Authorization", `Bearer ${token}`)
    .send({
      barcode: "999998",
      name: "InventoryMilk",
      price: 5,
    });
//   expect(productRes.statusCode).toBe(201);
  productID = productRes.body._id;
});

beforeEach(async () => {
  await History.deleteMany({});
});

describe("History API", () => {

  it("should create history for user", async () => {
    const res = await request(app)
      .post("/history")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.items).toEqual([]);
  });

    it("should not allow duplicate history", async () => {
    await request(app)
      .post("/history")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/history")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

    it("should add item to history", async () => {
    await request(app)
      .post("/history")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/history/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: productID,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].product).toBeDefined();
  });

    it("should fail if history does not exist", async () => {
    const res = await request(app)
      .post("/history/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: productID,
      });

    expect(res.statusCode).toBe(404);
  });

    it("should return user history", async () => {
    await request(app)
      .post("/history")
      .set("Authorization", `Bearer ${token}`);

    await request(app)
      .post("/history/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: productID,
      });

    const res = await request(app)
      .get("/history")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(1);
  });

});