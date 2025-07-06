const baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper function to handle responses
const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get headers with auth token
const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API object with methods similar to axios
const api = {
  get: async (url: string): Promise<{ data: any }> => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return { data: await handleResponse(response) };
  },

  post: async (url: string, data?: any): Promise<{ data: any }> => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return { data: await handleResponse(response) };
  },

  put: async (url: string, data?: any): Promise<{ data: any }> => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return { data: await handleResponse(response) };
  },

  delete: async (url: string): Promise<{ data: any }> => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return { data: await handleResponse(response) };
  },

  patch: async (url: string, data?: any): Promise<{ data: any }> => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return { data: await handleResponse(response) };
  }
};

export default api;