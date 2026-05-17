import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

let token;
let productId;

beforeEach(async () => {
  await Product.deleteMany({});
  await Inventory.deleteMany({});

  // create user
  await request(app).post("/users").send({
    name: "Test User",
    email: "inventory@example.com",
    password: "123456",
  });

  // login
  const loginRes = await request(app).post("/users/login").send({
    email: "inventory@example.com",
    password: "123456",
  });

  token = loginRes.body.token;

  // create product
  const productRes = await request(app)
    .post("/products")
    .set("Authorization", `Bearer ${token}`)
    .send({
      barcode: "999999",
      name: "HistoryMilk",
      price: 5,
    });

  productId = productRes.body._id;
});

describe("Inventory API", () => {

  it("should create inventory for user", async () => {
    const res = await request(app)
      .post("/inventory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.items).toEqual([]);
  });

    it("should not allow duplicate inventory", async () => {
    await request(app)
      .post("/inventory")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/inventory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Inventory already exists");
  });

    it("should add item to inventory", async () => {
    await request(app)
      .post("/inventory")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/inventory/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        product: productId,
        quantity: 2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

    it("should fail if inventory does not exist", async () => {
    const res = await request(app)
      .post("/inventory/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        product: productId,
        quantity: 1,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Inventory not found");
  });

    it("should update item quantity", async () => {
    const inventoryRes = await request(app)
      .post("/inventory")
      .set("Authorization", `Bearer ${token}`);

    const itemRes = await request(app)
      .post("/inventory/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        product: productId,
        quantity: 1,
      });

    const itemId = itemRes.body.items[0]._id;

    const res = await request(app)
      .put(`/inventory/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

    it("should remove item from inventory", async () => {
    await request(app)
      .post("/inventory")
      .set("Authorization", `Bearer ${token}`);

    const itemRes = await request(app)
      .post("/inventory/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        product: productId,
        quantity: 1,
      });

    const itemId = itemRes.body.items[0]._id;

    const res = await request(app)
      .delete(`/inventory/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(0);
  });

    it("should return expiring items", async () => {
    await request(app)
      .post("/inventory")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get("/inventory/items/expired")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});