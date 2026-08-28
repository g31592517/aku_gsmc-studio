import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Upload, Video as VideoIcon } from "lucide-react";
import { apiFetch } from "../utils/api";
import { getYoutubeThumbnailUrl } from "../utils/videoData";
import { mapInspirationAsset } from "../utils/inspirationAssets";

const VIDEO_CATEGORIES = ["Podcast Production", "Audio Production", "Video Production"];
const PLACEMENT_OPTIONS = [
  { value: "inspiration", label: "Inspiration" },
  { value: "featured_work", label: "Featured Work" },
  { value: "both", label: "Both" },
];

function parseYoutubeId(input) {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
    return embedMatch ? embedMatch[1] : null;
  } catch {
    return null;
  }
}

const emptyForm = {
  id: null,
  mediaType: "image",
  title: "",
  description: "",
  category: "",
  placement: "inspiration",
  youtubeInput: "",
  isPublished: false,
};

export default function StaffInspirationPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchAssets() {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/inspiration-assets/all");
      const data = await res.json();
      if (data.success) setAssets(data.data.map(mapInspirationAsset));
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    const res = await apiFetch("/api/service-categories");
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }

  useEffect(() => {
    fetchAssets();
    fetchCategories();
  }, []);

  const filteredAssets = categoryFilter ? assets.filter((a) => a.category === categoryFilter) : assets;

  function openCreateModal() {
    setForm(emptyForm);
    setSelectedFile(null);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(asset) {
    setForm({
      id: asset.id,
      mediaType: asset.mediaType,
      title: asset.title || "",
      description: asset.description || "",
      category: asset.category,
      placement: asset.placement,
      youtubeInput: asset.youtubeId || "",
      isPublished: asset.isPublished,
    });
    setSelectedFile(null);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  async function handleTogglePublish(asset) {
    await apiFetch(`/api/inspiration-assets/${asset.id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished: !asset.isPublished }),
    });
    fetchAssets();
  }

  async function handleDelete(asset) {
    const label = asset.title || `${asset.category} video`;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    await apiFetch(`/api/inspiration-assets/${asset.id}`, { method: "DELETE" });
    fetchAssets();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (form.mediaType === "image" && !selectedFile && !form.id) {
      setErrorMessage("Please select an image file.");
      return;
    }
    if (!form.category) {
      setErrorMessage("Please select a category.");
      return;
    }

    let youtubeId = "";
    if (form.mediaType === "video" && form.youtubeInput.trim() && !selectedFile) {
      youtubeId = parseYoutubeId(form.youtubeInput);
      if (!youtubeId) {
        setErrorMessage("Could not parse that YouTube link or ID.");
        return;
      }
    }
    if (form.mediaType === "video" && !youtubeId && !selectedFile && !form.id) {
      setErrorMessage("Provide a YouTube link/ID or upload a video file.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("mediaType", form.mediaType);
      formData.append("category", form.category);
      formData.append("placement", form.mediaType === "image" ? "inspiration" : form.placement);
      if (form.title.trim()) formData.append("title", form.title.trim());
      if (form.description.trim()) formData.append("description", form.description.trim());
      formData.append("isPublished", String(form.isPublished));
      if (youtubeId) formData.append("youtubeId", youtubeId);
      if (selectedFile) formData.append("file", selectedFile);

      const endpoint = form.id ? `/api/inspiration-assets/${form.id}` : "/api/inspiration-assets";
      const method = form.id ? "PATCH" : "POST";
      const res = await apiFetch(endpoint, { method, body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Could not save asset.");

      setIsModalOpen(false);
      fetchAssets();
    } catch (error) {
      setErrorMessage(error.message || "Could not save asset.");
    } finally {
      setIsSaving(false);
    }
  }

  const categoryOptions = Array.from(new Set(assets.map((a) => a.category))).sort();

  return (
    <div className="min-h-screen bg-surface-subtle pt-header pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/staff/dashboard"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-aku-green transition-colors mb-8 font-medium w-fit"
        >
           Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-aku-greenLight text-xs font-semibold tracking-widest uppercase">
              Staff Portal
            </span>
            <h1 className="font-display font-extrabold text-3xl text-text-primary mt-1">
              Inspiration and  Assets
            </h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-aku-primary text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:shadow-glow-green transition-all duration-300 w-fit"
          >
            <Plus size={16} aria-hidden="true" />
            Add New Asset
          </button>
        </div>

        <div className="mb-6">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors"
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-overlay rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-16 bg-white border border-surface-border rounded-3xl">
            <p className="text-text-muted text-base">No assets yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-surface-border rounded-2xl overflow-hidden divide-y divide-surface-border">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-subtle flex-shrink-0 flex items-center justify-center">
                  {asset.mediaType === "image" ? (
                    <img src={asset.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : asset.youtubeId ? (
                    <img src={getYoutubeThumbnailUrl(asset.youtubeId)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <VideoIcon size={20} className="text-text-muted" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {asset.title || "(untitled video)"}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {asset.category} · {asset.mediaType} · {asset.placement}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    asset.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {asset.isPublished ? "Published" : "Unpublished"}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(asset)}
                    className="p-2 rounded-lg text-text-muted hover:text-aku-green hover:bg-surface-subtle transition-colors"
                    aria-label={asset.isPublished ? "Unpublish" : "Publish"}
                  >
                    {asset.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => openEditModal(asset)}
                    className="p-2 rounded-lg text-text-muted hover:text-aku-green hover:bg-surface-subtle transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(asset)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: "rgba(10,26,15,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-overlay flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={15} aria-hidden="true" />
            </button>

            <h2 className="font-display font-extrabold text-2xl text-text-primary mb-6">
              {form.id ? "Edit Asset" : "Add New Asset"}
            </h2>

            <form onSubmit={handleSubmit}>
              {!form.id && (
                <div className="flex gap-2 mb-5">
                  {["image", "video"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mediaType: type, category: "" }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
                        form.mediaType === type ? "bg-aku-primary text-white" : "bg-surface-subtle text-text-muted"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Title {form.mediaType === "video" && "(optional — auto-fetched from YouTube if left blank)"}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required={form.mediaType === "image"}
                  className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  required
                  className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors"
                >
                  <option value="">Select category...</option>
                  {(form.mediaType === "image" ? categories.map((c) => c.name) : VIDEO_CATEGORIES).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {form.mediaType === "video" && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                    Placement
                  </label>
                  <select
                    value={form.placement}
                    onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
                    className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors"
                  >
                    {PLACEMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.mediaType === "video" && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                    YouTube link or ID (leave blank if uploading a video file below)
                  </label>
                  <input
                    type="text"
                    value={form.youtubeInput}
                    onChange={(e) => setForm((f) => ({ ...f, youtubeInput: e.target.value }))}
                    placeholder="https://youtu.be/..."
                    className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors"
                  />
                </div>
              )}

              <div className="mb-5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  {form.mediaType === "image" ? "Image file" : "Or upload a video file"}
                  {form.id ? " (leave blank to keep current file)" : ""}
                </label>
                <div
                  className="rounded-xl border-2 border-dashed border-surface-border hover:border-aku-green/40 p-5 text-center cursor-pointer transition-colors"
                  onClick={() => document.getElementById("staff-inspiration-file-input").click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && document.getElementById("staff-inspiration-file-input").click()}
                >
                  <input
                    id="staff-inspiration-file-input"
                    type="file"
                    accept={form.mediaType === "image" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/quicktime"}
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  />
                  <Upload size={18} className="text-text-muted mx-auto mb-1" aria-hidden="true" />
                  <p className="text-xs text-text-primary">
                    {selectedFile ? selectedFile.name : "Click to select a file"}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-text-secondary">Published (visible to clients)</span>
              </label>

              {errorMessage && (
                <p className="text-red-500 text-sm mb-4" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-aku-primary text-white font-semibold text-sm py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-green transition-all duration-300"
              >
                {isSaving ? "Saving…" : form.id ? "Save Changes" : "Add Asset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
