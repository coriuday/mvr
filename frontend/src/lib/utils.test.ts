import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge basic tailwind classes', () => {
    expect(cn('p-2', 'm-2')).toBe('p-2 m-2');
  });

  it('should resolve tailwind class conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('px-2', 'p-4')).toBe('p-4');
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('p-2', true && 'm-2', false && 'text-red-500')).toBe('p-2 m-2');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['p-2', 'm-2'])).toBe('p-2 m-2');
    expect(cn('flex', ['items-center', 'justify-center'])).toBe('flex items-center justify-center');
  });

  it('should handle undefined and null values', () => {
    expect(cn('p-2', undefined, null, 'm-2')).toBe('p-2 m-2');
  });

  it('should handle object syntax (clsx feature)', () => {
    expect(cn('p-2', { 'm-2': true, 'text-red-500': false })).toBe('p-2 m-2');
  });
});
