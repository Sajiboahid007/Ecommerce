import { NextFunction, Request, response, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { realpathSync } from "fs";
import { Param } from "@prisma/client/runtime/library";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET: string = "i love my country";
const app = express();
app.use(cors());
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
    req.userEmail = decoded.userEmail;
    next();
  } catch (error) {
    return res
      .status(HttpStatusCode.UnAuthorized)
      .json({ message: "Invalid or expired token" });
  }
};

const prepareData = (statusCode: any, data: any, errorMessage: any): any => {
  return {
    statusCode: statusCode,
    data: data,
    errorMessage: errorMessage,
  };
};

app.post("/register", async (req: Request, res: Response) => {
  try {
    const userInfo = req?.body;
    userInfo.Password = await bcrypt.hash(userInfo.Password, 10);
    const users = await prisma.users.create({
      data: {
        Name: userInfo?.Name,
        Email: userInfo?.Email,
        Password: userInfo?.Password,
        Address: userInfo?.Address,
        CreateDate: new Date(),
      },
    });
    return res.status(HttpStatusCode.Ok).send(users);
  } catch (error) {
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

    const token = jwt.sign(
      { userId: user.Id, userEmail: user.Email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (error) {
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal server error" });
  }
});

app.get("/user/get", authenticate, async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { Id: "desc" },
    });
    return res
      .status(HttpStatusCode.Ok)
      .json(prepareData(HttpStatusCode.Ok, users, ""));
  } catch (error: any) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
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

app.get("/brand/get", authenticate, async (req: any, res: any) => {
  try {
    const brandList = await prisma.brands.findMany({
      orderBy: { Id: "desc" },
    });
    return res
      .status(HttpStatusCode.Ok)
      .json(prepareData(HttpStatusCode.Ok, brandList, ""));
  } catch (error: any) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
  }
});

app.get(
  "/brand/getById/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const getById = await prisma.brands.findFirst({
        where: { Id: id },
      });
      if (!getById) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ Message: "Not found" });
      }
      return res.status(HttpStatusCode.Ok).json(getById);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.delete(
  "/brand/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const brand = await prisma.brands.findFirst({
        where: { Id: id },
      });
      if (!brand) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      await prisma.brands.delete({
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json({ message: "Deleted!" });
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.put(
  "/brand/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);

      const brandLisat = await prisma.brands.findFirst({
        where: { Id: id },
      });

      if (!brandLisat) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "Not found!" });
      }

      const { Name } = req?.body;

      const updateInfo = await prisma.brands.update({
        data: { Name: Name, UpdatedBy: req.userEmail, UpdateDate: new Date() },
        where: { Id: id },
      });

      return res.status(HttpStatusCode.Ok).json(updateInfo);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.get(
  "/categories/get",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const category = await prisma.categories.findMany({
        orderBy: { Id: "desc" },
      });

      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, category, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);

app.get(
  "/categories/getById/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const getById = await prisma.categories.findFirst({
        where: { Id: id },
      });
      if (!getById) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ Message: "Not found" });
      }
      return res.status(HttpStatusCode.Ok).json(getById);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.post(
  "/categories/create",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const category = req?.body;
      const categoryInfo = await prisma.categories.create({
        data: { Name: category?.Name, CreatedBy: req.userEmail },
      });
      return res.status(HttpStatusCode.Ok).json(categoryInfo);
    } catch (error) {
      return res.status(HttpStatusCode.BadRequest).json(error);
    }
  }
);

app.put(
  "/categories/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);

      const categoryLisat = await prisma.categories.findFirst({
        where: { Id: id },
      });

      if (!categoryLisat) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "Not found!" });
      }

      const { Name } = req?.body;

      const updateInfo = await prisma.categories.update({
        data: { Name: Name, UpdatedBy: req.userEmail, UpdateDate: new Date() },
        where: { Id: id },
      });

      return res.status(HttpStatusCode.Ok).json(updateInfo);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.delete(
  "/categories/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const category = await prisma.categories.findFirst({
        where: { Id: id },
      });
      if (!category) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      await prisma.categories.delete({
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json({ message: "Deleted!" });
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.get(
  "/subcategories/get",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subcategories = await prisma.subCategories.findMany({
        orderBy: {
          Id: "desc",
        },
        include: {
          Categories: {
            select: {
              Name: true, // Fetch only the Category Name
            },
          },
        },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, subcategories, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);

app.get(
  "/subcategories/getById/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const subcategories = await prisma.subCategories.findFirst({
        where: {
          Id: id,
        },
      });
      return res.status(HttpStatusCode.Ok).json(subcategories);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.post(
  "/subcategories/create",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subcategories = req?.body;
      const subCategoriesdata = await prisma.subCategories.create({
        data: {
          Name: subcategories?.Name,
          CategoryId: subcategories?.CategoryId,
          CreatedBy: req.userEmail,
          CreateDate: new Date(),
        },
      });
      return res.status(HttpStatusCode.Ok).json(subCategoriesdata);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.put(
  "/subcategories/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.subCategories.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      const updatedReq = req?.body;
      const subCategory = await prisma.subCategories.update({
        data: {
          Name: updatedReq?.Name,
          CategoryId: updatedReq?.CategoryId,
          UpdatedBy: req.userEmail,
          UpdateDate: new Date(),
        },
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json(subCategory);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.delete(
  "/subcategories/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.subCategories.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      await prisma.subCategories.delete({
        where: { Id: id },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json({ message: "successfully deleted" });
    } catch (error) {
      return res.status(HttpStatusCode.BadRequest).json({ message: "invalid" });
    }
  }
);

app.get(
  "/variation/get",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const variationsList = await prisma.variations.findMany({
        orderBy: { Id: "desc" },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, variationsList, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);
app.get(
  "/variation/getBYId/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const variationsList = await prisma.variations.findFirst({
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json(variationsList);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.post(
  "/variation/create",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const variation = req?.body;
      const createVariation = await prisma.variations.create({
        data: {
          Type: variation?.Type,
          CreatedBy: req.userEmail,
          CreateDate: new Date(),
        },
      });
      return res.status(HttpStatusCode.Ok).json(createVariation);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.put(
  "/variation/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.variations.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      const variation = req?.body;
      const updateVariation = await prisma.variations.update({
        data: {
          Type: variation?.Type,
          UpdatedBy: req.userEmail,
          UpdateDate: new Date(),
        },
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json(updateVariation);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.delete(
  "/variation/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.variations.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      await prisma.variations.delete({
        where: { Id: id },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json({ message: "successfully deleted" });
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.get(
  "/productImage/getByProdutId/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const productId = Number(req?.params.id);
      const images = await prisma.productImages.findFirst({
        where: { ProductId: productId },
      });
      return res.status(HttpStatusCode.Ok).json(images);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.delete(
  "/productImage/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.productImages.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found" });
      }
      await prisma.productImages.delete({
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json({ message: "Deletd" });
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.get(
  "/sku/get",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sku = await prisma.stockKeepingUnits.findMany({
        orderBy: { Id: "desc" },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, sku, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);

app.get(
  "/sku/getById/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const sku = await prisma.stockKeepingUnits.findFirst({
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json(sku);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.post(
  "/sku/create",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sku = req?.body;
      const createSku = await prisma.stockKeepingUnits.create({
        data: {
          Name: sku?.Name,
          CreatedBy: req.userEmail,
          CreateDate: new Date(),
        },
      });
      return res.status(HttpStatusCode.Ok).json(createSku);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.put(
  "/sku/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.stockKeepingUnits.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      const sku = req?.body;
      const updateSku = await prisma.stockKeepingUnits.update({
        data: {
          Name: sku?.Name,
          UpdatedBy: req.userEmail,
          UpdateDate: new Date(),
        },
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json(updateSku);
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.delete(
  "/sku/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.stockKeepingUnits.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found" });
      }
      await prisma.stockKeepingUnits.delete({
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json({ message: "Deletd" });
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);

app.get(
  "/color/get",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const color = await prisma.colors.findMany({
        orderBy: { Id: "desc" },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, color, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);

app.get(
  "/color/getById/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const colorGetById = await prisma.colors.findFirst({
        where: { Id: id },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, colorGetById, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);

app.post(
  "/color/create",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const color = req?.body;
      const colorCreate = await prisma.colors.create({
        data: {
          Name: color?.Name,
          ColorCode: color?.ColorCode,
          CreatedBy: req?.userEmail,
          CreateDate: new Date(),
        },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, colorCreate, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);

app.put(
  "/color/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.colors.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      const update = req?.body;
      const updatedData = await prisma.colors.update({
        data: {
          Name: update?.Name,
          ColorCode: update.ColorCode,
          UpdatedBy: req.userEmail,
          UpdateDate: new Date(),
        },
        where: {
          Id: id,
        },
      });
      return res
        .status(HttpStatusCode.Ok)
        .json(prepareData(HttpStatusCode.Ok, updatedData, ""));
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json(prepareData(HttpStatusCode.BadRequest, null, error?.message));
    }
  }
);

app.delete(
  "/color/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req?.params.id);
      const isExit = await prisma.colors.findFirst({
        where: { Id: id },
      });
      if (!isExit) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: "not found!" });
      }
      await prisma.colors.delete({
        where: { Id: id },
      });
      return res.status(HttpStatusCode.Ok).json({ message: "Deletd" });
    } catch (error: any) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: error?.message });
    }
  }
);
