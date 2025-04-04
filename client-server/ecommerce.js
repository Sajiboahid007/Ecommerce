"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "i love my country";
const app = express();
app.use(cors());
app.use(express.json());
const prisma = new client_1.PrismaClient();
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res
            .status(401 /* HttpStatusCode.UnAuthorized */)
            .json({ message: "Authorization token required" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Store the user ID in the request object
        req.userEmail = decoded.userEmail;
        next();
    }
    catch (error) {
        return res
            .status(401 /* HttpStatusCode.UnAuthorized */)
            .json({ message: "Invalid or expired token" });
    }
};
const prepareData = (statusCode, data, errorMessage) => {
    return {
        statusCode: statusCode,
        data: data,
        errorMessage: errorMessage,
    };
};
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = req === null || req === void 0 ? void 0 : req.body;
        userInfo.Password = yield bcrypt.hash(userInfo.Password, 10);
        const users = yield prisma.users.create({
            data: {
                Name: userInfo === null || userInfo === void 0 ? void 0 : userInfo.Name,
                Email: userInfo === null || userInfo === void 0 ? void 0 : userInfo.Email,
                Password: userInfo === null || userInfo === void 0 ? void 0 : userInfo.Password,
                Address: userInfo === null || userInfo === void 0 ? void 0 : userInfo.Address,
                CreateDate: new Date(),
            },
        });
        return res.status(200 /* HttpStatusCode.Ok */).send(users);
    }
    catch (error) {
        return res.status(400 /* HttpStatusCode.BadRequest */).send(error);
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Email, Password } = req === null || req === void 0 ? void 0 : req.body;
        const user = yield prisma.users.findUnique({
            where: { Email },
        });
        if (!user) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "User not found" });
        }
        const matchPassword = yield bcrypt.compare(Password, user.Password);
        if (!matchPassword) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "Invalid Password" });
        }
        const token = jwt.sign({ userId: user.Id, userEmail: user.Email }, JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ token });
    }
    catch (error) {
        return res
            .status(500 /* HttpStatusCode.InternalServerError */)
            .json({ message: "Internal server error" });
    }
}));
app.get("/user/get", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.users.findMany({
            orderBy: { Id: "desc" },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, users, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.get("/getUserInfoById/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const userInfo = yield prisma.users.findFirst({
            where: {
                Id: id,
            },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(userInfo);
    }
    catch (error) {
        return res.status(400 /* HttpStatusCode.BadRequest */).json(error);
    }
}));
app.put("/user/update/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = Number((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id);
        const isExist = yield prisma.users.findFirst({
            where: {
                Id: id,
            },
        });
        if (!isExist) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ Message: "Not found" });
        }
        const { Name, Address } = req === null || req === void 0 ? void 0 : req.body;
        const updateUser = yield prisma.users.update({
            data: { Name: Name, Address: Address },
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(updateUser);
    }
    catch (error) {
        return res.status(400 /* HttpStatusCode.BadRequest */).json(error);
    }
}));
app.post("/brand/create", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brand = req === null || req === void 0 ? void 0 : req.body;
        const brandInfo = yield prisma.brands.create({
            data: { Name: brand === null || brand === void 0 ? void 0 : brand.Name, CreatedBy: req.userEmail },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(brandInfo);
    }
    catch (error) {
        return res.status(400 /* HttpStatusCode.BadRequest */).json(error);
    }
}));
app.get("/brand/get", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brandList = yield prisma.brands.findMany({
            orderBy: { Id: "desc" },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, brandList, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.get("/brand/getById/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const getById = yield prisma.brands.findFirst({
            where: { Id: id },
        });
        if (!getById) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ Message: "Not found" });
        }
        return res.status(200 /* HttpStatusCode.Ok */).json(getById);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.delete("/brand/delete/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const brand = yield prisma.brands.findFirst({
            where: { Id: id },
        });
        if (!brand) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        yield prisma.brands.delete({
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json({ message: "Deleted!" });
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.put("/brand/update/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const brandLisat = yield prisma.brands.findFirst({
            where: { Id: id },
        });
        if (!brandLisat) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "Not found!" });
        }
        const { Name } = req === null || req === void 0 ? void 0 : req.body;
        const updateInfo = yield prisma.brands.update({
            data: { Name: Name, UpdatedBy: req.userEmail, UpdateDate: new Date() },
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(updateInfo);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.get("/categories/get", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield prisma.categories.findMany({
            orderBy: { Id: "desc" },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, category, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.get("/categories/getById/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const getById = yield prisma.categories.findFirst({
            where: { Id: id },
        });
        if (!getById) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ Message: "Not found" });
        }
        return res.status(200 /* HttpStatusCode.Ok */).json(getById);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.post("/categories/create", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = req === null || req === void 0 ? void 0 : req.body;
        const categoryInfo = yield prisma.categories.create({
            data: { Name: category === null || category === void 0 ? void 0 : category.Name, CreatedBy: req.userEmail },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(categoryInfo);
    }
    catch (error) {
        return res.status(400 /* HttpStatusCode.BadRequest */).json(error);
    }
}));
app.put("/categories/update/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const categoryLisat = yield prisma.categories.findFirst({
            where: { Id: id },
        });
        if (!categoryLisat) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "Not found!" });
        }
        const { Name } = req === null || req === void 0 ? void 0 : req.body;
        const updateInfo = yield prisma.categories.update({
            data: { Name: Name, UpdatedBy: req.userEmail, UpdateDate: new Date() },
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(updateInfo);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.delete("/categories/delete/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const category = yield prisma.categories.findFirst({
            where: { Id: id },
        });
        if (!category) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        yield prisma.categories.delete({
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json({ message: "Deleted!" });
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.get("/subcategories/get", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subcategories = yield prisma.subCategories.findMany({
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
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, subcategories, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.get("/subcategories/getById/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const subcategories = yield prisma.subCategories.findFirst({
            where: {
                Id: id,
            },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(subcategories);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.post("/subcategories/create", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subcategories = req === null || req === void 0 ? void 0 : req.body;
        const subCategoriesdata = yield prisma.subCategories.create({
            data: {
                Name: subcategories === null || subcategories === void 0 ? void 0 : subcategories.Name,
                CategoryId: subcategories === null || subcategories === void 0 ? void 0 : subcategories.CategoryId,
                CreatedBy: req.userEmail,
                CreateDate: new Date(),
            },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(subCategoriesdata);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.put("/subcategories/update/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.subCategories.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        const updatedReq = req === null || req === void 0 ? void 0 : req.body;
        const subCategory = yield prisma.subCategories.update({
            data: {
                Name: updatedReq === null || updatedReq === void 0 ? void 0 : updatedReq.Name,
                CategoryId: updatedReq === null || updatedReq === void 0 ? void 0 : updatedReq.CategoryId,
                UpdatedBy: req.userEmail,
                UpdateDate: new Date(),
            },
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(subCategory);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.delete("/subcategories/delete/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.subCategories.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        yield prisma.subCategories.delete({
            where: { Id: id },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json({ message: "successfully deleted" });
    }
    catch (error) {
        return res.status(400 /* HttpStatusCode.BadRequest */).json({ message: "invalid" });
    }
}));
app.get("/variation/get", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const variationsList = yield prisma.variations.findMany({
            orderBy: { Id: "desc" },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, variationsList, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.get("/variation/getBYId/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const variationsList = yield prisma.variations.findFirst({
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(variationsList);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.post("/variation/create", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const variation = req === null || req === void 0 ? void 0 : req.body;
        const createVariation = yield prisma.variations.create({
            data: {
                Type: variation === null || variation === void 0 ? void 0 : variation.Type,
                CreatedBy: req.userEmail,
                CreateDate: new Date(),
            },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(createVariation);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.put("/variation/update/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.variations.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        const variation = req === null || req === void 0 ? void 0 : req.body;
        const updateVariation = yield prisma.variations.update({
            data: {
                Type: variation === null || variation === void 0 ? void 0 : variation.Type,
                UpdatedBy: req.userEmail,
                UpdateDate: new Date(),
            },
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(updateVariation);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.delete("/variation/delete/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.variations.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        yield prisma.variations.delete({
            where: { Id: id },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json({ message: "successfully deleted" });
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.get("/productImage/getByProdutId/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const images = yield prisma.productImages.findFirst({
            where: { ProductId: productId },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(images);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.delete("/productImage/delete/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.productImages.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found" });
        }
        yield prisma.productImages.delete({
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json({ message: "Deletd" });
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.get("/sku/get", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sku = yield prisma.stockKeepingUnits.findMany({
            orderBy: { Id: "desc" },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, sku, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.get("/sku/getById/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const sku = yield prisma.stockKeepingUnits.findFirst({
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(sku);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.post("/sku/create", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sku = req === null || req === void 0 ? void 0 : req.body;
        const createSku = yield prisma.stockKeepingUnits.create({
            data: {
                Name: sku === null || sku === void 0 ? void 0 : sku.Name,
                CreatedBy: req.userEmail,
                CreateDate: new Date(),
            },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(createSku);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.put("/sku/update/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.stockKeepingUnits.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        const sku = req === null || req === void 0 ? void 0 : req.body;
        const updateSku = yield prisma.stockKeepingUnits.update({
            data: {
                Name: sku === null || sku === void 0 ? void 0 : sku.Name,
                UpdatedBy: req.userEmail,
                UpdateDate: new Date(),
            },
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json(updateSku);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.delete("/sku/delete/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.stockKeepingUnits.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found" });
        }
        yield prisma.stockKeepingUnits.delete({
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json({ message: "Deletd" });
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.get("/color/get", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const color = yield prisma.colors.findMany({
            orderBy: { Id: "desc" },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, color, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.get("/color/getById/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const colorGetById = yield prisma.colors.findFirst({
            where: { Id: id },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, colorGetById, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.post("/color/create", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const color = req === null || req === void 0 ? void 0 : req.body;
        const colorCreate = yield prisma.colors.create({
            data: {
                Name: color === null || color === void 0 ? void 0 : color.Name,
                ColorCode: color === null || color === void 0 ? void 0 : color.ColorCode,
                CreatedBy: req === null || req === void 0 ? void 0 : req.userEmail,
                CreateDate: new Date(),
            },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, colorCreate, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.put("/color/update/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.colors.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        const update = req === null || req === void 0 ? void 0 : req.body;
        const updatedData = yield prisma.colors.update({
            data: {
                Name: update === null || update === void 0 ? void 0 : update.Name,
                ColorCode: update.ColorCode,
                UpdatedBy: req.userEmail,
                UpdateDate: new Date(),
            },
            where: {
                Id: id,
            },
        });
        return res
            .status(200 /* HttpStatusCode.Ok */)
            .json(prepareData(200 /* HttpStatusCode.Ok */, updatedData, ""));
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json(prepareData(400 /* HttpStatusCode.BadRequest */, null, error === null || error === void 0 ? void 0 : error.message));
    }
}));
app.delete("/color/delete/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req === null || req === void 0 ? void 0 : req.params.id);
        const isExit = yield prisma.colors.findFirst({
            where: { Id: id },
        });
        if (!isExit) {
            return res
                .status(400 /* HttpStatusCode.BadRequest */)
                .json({ message: "not found!" });
        }
        yield prisma.colors.delete({
            where: { Id: id },
        });
        return res.status(200 /* HttpStatusCode.Ok */).json({ message: "Deletd" });
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
