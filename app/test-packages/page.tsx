'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Package {
  id: string
  name: string
  credits: number
  price: number
  currency: string
  planType?: string | null
}

export default function TestPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error' | '404'>>({})

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/credits/packages')
      if (!response.ok) throw new Error('Failed to fetch packages')
      const data = await response.json()
      setPackages(data.packages || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testPackageLink = async (packageId: string) => {
    setTestResults(prev => ({ ...prev, [packageId]: 'testing' }))
    
    try {
      const response = await fetch(`/dashboard/credits/purchase/${packageId}`, {
        method: 'GET',
        credentials: 'same-origin',
        redirect: 'manual'
      })
      
      if (response.ok || response.type === 'opaqueredirect') {
        setTestResults(prev => ({ ...prev, [packageId]: 'success' }))
      } else if (response.status === 404) {
        setTestResults(prev => ({ ...prev, [packageId]: '404' }))
      } else {
        setTestResults(prev => ({ ...prev, [packageId]: 'error' }))
      }
    } catch (err) {
      setTestResults(prev => ({ ...prev, [packageId]: 'error' }))
    }
  }

  const testAllPackages = async () => {
    for (const pkg of packages) {
      await testPackageLink(pkg.id)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Card className="bg-red-900/20 border-red-600">
          <CardContent className="p-6">
            <p className="text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-amber-500">🧪 Test Credit Package Links</h1>
        
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">Found {packages.length} packages in database</p>
            <Button 
              onClick={testAllPackages}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Test All Packages
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {packages.map(pkg => {
            const testResult = testResults[pkg.id]
            const isWorking = pkg.id === 'cme8uw6fu000297u7hux29212'
            
            return (
              <Card 
                key={pkg.id} 
                className={`bg-gray-900 border-gray-700 ${isWorking ? 'border-green-500 border-2' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {pkg.name}
                    {isWorking && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {testResult === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
                    {testResult === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {testResult === '404' && <XCircle className="h-5 w-5 text-red-500" />}
                    {testResult === 'error' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-800 p-3 rounded font-mono text-sm">
                    <div className="text-green-400">ID: {pkg.id}</div>
                    <div className="text-gray-300">Credits: {pkg.credits.toLocaleString('pt-BR')}</div>
                    <div className="text-gray-300">Price: {pkg.currency} {pkg.price.toFixed(2)}</div>
                    <div className="text-gray-300">Plan Type: {pkg.planType || 'N/A'}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(`/dashboard/credits/purchase/${pkg.id}`, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      📂 Open in New Tab
                    </Button>
                    <Button
                      onClick={() => window.location.href = `/dashboard/credits/purchase/${pkg.id}`}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      🔄 Navigate
                    </Button>
                    <Button
                      onClick={() => testPackageLink(pkg.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      🔍 Test Link
                    </Button>
                  </div>
                  
                  {testResult && (
                    <div className={`p-3 rounded text-sm ${
                      testResult === 'success' ? 'bg-green-900/50 text-green-300' :
                      testResult === '404' ? 'bg-red-900/50 text-red-300' :
                      testResult === 'error' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {testResult === 'testing' && 'Testing...'}
                      {testResult === 'success' && '✅ Link is working (200 OK)'}
                      {testResult === '404' && '❌ Page not found (404)'}
                      {testResult === 'error' && '⚠️ Error accessing page'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}