import { useEffect, useState } from 'react'
import { listProvinces, citiesForProvince } from '../services/regionService'

/**
 * Province -> city region data for the My Store location form.
 * Provinces load once; cities reload whenever the selected province changes.
 * While no province is selected the form shows an empty city list in the idle
 * state (derived, so no state reset is needed inside the effect).
 * @param {string} province - Currently selected province name.
 * @returns {{
 *   provinces: string[],
 *   cities: string[],
 *   provincesStatus: 'loading'|'ready'|'error',
 *   citiesStatus: 'idle'|'loading'|'ready'|'error',
 *   error: string,
 *   reloadProvinces: () => void,
 * }}
 */
export function useRegionData(province) {
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [provincesStatus, setProvincesStatus] = useState('loading')
  const [citiesStatus, setCitiesStatus] = useState('idle')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setProvincesStatus('loading')
      setError('')
      try {
        const list = await listProvinces()
        if (!active) {
          return
        }
        setProvinces(list)
        setProvincesStatus('ready')
      } catch (loadError) {
        if (!active) {
          return
        }
        setProvinces([])
        setProvincesStatus('error')
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Gagal memuat provinsi. Silakan coba lagi.',
        )
      }
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey])

  useEffect(() => {
    if (!province) {
      return undefined
    }

    let active = true

    async function loadCities() {
      setCitiesStatus('loading')
      setCities([])
      try {
        const list = await citiesForProvince(province)
        if (!active) {
          return
        }
        setCities(list)
        setCitiesStatus('ready')
      } catch (loadError) {
        if (!active) {
          return
        }
        setCities([])
        setCitiesStatus('error')
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Gagal memuat kota/kabupaten. Silakan coba lagi.',
        )
      }
    }

    loadCities()

    return () => {
      active = false
    }
  }, [province])

  return {
    provinces,
    cities: province ? cities : [],
    provincesStatus,
    citiesStatus: province ? citiesStatus : 'idle',
    error,
    reloadProvinces: () => setReloadKey((value) => value + 1),
  }
}