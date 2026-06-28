import { Router, Response } from "express";
import { prisma } from "../prisma";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";
import { sendError } from "../utils/http";

const router = Router();
const featureKeyPattern = /^[a-z0-9_]+$/;

router.post("/check", requireAuth(["end_user"]), async (req: AuthenticatedRequest, res: Response) => {
  const { featureKey } = req.body as { featureKey?: string };
  const orgId = req.user?.orgId;

  if (!featureKey || !orgId) {
    return sendError(res, 400, "Validation error", "Feature key is required");
  }

  try {
    const featureFlag = await prisma.featureFlag.findUnique({
      where: {
        orgId_featureKey: {
          orgId,
          featureKey
        }
      }
    });

    if (!featureFlag) {
      return res.json({
        found: false,
        featureKey,
        isEnabled: null
      });
    }

    return res.json({
      found: true,
      featureKey,
      isEnabled: featureFlag.isEnabled
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to check feature flag");
  }
});

router.use(requireAuth(["org_admin"]));

router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId;

  if (!orgId) {
    return sendError(res, 403, "Forbidden", "Organization scope is required");
  }

  try {
    const flags = await prisma.featureFlag.findMany({
      where: { orgId },
      select: {
        id: true,
        featureKey: true,
        isEnabled: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(flags);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to fetch feature flags");
  }
});

router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const { featureKey, isEnabled } = req.body as {
    featureKey?: string;
    isEnabled?: boolean;
  };
  const orgId = req.user?.orgId;

  if (!orgId) {
    return sendError(res, 403, "Forbidden", "Organization scope is required");
  }

  if (!featureKey || !featureKeyPattern.test(featureKey)) {
    return sendError(
      res,
      400,
      "Validation error",
      "Feature key must contain only lowercase letters, numbers, and underscores"
    );
  }

  try {
    const existingFlag = await prisma.featureFlag.findUnique({
      where: {
        orgId_featureKey: {
          orgId,
          featureKey
        }
      }
    });

    if (existingFlag) {
      return sendError(res, 409, "Conflict", "Feature key already exists");
    }

    const featureFlag = await prisma.featureFlag.create({
      data: {
        featureKey,
        isEnabled: typeof isEnabled === "boolean" ? isEnabled : false,
        orgId
      }
    });

    return res.status(201).json(featureFlag);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to create feature flag");
  }
});

router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { isEnabled } = req.body as { isEnabled?: boolean };
  const orgId = req.user?.orgId;

  if (!orgId) {
    return sendError(res, 403, "Forbidden", "Organization scope is required");
  }

  if (typeof isEnabled !== "boolean") {
    return sendError(res, 400, "Validation error", "isEnabled must be a boolean");
  }

  try {
    const existingFlag = await prisma.featureFlag.findFirst({
      where: {
        id,
        orgId
      }
    });

    if (!existingFlag) {
      return sendError(res, 404, "Not found", "Feature flag not found");
    }

    const updatedFlag = await prisma.featureFlag.update({
      where: { id },
      data: { isEnabled }
    });

    return res.json(updatedFlag);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to update feature flag");
  }
});

router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = req.user?.orgId;

  if (!orgId) {
    return sendError(res, 403, "Forbidden", "Organization scope is required");
  }

  try {
    const existingFlag = await prisma.featureFlag.findFirst({
      where: {
        id,
        orgId
      }
    });

    if (!existingFlag) {
      return sendError(res, 404, "Not found", "Feature flag not found");
    }

    await prisma.featureFlag.delete({
      where: { id }
    });

    return res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server error", "Unable to delete feature flag");
  }
});

export default router;
