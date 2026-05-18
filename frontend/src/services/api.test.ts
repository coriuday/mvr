/**
 * @jest-environment node
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// In Node environment, we need to mock window and localStorage before importing api
// because the import evaluates code that accesses these globals.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).window = {
  location: { href: '' }
};

const store: Record<string, string> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).localStorage = {
  setItem: jest.fn((key: string, value: string) => {
    store[key] = value;
  }),
  getItem: jest.fn((key: string) => {
    return store[key] || null;
  }),
  removeItem: jest.fn((key: string) => {
    delete store[key];
  }),
  clear: jest.fn(() => {
    for (const key in store) delete store[key];
  })
};

// Now import API
import api from './api';

describe('api interceptors', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window.location.href = '';
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should clear tokens and redirect to login when refresh token request fails', async () => {
    localStorage.setItem('mvr_access_token', 'old_access_token');
    localStorage.setItem('mvr_refresh_token', 'old_refresh_token');

    mock.onGet('/test-endpoint').reply(401);

    const postSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Refresh failed'));

    try {
      await api.get('/test-endpoint');
    } catch {
      // expected
    }

    expect(localStorage.removeItem).toHaveBeenCalledWith('mvr_access_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('mvr_refresh_token');
    expect(window.location.href).toBe('/admin/login');

    postSpy.mockRestore();
  });
});
