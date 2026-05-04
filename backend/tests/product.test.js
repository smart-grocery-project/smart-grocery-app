import request from "supertest";
import app from "../app.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

let token;

beforeAll(async () => {
  // create user
  await request(app).post("/users").send({
    name: "Product Test User",
    email: "product@example.com",
    password: "123456",
  });
  // create token
  const res = await request(app).post("/users/login").send({
    email: "product@example.com",
    password: "123456",
  });

  token = res.body.token;
});

afterEach(async () => {
  await Product.deleteMany({});
});

describe("POST /products", () => {

  it("should create a product", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        barcode: "123456789",
        name: "Milk",
        price: 5,
        nutrition: {
          calories: 100,
          protein: 8,
          carbs: 12,
          fat: 3,
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Milk");
  });

    it("should fail if barcode already exists", async () => {
    const product = {
      barcode: "123456789",
      name: "Milk",
      price: 5,
    };

    await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send(product);

    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send(product);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Product with this barcode already exists");
  });

    it("should fail if required fields missing", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Milk",
      });

    expect(res.statusCode).toBe(500); // current behavior
  });

});

describe("GET /products", () => {

  it("should return all products", async () => {
    await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        barcode: "111",
        name: "Milk",
      });

    const res = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

    it("should return empty array if no products", async () => {
    const res = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

});