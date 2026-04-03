/**
 * Common Helper Functions
 *
 * - toFormData: Converts a plain JS object to FormData for multipart API requests.
 * - extractErrorMessage: Robust error parsing for API responses.
 */
export const toFormData = async (data = {}) => {
  const fd = new FormData();

  // append your simple key/values
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, typeof v === 'string' ? v : String(v)); // ensure string
  });

  return fd;
};

export const extractErrorMessage = err => {
  if (!err) return 'Something went wrong';
  if (typeof err === 'string') return err;
  if (err?.data?.message) return String(err.data.message);
  if (err?.data?.errors && typeof err.data.errors === 'object') {
    const first = Object.values(err.data.errors).flat()[0];
    if (first) return String(first);
  }
  if (err?.status === 'FETCH_ERROR')
    return err?.error || 'Network error - check API URL and connection';
  if (err?.status === 401) return 'Invalid credentials';
  if (err?.status === 404) return 'Endpoint not found (404)';
  if (err?.status === 500) return 'Server error (500)';
  if (typeof err?.status === 'number')
    return `Request failed (${err.status})`;
  return 'Unexpected error';
};
