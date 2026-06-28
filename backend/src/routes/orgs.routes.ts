import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { sendError } from "../utils/http";

const router = Router();
const slugPattern = /^[a-z0-9-]+$/;

router.get("/", async (_req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(organizations);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to fetch organizations");
  }
});

router.post("/", requireAuth(["super_admin"]), async (req: Request, res: Response) => {
  const { name, slug } = req.body as { name?: string; slug?: string };

  if (!name || !slug) {
    return sendError(res, 400, "Validation error", "Name and slug are required");
  }

  if (!slugPattern.test(slug)) {
    return sendError(
      res,
      400,
      "Validation error",
      "Slug must contain only lowercase letters, numbers, and hyphens"
    );
  }

  try {
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    });

    if (existingOrg) {
      return sendError(res, 409, "Conflict", "Slug already taken");
    }

    const organization = await prisma.organization.create({
      data: { name, slug }
    });

    return res.status(201).json(organization);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to create organization");
  }
});

export default router;
