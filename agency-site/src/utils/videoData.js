export const featuredVideoReel = [
  { id: "vFCZQL-MR4A", category: "Podcast Production", youtubeId: "vFCZQL-MR4A" },
  { id: "IvzBM_vPh_A", category: "Podcast Production", youtubeId: "IvzBM_vPh_A" },
  { id: "iD_MjHRaZyM", category: "Podcast Production", youtubeId: "iD_MjHRaZyM" },
  { id: "NgXfFtAGnVM", category: "Podcast Production", youtubeId: "NgXfFtAGnVM" },
  { id: "J5QSvej1bbM", category: "Audio Production", youtubeId: "J5QSvej1bbM" },
  { id: "YopUhBbVkRc", category: "Audio Production", youtubeId: "YopUhBbVkRc" },
  { id: "NURtB7YDzKM", category: "Video Production", youtubeId: "NURtB7YDzKM" },
  { id: "1O0e4Ar1kHI", category: "Video Production", youtubeId: "1O0e4Ar1kHI" },
  { id: "m0b-fMFh-UU", category: "Video Production", youtubeId: "m0b-fMFh-UU" },
  { id: "E24imI3A_Ic", category: "Video Production", youtubeId: "E24imI3A_Ic" },
  { id: "-xFqwizHCu4", category: "Video Production", youtubeId: "-xFqwizHCu4" },
];

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
