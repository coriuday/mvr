import { renderHook } from '@testing-library/react';
import { useAdminAuth } from './useAdminAuth';

const mockReplace = jest.fn();
const mockRouter = { replace: mockReplace };

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('useAdminAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to login when token is missing', () => {
    renderHook(() => useAdminAuth());
    expect(mockReplace).toHaveBeenCalledWith('/admin/login');
  });

  it('should redirect to login when user is not an admin', () => {
    localStorage.setItem('mvr_access_token', 'valid-token');
    localStorage.setItem('mvr_user', JSON.stringify({ role: 'USER' }));
    renderHook(() => useAdminAuth());
    expect(mockReplace).toHaveBeenCalledWith('/admin/login');
  });

  it('should redirect to login when user JSON is invalid (exception path)', () => {
    localStorage.setItem('mvr_access_token', 'valid-token');
    localStorage.setItem('mvr_user', 'invalid-json{');
    renderHook(() => useAdminAuth());
    expect(mockReplace).toHaveBeenCalledWith('/admin/login');
  });

  it('should set auth state when valid admin user is provided', () => {
    const validUser = { name: 'Admin', email: 'admin@example.com', role: 'ADMIN' };
    localStorage.setItem('mvr_access_token', 'valid-token');
    localStorage.setItem('mvr_user', JSON.stringify(validUser));

    const { result } = renderHook(() => useAdminAuth());

    expect(mockReplace).not.toHaveBeenCalled();
    expect(result.current.token).toBe('valid-token');
    expect(result.current.user).toEqual(validUser);
  });

  it('should handle logout correctly', () => {
    const validUser = { name: 'Admin', email: 'admin@example.com', role: 'ADMIN' };
    localStorage.setItem('mvr_access_token', 'valid-token');
    localStorage.setItem('mvr_refresh_token', 'refresh-token');
    localStorage.setItem('mvr_user', JSON.stringify(validUser));

    const { result } = renderHook(() => useAdminAuth());

    result.current.logout();

    expect(localStorage.getItem('mvr_access_token')).toBeNull();
    expect(localStorage.getItem('mvr_refresh_token')).toBeNull();
    expect(localStorage.getItem('mvr_user')).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/admin/login');
  });
});
