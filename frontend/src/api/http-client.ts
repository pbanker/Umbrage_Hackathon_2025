const baseUrl = '/api/v1';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  responseType?: 'blob' | 'json';
}

interface APIError extends Error {
  status?: number;
  response?: any;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(url: string, options: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, options);
    if (!response.ok) {
      const error: APIError = new Error('HTTP Error');
      error.status = response.status;
      error.response = await response.json();
      throw error;
    }
    if (options.responseType === 'blob') {
      const blob = await response.blob();
      return { blob, headers: response.headers } as T;
    }
    return response.json();
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  post<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  put<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  patch<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  delete<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

}

export const apiClient = new APIClient(baseUrl);
