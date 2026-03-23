// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0

const mockPrompt = jest.fn();

jest.mock('https');
jest.mock('../core/config');
jest.mock('chalk', () => ({ default: { dim: (s: string) => s } }));
jest.mock('inquirer', () => ({ default: { prompt: mockPrompt } }));

import * as https from 'https';
import { EventEmitter } from 'events';
import { loadConfig, saveConfig, getUserId } from '../core/config';
import { trackEvent, askTelemetryConsent } from '../core/telemetry';

const mockLoadConfig = loadConfig as jest.MockedFunction<typeof loadConfig>;
const mockSaveConfig = saveConfig as jest.MockedFunction<typeof saveConfig>;
const mockGetUserId = getUserId as jest.MockedFunction<typeof getUserId>;

function makeConfig(overrides = {}) {
  return { telemetry: false, userId: 'test-uid', firstRun: false, ...overrides };
}

function makeFakeRequest() {
  const req = new EventEmitter() as NodeJS.EventEmitter & {
    write: jest.Mock;
    end: jest.Mock;
    on: jest.Mock;
  };
  req.write = jest.fn();
  req.end = jest.fn();
  req.on = jest.fn();
  return req;
}

describe('trackEvent', () => {
  let originalCI: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    originalCI = process.env.CI;
    delete process.env.CI;
  });

  afterEach(() => {
    if (originalCI !== undefined) process.env.CI = originalCI;
    else delete process.env.CI;
  });

  it('does nothing when telemetry is disabled', () => {
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: false }));

    trackEvent('scaffold', { template: 'web-app' });

    expect(https.request).not.toHaveBeenCalled();
  });

  it('does nothing when running in CI', () => {
    process.env.CI = 'true';
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: true }));

    trackEvent('scaffold', { template: 'web-app' });

    expect(https.request).not.toHaveBeenCalled();
  });

  it('calls https.request when telemetry is enabled and not in CI', () => {
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: true }));
    const fakeReq = makeFakeRequest();
    (https.request as jest.Mock).mockReturnValue(fakeReq);

    trackEvent('scaffold', { template: 'web-app', success: true });

    expect(https.request).toHaveBeenCalledWith(
      expect.objectContaining({ hostname: 'plausible.io', method: 'POST' }),
      expect.any(Function)
    );
    expect(fakeReq.write).toHaveBeenCalled();
    expect(fakeReq.end).toHaveBeenCalled();
  });

  it('sends a JSON payload containing the event name and properties', () => {
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: true }));
    const fakeReq = makeFakeRequest();
    (https.request as jest.Mock).mockReturnValue(fakeReq);

    trackEvent('list', { count: 6 });

    const payload = JSON.parse(fakeReq.write.mock.calls[0][0] as string);
    expect(payload.name).toBe('list');
    expect(payload.props.count).toBe(6);
    expect(typeof payload.props.version).toBe('string');
  });

  it('includes domain and url fields in the payload', () => {
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: true }));
    const fakeReq = makeFakeRequest();
    (https.request as jest.Mock).mockReturnValue(fakeReq);

    trackEvent('scaffold', {});

    const payload = JSON.parse(fakeReq.write.mock.calls[0][0] as string);
    expect(payload.domain).toBe('forgekit.build');
    expect(payload.url).toContain('forgekit');
  });

  it('registers an error handler on the request to suppress network errors', () => {
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: true }));
    const fakeReq = makeFakeRequest();
    (https.request as jest.Mock).mockReturnValue(fakeReq);

    trackEvent('scaffold', {});

    expect(fakeReq.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('does not throw when https.request throws', () => {
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: true }));
    (https.request as jest.Mock).mockImplementation(() => { throw new Error('network error'); });

    expect(() => trackEvent('scaffold', {})).not.toThrow();
  });

  it('does not throw when loadConfig throws', () => {
    mockLoadConfig.mockImplementation(() => { throw new Error('config read error'); });

    expect(() => trackEvent('scaffold', {})).not.toThrow();
  });

  it('the registered error handler does not throw when called', () => {
    mockLoadConfig.mockReturnValue(makeConfig({ telemetry: true }));
    const fakeReq = makeFakeRequest();
    (https.request as jest.Mock).mockReturnValue(fakeReq);

    trackEvent('scaffold', {});

    // Call the registered error handler directly — should be a no-op
    const errorHandler = fakeReq.on.mock.calls.find(
      (call: unknown[]) => call[0] === 'error'
    )?.[1] as ((e: Error) => void) | undefined;
    expect(() => errorHandler?.(new Error('socket hang up'))).not.toThrow();
  });
});

describe('askTelemetryConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserId.mockReturnValue('generated-uid');
    mockSaveConfig.mockReturnValue(undefined);
  });

  it('returns immediately when firstRun is false', async () => {
    mockLoadConfig.mockReturnValue(makeConfig({ firstRun: false }));

    await askTelemetryConsent();

    expect(mockSaveConfig).not.toHaveBeenCalled();
  });

  it('saves config with firstRun:false when not a TTY', async () => {
    mockLoadConfig.mockReturnValue(makeConfig({ firstRun: true }));
    // Jest runs without a TTY so process.stdout.isTTY is falsy by default
    const original = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', { value: undefined, configurable: true });

    await askTelemetryConsent();

    expect(mockSaveConfig).toHaveBeenCalledWith(expect.objectContaining({ firstRun: false }));
    Object.defineProperty(process.stdout, 'isTTY', { value: original, configurable: true });
  });

  it('does not set telemetry when not a TTY (non-interactive default)', async () => {
    mockLoadConfig.mockReturnValue(makeConfig({ firstRun: true, telemetry: false }));
    Object.defineProperty(process.stdout, 'isTTY', { value: undefined, configurable: true });

    await askTelemetryConsent();

    // Non-TTY path sets firstRun:false but does not change telemetry
    const savedConfig = mockSaveConfig.mock.calls[0][0];
    expect(savedConfig.telemetry).toBe(false);
  });

  it('does not throw even when saveConfig throws in non-TTY path', async () => {
    mockLoadConfig.mockReturnValue(makeConfig({ firstRun: true }));
    Object.defineProperty(process.stdout, 'isTTY', { value: undefined, configurable: true });
    mockSaveConfig.mockImplementation(() => { throw new Error('EACCES'); });

    await expect(askTelemetryConsent()).resolves.toBeUndefined();
  });

  it('does not throw when loadConfig throws', async () => {
    mockLoadConfig.mockImplementation(() => { throw new Error('config gone'); });

    await expect(askTelemetryConsent()).resolves.toBeUndefined();
  });
});
