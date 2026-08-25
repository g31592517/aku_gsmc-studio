const express = require("express");
const { body, param, query } = require("express-validator");
const upload = require("../middleware/fileUpload");
const validateRequest = require("../middleware/validateRequest");
const { requireRole } = require("../middleware/auth");
const {
  listPublishedAssets,
  listAllAssets,
  createAsset,
  updateAsset,
  togglePublishState,
  deleteAsset,
} = require("../controllers/inspirationAssetController");

const router = express.Router();

// Public — published assets only
router.get(
  "/",
  [
    query("placement").optional().isIn(["inspiration", "featured_work"]),
    query("category").optional().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  listPublishedAssets
);

// Staff — full list, must be registered before "/:id"-shaped routes
router.get(
  "/all",
  requireRole("staff", "admin"),
  [
    query("placement").optional().isIn(["inspiration", "featured_work"]),
    query("category").optional().trim().isLength({ max: 100 }),
    query("mediaType").optional().isIn(["image", "video"]),
  ],
  validateRequest,
  listAllAssets
);

router.post(
  "/",
  requireRole("staff", "admin"),
  upload.single("file"),
  [
    body("mediaType").isIn(["image", "video"]),
    body("category").trim().notEmpty().isLength({ max: 100 }),
    body("placement").optional().isIn(["inspiration", "featured_work", "both"]),
    body("title").optional().trim().isLength({ max: 200 }),
    body("youtubeId").optional().trim().isLength({ max: 20 }),
  ],
  validateRequest,
  createAsset
);

router.patch(
  "/:id",
  requireRole("staff", "admin"),
  upload.single("file"),
  [
    param("id").isInt(),
    body("mediaType").optional().isIn(["image", "video"]),
    body("category").optional().trim().isLength({ max: 100 }),
    body("placement").optional().isIn(["inspiration", "featured_work", "both"]),
  ],
  validateRequest,
  updateAsset
);

router.patch(
  "/:id/publish",
  requireRole("staff", "admin"),
  [param("id").isInt(), body("isPublished").isBoolean()],
  validateRequest,
  togglePublishState
);

router.delete(
  "/:id",
  requireRole("staff", "admin"),
  [param("id").isInt()],
  validateRequest,
  deleteAsset
);

module.exports = router;
