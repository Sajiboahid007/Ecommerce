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
        req.userEmail = decoded.email;
        next();
    }
    catch (error) {
        return res
            .status(401 /* HttpStatusCode.UnAuthorized */)
            .json({ message: "Invalid or expired token" });
    }
};
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = req === null || req === void 0 ? void 0 : req.body;
        userInfo.Password = yield bcrypt.hash(userInfo.Password, 10);
        const users = yield prisma.users.create({
            data: userInfo,
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
        const token = jwt.sign({ userId: user.Id, email: user.Email }, JWT_SECRET, {
            expiresIn: "5m",
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
        return res.status(200 /* HttpStatusCode.Ok */).json(users);
    }
    catch (error) {
        return res.status(400 /* HttpStatusCode.BadRequest */).json(error);
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
        return res.status(200 /* HttpStatusCode.Ok */).json(brandList);
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
}));
app.get("/test", authenticate, (req, res) => {
    try {
        return res.status(200 /* HttpStatusCode.Ok */).json({ message: "test" });
    }
    catch (error) {
        return res
            .status(400 /* HttpStatusCode.BadRequest */)
            .json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
});
