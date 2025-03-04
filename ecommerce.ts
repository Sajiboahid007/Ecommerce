import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET: string = "i love my country";
const app = express();
app.use(express.json());

const prisma = new PrismaClient();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// Extend Request type to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail: string;
}

const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(HttpStatusCode.UnAuthorized)
      .json({ message: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Store the user ID in the request object
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res
      .status(HttpStatusCode.UnAuthorized)
      .json({ message: "Invalid or expired token" });
  }
};

app.post("/register", async (req: Request, res: Response) => {
  try {
    const userInfo = req?.body;
    userInfo.Password = await bcrypt.hash(userInfo.Password, 10);

    const users = await prisma.users.create({
      data: userInfo,
    });
    return res.status(HttpStatusCode.Ok).send(users);
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCode.BadRequest).send(error);
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { Email, Password } = req?.body;

    const user = await prisma.users.findUnique({
      where: { Email },
    });

    if (!user) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(Password, user.Password);
    if (!matchPassword) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user.Id, email: user.Email }, JWT_SECRET, {
      expiresIn: "5m",
    });

    res.json({ token });
  } catch (error) {
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal server error" });
  }
});

app.get("/test", authenticate, (req: Request, res: Response) => {
  console.log(req.headers);
  return res.status(HttpStatusCode.Ok).json({ message: "somethjrbngjneg" });
});

app.get("/user/get", authenticate, async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { Id: "desc" },
    });
    return res.status(HttpStatusCode.Ok).json(users);
  } catch (error) {
    return res.status(HttpStatusCode.BadRequest).json(error);
  }
});

app.get("/getUserInfoById/:id", authenticate, async (req: any, res: any) => {
  try {
    const id = Number(req?.params.id);
    const userInfo = await prisma.users.findFirst({
      where: {
        Id: id,
      },
    });
    return res.status(HttpStatusCode.Ok).json(userInfo);
  } catch (error) {
    return res.status(HttpStatusCode.BadRequest).json(error);
  }
});

app.put("/user/update/:id", authenticate, async (req: any, res: any) => {
  try {
    const id = Number(req?.params?.id);

    const isExist = await prisma.users.findFirst({
      where: {
        Id: id,
      },
    });

    if (!isExist) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ Message: "Not found" });
    }

    const { Name, Address } = req?.body;

    const updateUser = await prisma.users.update({
      data: { Name: Name, Address: Address },
      where: { Id: id },
    });

    return res.status(HttpStatusCode.Ok).json(updateUser);
  } catch (error) {
    return res.status(HttpStatusCode.BadRequest).json(error);
  }
});

app.post(
  "/brand/create",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const brand = req?.body;
      const brandInfo = await prisma.brands.create({
        data: { Name: brand?.Name, CreatedBy: req.userEmail },
      });
      return res.status(HttpStatusCode.Ok).json(brandInfo);
    } catch (error) {
      return res.status(HttpStatusCode.BadRequest).json(error);
    }
  }
);
