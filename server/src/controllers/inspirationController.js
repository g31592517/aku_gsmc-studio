const pool = require("../config/database");

async function getInspirationItems(req, res, next) {
  try {
    const { category, search } = req.query;

    let query = "SELECT * FROM inspiration_items";
    const conditions = [];
    const params = [];

    if (category && category !== "All") {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

async function toggleLike(req, res, next) {
  try {
    const { id } = req.params;
    const { liked } = req.body;

    const delta = liked ? 1 : -1;

    const result = await pool.query(
      "UPDATE inspiration_items SET like_count = GREATEST(like_count + $1, 0) WHERE id = $2 RETURNING id, like_count",
      [delta, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function toggleSave(req, res, next) {
  try {
    const { id } = req.params;
    const { saved } = req.body;

    const delta = saved ? 1 : -1;

    const result = await pool.query(
      "UPDATE inspiration_items SET save_count = GREATEST(save_count + $1, 0) WHERE id = $2 RETURNING id, save_count",
      [delta, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { getInspirationItems, toggleLike, toggleSave };
