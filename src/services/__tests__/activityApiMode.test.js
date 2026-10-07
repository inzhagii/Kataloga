/**
 * Regression guard for P0-3: Recent Activity is backend-created
 * (docs/AGENTS.md §20). In API mode the frontend must never POST /activities;
 * recording is a deliberate no-op and only the development mock persists.
 * The module graph is re-imported after stubbing VITE_DATA_SOURCE so the
 * data-source constant is evaluated in API mode.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('activity recording in API mode', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('never issues an HTTP request and resolves null for every helper', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const { recordProductPublished, recordProductEdited, recordStoreUpdated } = await import(
      '../activityService'
    )

    await expect(recordProductPublished('Produk Uji', { productId: 1 })).resolves.toBeNull()
    await expect(recordProductEdited('Produk Uji', { productId: 1 })).resolves.toBeNull()
    await expect(recordStoreUpdated()).resolves.toBeNull()

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('exposes no activity POST on the API adapter', async () => {
    const activityApi = await import('../adapters/api/activityApi')
    expect(activityApi.recordActivity).toBeUndefined()
    expect(typeof activityApi.listRecentActivities).toBe('function')
  })
})
