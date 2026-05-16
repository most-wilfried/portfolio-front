const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000/api');
const LOCAL_API_FALLBACKS = import.meta.env.PROD ? ['/api'] : ['http://127.0.0.1:8000/api', 'http://127.0.0.1:8001/api'];

function getApiBases() {
  const storedBase = import.meta.env.PROD ? null : localStorage.getItem('portfolio_api_base');
  return [...new Set([storedBase, API_BASE, ...LOCAL_API_FALLBACKS].filter(Boolean))];
}

function authHeaders() {
  const token = localStorage.getItem('portfolio_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(withAuth = false) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(withAuth ? authHeaders() : {}),
  };
}

async function request(path, options = {}) {
  let response;
  let lastNetworkError;

  for (const baseUrl of getApiBases()) {
    try {
      response = await fetch(`${baseUrl}${path}`, options);
      localStorage.setItem('portfolio_api_base', baseUrl);
      break;
    } catch (error) {
      lastNetworkError = error;
    }
  }

  if (!response) {
    const triedUrls = getApiBases().join(', ');

    throw {
      message: `Impossible de joindre l'API Laravel. Ports essayés : ${triedUrls}. Vérifie que "php artisan serve" est lancé.`,
      cause: lastNetworkError,
    };
  }

  const contentType = response.headers.get('content-type');

  if (!response.ok) {
    const error = contentType?.includes('application/json')
      ? await response.json()
      : { message: response.statusText };
    throw error;
  }

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return null;
}

export function setAuthToken(token) {
  localStorage.setItem('portfolio_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('portfolio_token');
}

export function getAuthToken() {
  return localStorage.getItem('portfolio_token');
}

export function login(email, password) {
  return request('/login', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request('/logout', {
    method: 'POST',
    headers: jsonHeaders(true),
  });
}

export function getMe() {
  return request('/me', {
    headers: jsonHeaders(true),
  });
}

export function fetchResource(path, options = {}) {
  return request(path, {
    headers: options.auth ? jsonHeaders(true) : jsonHeaders(),
  });
}

export function fetchSkills(options = {}) {
  return request(options.includeInactive ? '/skills?include_inactive=1' : '/skills', {
    headers: options.auth ? jsonHeaders(true) : jsonHeaders(),
  });
}

export function fetchProfile() {
  return request('/profile');
}

export function updateProfile(data) {
  return updateResource('/profile', data);
}

export function fetchProjects(options = {}) {
  return request('/projects', {
    headers: options.auth ? jsonHeaders(true) : jsonHeaders(),
  });
}

export function fetchExperiences(options = {}) {
  return request('/experiences', {
    headers: options.auth ? jsonHeaders(true) : jsonHeaders(),
  });
}

export function fetchCertifications(options = {}) {
  return request('/certifications', {
    headers: options.auth ? jsonHeaders(true) : jsonHeaders(),
  });
}

export function fetchMessages() {
  return request('/messages', {
    headers: jsonHeaders(true),
  });
}

export function sendContactMessage(data) {
  return request('/contact', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export function createResource(path, data) {
  let options;

  if (data instanceof FormData) {
    options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...authHeaders(),
      },
      body: data,
    };
  } else {
    options = {
      method: 'POST',
      headers: jsonHeaders(true),
      body: JSON.stringify(data),
    };
  }

  return request(path, options);
}

export function updateResource(path, data) {
  let options;

  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...authHeaders(),
      },
      body: data,
    };
  } else {
    options = {
      method: 'PUT',
      headers: jsonHeaders(true),
      body: JSON.stringify(data),
    };
  }

  return request(path, options);
}

export function deleteResource(path) {
  return request(path, {
    method: 'DELETE',
    headers: jsonHeaders(true),
  });
}
