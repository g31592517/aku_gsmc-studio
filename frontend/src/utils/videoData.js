export const driveGalleryLink =
  "https://drive.google.com/drive/folders/1MGfyTDy9szZlN9V50JYJsMfRPKtePoJl?usp=sharing";

export function getYoutubeThumbnailUrl(youtubeId) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function getYoutubeWatchUrl(youtubeId) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function getYoutubeEmbedUrl(youtubeId) {
  return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
}
