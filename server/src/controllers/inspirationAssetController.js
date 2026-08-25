const fs = require("fs");
const path = require("path");
const queries = require("../db/queries");

async function deleteFileIfExists(filePath) {
  if (!filePath) return;
  try {
    await fs.promises.unlink(path.join(__dirname, "../uploads", filePath));
  } catch (err) {
    if (err.code !== "ENOENT") console.error("Could not delete file:", err.message);
  }
}

function toBool(value, fallback) {
  if (value === undefined) return fallback;
  return value === "true" || value === true;
}

async function listPublishedAssets(req, res, next) {
  try {
    const { placement, category } = req.query;
    const data = await queries.findPublishedInspirationAssets({ placement, category });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listAllAssets(req, res, next) {
  try {
    const { placement, category, mediaType } = req.query;
    const data = await queries.findAllInspirationAssets({ placement, category, mediaType });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createAsset(req, res, next) {
  try {
    const { title, description, mediaType, category, placement, youtubeId, isPublished, displayOrder } = req.body;

    if (mediaType === "image" && !req.file) {
      return res.status(400).json({ success: false, message: "An image file is required." });
    }
    if (mediaType === "video" && !req.file && !youtubeId) {
      return res.status(400).json({ success: false, message: "Provide a YouTube ID or upload a video file." });
    }

    const newId = await queries.insertInspirationAsset({
      title: title || null,
      description,
      mediaType,
      category,
      placement: placement || "inspiration",
      youtubeId: youtubeId || null,
      filePath: req.file ? req.file.filename : null,
      mimeType: req.file ? req.file.mimetype : null,
      fileSizeBytes: req.file ? req.file.size : null,
      isPublished: toBool(isPublished, false),
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      createdBy: req.user.userId,
    });

    const created = await queries.findInspirationAssetById(newId);
    res.status(201).json({ success: true, message: "Asset created.", data: created });
  } catch (error) {
    if (req.file) deleteFileIfExists(req.file.filename).catch(() => {});
    next(error);
  }
}

async function updateAsset(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await queries.findInspirationAssetById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Asset not found." });

    const { title, description, mediaType, category, placement, youtubeId, isPublished, displayOrder } = req.body;

    let filePath = existing.file_path;
    let mimeType = existing.mime_type;
    let fileSizeBytes = existing.file_size_bytes;

    if (req.file) {
      await deleteFileIfExists(existing.file_path);
      filePath = req.file.filename;
      mimeType = req.file.mimetype;
      fileSizeBytes = req.file.size;
    }

    await queries.updateInspirationAsset(id, {
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      mediaType: mediaType || existing.media_type,
      category: category || existing.category,
      placement: placement || existing.placement,
      youtubeId: youtubeId !== undefined ? youtubeId : existing.youtube_id,
      filePath,
      mimeType,
      fileSizeBytes,
      isPublished: toBool(isPublished, !!existing.is_published),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.display_order,
      updatedBy: req.user.userId,
    });

    res.json({ success: true, message: "Asset updated.", data: await queries.findInspirationAssetById(id) });
  } catch (error) {
    if (req.file) deleteFileIfExists(req.file.filename).catch(() => {});
    next(error);
  }
}

async function togglePublishState(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await queries.findInspirationAssetById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Asset not found." });

    await queries.setInspirationAssetPublishState(id, toBool(req.body.isPublished, true), req.user.userId);
    res.json({ success: true, data: await queries.findInspirationAssetById(id) });
  } catch (error) {
    next(error);
  }
}

async function deleteAsset(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await queries.findInspirationAssetById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Asset not found." });

    await deleteFileIfExists(existing.file_path);
    await queries.deleteInspirationAsset(id);
    res.json({ success: true, message: "Asset deleted." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPublishedAssets,
  listAllAssets,
  createAsset,
  updateAsset,
  togglePublishState,
  deleteAsset,
};
