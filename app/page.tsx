'use client'

import { useState } from 'react'

const services = [
  { name: 'Freedium', url: 'https://freedium.cfd/' },
  { name: '12ft.io', url: 'https://12ft.io/' },
  { name: 'Remove Paywalls', url: 'https://www.removepaywall.com/' },
]

export default function Home() {
  const [url, setUrl] = useState('')
  const [selectedService, setSelectedService] = useState(services[0])
  const [serviceIndex, setServiceIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [finalUrl, setFinalUrl] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  const handleRedirect = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    // Basic URL format validation
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    let currentIndex = serviceIndex
    let triedAll = false
    let lastError = ''

    while (!triedAll) {
      const currentService = services[currentIndex]
      let targetUrl = url
      if (url.includes('medium.com')) {
        targetUrl = currentService.url + url
      }

      setLoading(true)
      setError('')
      setFinalUrl(targetUrl)
      setIframeError(false)

      try {
        const res = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        })
        const data = await res.json()
        if (data.ok) {
          setShowDrawer(true)
          setServiceIndex(currentIndex)
          break
        } else {
          lastError = data.error || 'Could not validate the URL.'
        }
      } catch (err) {
        lastError = 'Could not validate the URL (server error).'
      } finally {
        setLoading(false)
      }

      // Try next service
      currentIndex = (currentIndex + 1) % services.length
      if (currentIndex === serviceIndex) {
        triedAll = true
      }
    }

    if (triedAll) {
      setError(lastError || 'All services failed to validate the URL.')
    }
  }

  const handleClear = () => {
    setUrl('')
    setFinalUrl('')
    setError('')
    setShowDrawer(false)
    setIframeError(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black p-4 sm:p-8 text-white">
      <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-blue-950 p-4 sm:p-10 shadow-2xl border border-blue-800/40">
        <h1 className="mb-2 text-center text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 drop-shadow-lg">Medium Unlocker Pro</h1>
        <p className="mb-8 text-center text-base sm:text-lg text-gray-300 font-medium">
          Instantly unlock Medium.com articles using the best available bypass services. Paste your article URL and let us do the rest!
        </p>

        <div className="flex flex-col gap-4 sm:gap-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your Medium article URL here..."
            className="rounded-xl border-2 border-blue-800/40 bg-gray-900 px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg text-white focus:border-cyan-400 focus:outline-none shadow-inner placeholder-gray-500 w-full"
          />

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
            <span className="text-gray-400 font-semibold">Service:</span>
            <select
              value={selectedService.name}
              onChange={(e) => {
                const idx = services.findIndex((s) => s.name === e.target.value)
                if (idx !== -1) {
                  setSelectedService(services[idx])
                  setServiceIndex(idx)
                }
              }}
              className="rounded-xl border-2 border-blue-800/40 bg-gray-900 px-4 py-2 text-base sm:text-lg text-white focus:border-cyan-400 focus:outline-none shadow w-full sm:w-auto"
            >
              {services.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2">
            <button
              onClick={handleRedirect}
              disabled={loading}
              className="w-full sm:flex-grow rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg text-white shadow-lg hover:from-blue-700 hover:to-purple-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-600 transition-all duration-200"
            >
              {loading ? 'Trying best service...' : 'Unlock & Read'}
            </button>
            <button
              onClick={handleClear}
              className="w-full sm:w-auto rounded-xl bg-gray-700 px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg text-white hover:bg-gray-600 focus:outline-none shadow"
            >
              Clear
            </button>
          </div>
        </div>

        {error && <p className="mt-6 text-center text-base sm:text-lg text-red-400 font-semibold drop-shadow">{error}</p>}

        {finalUrl && !loading && !error && url && (
          <>
            {typeof window !== 'undefined' && window.open(finalUrl, '_blank')}
            <div className="mt-10 text-center animate-fade-in">
              <p className="text-gray-400 text-base sm:text-lg">Redirecting to:</p>
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 text-lg sm:text-xl font-bold hover:underline break-all"
              >
                {finalUrl}
              </a>
            </div>
          </>
        )}
      </div>
      <footer className="mt-10 text-gray-500 text-xs sm:text-sm opacity-80 text-center px-2">
        &copy; {new Date().getFullYear()} Medium Unlocker Pro. Crafted with ❤️ by Hemanth. Not affiliated with Medium.com.
      </footer>
    </main>
  )
}