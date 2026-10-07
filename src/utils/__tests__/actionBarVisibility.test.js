import { describe, expect, it, vi } from 'vitest'
import {
  computeActionBarVisible,
  observeActionBarVisibility,
} from '../actionBarVisibility'

describe('computeActionBarVisible', () => {
  it('hides the bar while the header is visible', () => {
    expect(
      computeActionBarVisible({ headerIntersecting: true, footerIntersecting: false }),
    ).toBe(false)
  })

  it('shows the bar once the header has left the viewport', () => {
    expect(
      computeActionBarVisible({ headerIntersecting: false, footerIntersecting: false }),
    ).toBe(true)
  })

  it('hides the bar while the footer is visible, even if the header is gone', () => {
    expect(
      computeActionBarVisible({ headerIntersecting: false, footerIntersecting: true }),
    ).toBe(false)
  })

  it('hides the bar when both header and footer are visible', () => {
    expect(
      computeActionBarVisible({ headerIntersecting: true, footerIntersecting: true }),
    ).toBe(false)
  })
})

function createFakeObserver() {
  const state = { callback: null, observed: [], disconnected: false }
  const observerFactory = (callback) => {
    state.callback = callback
    return {
      observe: (target) => state.observed.push(target),
      disconnect: () => {
        state.disconnected = true
      },
    }
  }
  return { state, observerFactory }
}

describe('observeActionBarVisibility', () => {
  const header = { id: 'header' }
  const footer = { id: 'footer' }

  it('observes both the header and footer exactly once', () => {
    const { state, observerFactory } = createFakeObserver()
    observeActionBarVisibility({ header, footer, onVisible: () => {}, observerFactory })
    expect(state.observed).toEqual([header, footer])
  })

  it('reports visibility from the latest header/footer intersection state', () => {
    const { state, observerFactory } = createFakeObserver()
    const onVisible = vi.fn()
    observeActionBarVisibility({ header, footer, onVisible, observerFactory })

    state.callback([{ target: header, isIntersecting: true }])
    expect(onVisible).toHaveBeenLastCalledWith(false)

    state.callback([{ target: header, isIntersecting: false }])
    expect(onVisible).toHaveBeenLastCalledWith(true)

    state.callback([{ target: footer, isIntersecting: true }])
    expect(onVisible).toHaveBeenLastCalledWith(false)

    state.callback([{ target: footer, isIntersecting: false }])
    expect(onVisible).toHaveBeenLastCalledWith(true)
  })

  it('keeps the other target state across partial callback batches', () => {
    const { state, observerFactory } = createFakeObserver()
    const onVisible = vi.fn()
    observeActionBarVisibility({ header, footer, onVisible, observerFactory })

    state.callback([{ target: footer, isIntersecting: true }])
    expect(onVisible).toHaveBeenLastCalledWith(false)
    // Header leaves the viewport while the footer is still intersecting:
    // the footer state must persist, so the bar stays hidden.
    state.callback([{ target: header, isIntersecting: false }])
    expect(onVisible).toHaveBeenLastCalledWith(false)
  })

  it('disconnects the observer on cleanup', () => {
    const { state, observerFactory } = createFakeObserver()
    const disconnect = observeActionBarVisibility({
      header,
      footer,
      onVisible: () => {},
      observerFactory,
    })
    disconnect()
    expect(state.disconnected).toBe(true)
  })

  it('no-ops when a target is missing', () => {
    const { state, observerFactory } = createFakeObserver()
    const disconnect = observeActionBarVisibility({
      header: null,
      footer,
      onVisible: () => {},
      observerFactory,
    })
    expect(state.observed).toEqual([])
    expect(() => disconnect()).not.toThrow()
  })
})
