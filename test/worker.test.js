import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import worker from '../src/worker.js';

const MOCK_PACKAGES_RESPONSE = readFileSync(
  resolve(__dirname, './packages.txt'),
  'utf8'
);

const { mockHtml } = vi.hoisted(() => ({
  mockHtml: '<!DOCTYPE html><html><form id="mock"></form></html>'
}));

const mockEnv = {
  REGISTRY_BASE_URL: 'https://apt.fury.io'
};

const mockMatch = vi.fn();
const mockPut = vi.fn();

vi.mock('../src/index.html', () => ({
  default: mockHtml
}));

global.caches = {
  default: {
    match: mockMatch,
    put: mockPut,
  },
};

describe('Worker Request Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatch.mockResolvedValue(null);
    mockPut.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('successfully parses the highest version from a standard response', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(MOCK_PACKAGES_RESPONSE),
      })
    ));

    const request = new Request('http://localhost?user=vncsmyrnk&pkg=shell-utils');
    const env = {};
    const ctx = { waitUntil: vi.fn() };
    const response = await worker.fetch(request, env, ctx);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');

    const resultText = await response.text();
    expect(resultText).toBe('1.0.0+git242.8b34a8b');
    expect(mockPut).toHaveBeenCalledOnce();
    expect(ctx.waitUntil).toHaveBeenCalledOnce();
  });

  test('returns a 502 error if the upstream registry is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway'
      })
    ));

    const request = new Request('http://localhost?user=name&pkg=package');
    const response = await worker.fetch(request, mockEnv, {});

    expect(response.status).toBe(502);
    const resultText = await response.text();
    expect(resultText).toContain('Failed to fetch upstream');
  });

  test('returns 404 if the upstream registry is empty or unparsable', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
      })
    ));

    const request = new Request('http://localhost?user=name&pkg=package');
    const response = await worker.fetch(request, mockEnv, {});

    expect(response.status).toBe(404);

    const resultText = await response.text();
    expect(resultText).toContain('Package \'package\' not found for user \'name\'.');
  });

  test('returns 400 if "pkg" query string is not present', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
      })
    ));

    const request = new Request('http://localhost?user=name');
    const response = await worker.fetch(request, mockEnv, {});

    expect(response.status).toBe(400);

    const resultText = await response.text();
    expect(resultText).toContain('Missing required \'pkg\' or \'user\' query parameters.');
  });

  test('returns 400 if "user" query string is not present', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
      })
    ));

    const request = new Request('http://localhost?pkg=package');
    const response = await worker.fetch(request, mockEnv, {});

    expect(response.status).toBe(400);

    const resultText = await response.text();
    expect(resultText).toContain('Missing required \'pkg\' or \'user\' query parameters.');
  });

  test('returns the HTML UI with a 400 status when query strings are missing', async () => {
    const request = new Request('http://localhost/');
    const env = {};
    const ctx = { waitUntil: vi.fn() };

    const response = await worker.fetch(request, env, ctx);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(body).toContain(mockHtml);
  });

  test('returns instantly from cache on a HIT', async () => {
    mockMatch.mockResolvedValue(new Response("1.0.0+cached"));

    const request = new Request('http://localhost?user=name&pkg=package');
    const env = {};
    const ctx = { waitUntil: vi.fn() };

    const response = await worker.fetch(request, env, ctx);
    const text = await response.text();

    expect(text).toBe("1.0.0+cached");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
