import { API_BASE_URL } from "./api";

// Normalizes the API's snake_case DB columns into the camelCase shape the
// existing gallery/card/lightbox components already expect.
export function mapInspirationAsset(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    mediaType: row.media_type,
    category: row.category,
    placement: row.placement,
    youtubeId: row.youtube_id,
    imageUrl:
      row.media_type === "image" && row.file_path
        ? `${API_BASE_URL}/uploads/${row.file_path}`
        : null,
    isPublished: !!row.is_published,
    displayOrder: row.display_order,
  };
}
