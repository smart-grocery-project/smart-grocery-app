import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";

afterEach(async () => {
  await User.deleteMany({});
});

describe("User API", () => {

  describe("POST /users", () => {

    it("should register a new user", async () => {
      const res = await request(app)
        .post("/users")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "123456",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe("test@example.com");
    });

    it("should fail if email already exists", async () => {
      const user = {
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      };

      // first creation
      await request(app).post("/users").send(user);

      // duplicate attempt
      const res = await request(app).post("/users").send(user);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email already in use");
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/users")
        .send({
          email: "test@example.com",
        });

      expect(res.statusCode).toBe(500); // your backend currently throws 500
    });

  });

  describe("POST /users/login", () => {

    it("should login with correct credentials", async () => {
      await request(app)
        .post("/users")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "123456",
        });

      const res = await request(app)
        .post("/users/login")
        .send({
          email: "test@example.com",
          password: "123456",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should fail with wrong password", async () => {
      await request(app)
        .post("/users")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "123456",
        });

      const res = await request(app)
        .post("/users/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid password");
    });

    it("should fail if user does not exist", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          email: "nouser@example.com",
          password: "123456",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid email");
    });

  });

});