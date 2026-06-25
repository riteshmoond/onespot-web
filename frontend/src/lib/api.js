export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://onespot-web.onrender.com";

export function getImageUrl(img) {
  if (!img) return "";
  if (
    img.startsWith("http") ||
    img.startsWith("/img") ||
    img.startsWith("/assets") ||
    img.startsWith("data:")
  ) {
    return img;
  }
  return `${API_BASE_URL}${img}`;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem("adminToken");
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function setSession(data) {
  if (data.token) {
    localStorage.setItem("adminToken", data.token);
  }
}
