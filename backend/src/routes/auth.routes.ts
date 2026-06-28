import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { AuthenticatedRequest, requireAuth, JwtUser } from "../middleware/auth";
import { sendError } from "../utils/http";

const router = Router();

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
}

function signToken(payload: JwtUser) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return sendError(res, 400, "Validation error", "Email and password are required");
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  try {
    if (email === superAdminEmail && password === superAdminPassword) {
      const user = {
        id: "super_admin",
        name: "Super Admin",
        email,
        role: "super_admin",
        orgId: null as null
      };

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId
      });

      return res.json({ token, user });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return sendError(res, 404, "Not found", "Email not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendError(res, 401, "Unauthorized", "Wrong credentials");
    }

    const role = user.role.name;
    const token = signToken({
      id: user.id,
      email: user.email,
      role,
      orgId: user.orgId
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        orgId: user.orgId
      }
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to login");
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, orgId, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    orgId?: string;
    role?: "super_admin" | "org_admin" | "end_user";
  };

  if (!name || !email || !password || !orgId || !role) {
    return sendError(
      res,
      400,
      "Validation error",
      "Name, email, password, orgId, and role are required"
    );
  }

  if (role === "super_admin") {
    return sendError(res, 400, "Validation error", "Cannot sign up as super_admin");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return sendError(res, 409, "Conflict", "Email already exists");
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (!org) {
      return sendError(res, 400, "Validation error", "Organization not found");
    }

    const roleRecord = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!roleRecord) {
      return sendError(res, 400, "Validation error", "Role not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        orgId,
        roleId: roleRecord.id
      }
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: roleRecord.name,
      orgId: user.orgId
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleRecord.name,
        orgId: user.orgId
      }
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to sign up");
  }
});

router.get("/me", requireAuth([]), (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized", "Missing user context");
  }

  return res.json(req.user);
});

export default router;
