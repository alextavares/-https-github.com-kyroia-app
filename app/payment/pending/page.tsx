"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { notFound } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, AlertCircle, RefreshCw, Copy } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'

function PaymentPendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [polling, setPolling] = useState<boolean>(true)
  
  useEffect(() => {
    // Extract payment information from URL params
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const externalRef = searchParams.get('external_reference')
    const externalId = searchParams.get('externalId')
    
    console.log('Payment pending page - URL params:', { paymentId, status, externalRef })
    
    if (paymentId && externalRef) {
      try {
        const parsedRef = JSON.parse(externalRef)
        console.log('Parsed external_reference:', parsedRef)
        setPaymentInfo({
          paymentId,
          status,
          userId: parsedRef.userId,
          planId: parsedRef.planId,
          billingCycle: parsedRef.billingCycle
        })
      } catch (e) {
        console.error('Error parsing external_reference:', e)
        console.error('Raw external_reference:', externalRef)
        // Fallback: set minimal info
        if (paymentId) setPaymentInfo({ paymentId, status, externalId: externalId ?? null })
      }
    } else if (paymentId || externalId) {
      setPaymentInfo({ paymentId, status, externalId: externalId ?? null })
    }
  }, [searchParams])

  // Polling automático quando pendente
  useEffect(() => {
    if (!paymentInfo?.paymentId) return
    const currentStatus = paymentInfo?.status || searchParams.get('status')
    if (currentStatus !== 'pending' || !polling) return
    const id = setInterval(() => {
      checkPaymentStatus()
    }, 15000)
    return () => clearInterval(id)
  }, [paymentInfo, polling, searchParams])

  // Redireciona automaticamente quando aprovado
  useEffect(() => {
    if (paymentInfo?.status === 'approved') {
      const t = setTimeout(() => router.push('/dashboard'), 1500)
      return () => clearTimeout(t)
    }
  }, [paymentInfo?.status, router])

  const checkPaymentStatus = async () => {
    if (!paymentInfo?.paymentId && !paymentInfo?.externalId) {
      console.warn('Missing payment id for status check')
      return
    }

    setIsChecking(true)
    try {
      const qs = new URLSearchParams()
      if (paymentInfo.paymentId) qs.set('paymentId', String(paymentInfo.paymentId))
      if (paymentInfo.userId) qs.set('userId', String(paymentInfo.userId))
      if (paymentInfo.externalId) qs.set('externalId', String(paymentInfo.externalId))
      const response = await fetch(`/api/payments/status?${qs.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Payment status check result:', data)
        
        // Update payment info if we have updated data
        if (data.payment) {
          setPaymentInfo((prev: any) => ({
            ...prev,
            status: data.payment.status === 'completed' ? 'approved' : 
                   data.payment.status === 'pending' ? 'pending' : 
                   data.payment.status === 'failed' ? 'rejected' : prev.status,
            paymentMethod: data.payment.paymentMethod,
            amount: typeof data.payment.amount === 'number' ? data.payment.amount : prev?.amount,
            currency: data.payment.currency || prev?.currency,
          }))
          if (data.payment.status === 'completed') setPolling(false)
        }
        
        // Check if user plan was upgraded
        if (data.user?.planType && data.user.planType !== 'FREE') {
          setPaymentInfo((prev: any) => ({
            ...prev,
            status: 'approved',
            userPlan: data.user.planType
          }))
          setPolling(false)
        }
        
        setLastCheck(new Date())
      } else {
        console.error('Failed to check payment status:', response.status)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleDashboardClick = () => {
    // Always redirect to dashboard, NextAuth will handle authentication
    router.push('/dashboard')
  }

  const handleActivateSubscription = async () => {
    if (!paymentInfo?.paymentId) return
    
    setIsChecking(true)
    try {
      const response = await fetch('/api/mercadopago/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentInfo.paymentId,
          externalReference: {
            userId: paymentInfo.userId,
            planId: paymentInfo.planId,
            billingCycle: paymentInfo.billingCycle
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Subscription activated:', data)
          setPaymentInfo((prev: any) => ({ ...prev, status: 'approved' }))
        
        // Show success and redirect after a moment
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        console.error('Failed to activate subscription:', response.status)
        const errorData = await response.json()
        
        // If payment not approved yet, just update status
          if (errorData.status) {
            setPaymentInfo((prev: any) => ({ ...prev, status: errorData.status }))
          }
      }
    } catch (error) {
      console.error('Error activating subscription:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = () => {
    const status = paymentInfo?.status || searchParams.get('status')
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
      case 'rejected':
        return <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      default:
        return <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
    }
  }

  const getStatusTitle = () => {
    const status = paymentInfo?.status || searchParams.get('status')
    switch (status) {
      case 'approved':
        return 'Pagamento Aprovado!'
      case 'pending':
        return 'Pagamento Pendente'
      case 'rejected':
        return 'Pagamento Rejeitado'
      default:
        return 'Processando Pagamento'
    }
  }

  const getStatusDescription = () => {
    const status = paymentInfo?.status || searchParams.get('status')
    switch (status) {
      case 'approved':
        return 'Seu pagamento foi aprovado e seu plano será ativado em instantes.'
      case 'pending':
        return 'Estamos aguardando a confirmação do pagamento'
      case 'rejected':
        return 'Houve um problema com seu pagamento. Tente novamente.'
      default:
        return 'Processando seu pagamento...'
    }
  }

  const getMethodLabel = () => {
    const method = paymentInfo?.paymentMethod || searchParams.get('method') || ''
    if (!method) return null
    switch (method) {
      case 'pix': return 'PIX'
      case 'boleto': return 'Boleto'
      case 'card': return 'Cartão de Crédito'
      default: return method
    }
  }

  const renderActionButtons = () => {
    const status = paymentInfo?.status || searchParams.get('status')
    
    switch (status) {
      case 'approved':
        return (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleDashboardClick} 
              className="w-full"
              disabled={isChecking}
            >
              Acessar Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/pricing')}
            >
              Ver Planos
            </Button>
          </div>
        )
      
      case 'pending':
        return (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={checkPaymentStatus} 
              className="w-full"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Status'
              )}
            </Button>
            {paymentInfo?.paymentMethod === 'pix' && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://www.bcb.gov.br/estabilidadefinanceira/pix', '_blank')}
              >
                Abrir app do banco (PIX)
              </Button>
            )}
            
            {paymentInfo?.paymentId && (
              <Button 
                onClick={handleActivateSubscription}
                variant="outline"
                className="w-full"
                disabled={isChecking}
              >
                {isChecking ? 'Ativando...' : 'Ativar Assinatura'}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              size="sm"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        )
      
      case 'rejected':
        return (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => router.push('/pricing')} 
              className="w-full"
            >
              Tentar Novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDashboardClick}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        )
      
      default:
        return (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={checkPaymentStatus} 
              className="w-full"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Status'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDashboardClick}
            >
              Ir para o Dashboard
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {getStatusIcon()}
          <CardTitle>{getStatusTitle()}</CardTitle>
          <CardDescription>
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentInfo && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p><strong>Plano:</strong> {paymentInfo.planId?.toUpperCase() || 'N/A'}</p>
              <p><strong>Ciclo:</strong> {paymentInfo.billingCycle === 'yearly' ? 'Anual' : 'Mensal'}</p>
              <div className="flex items-center gap-2">
                <p className="m-0"><strong>ID do Pagamento:</strong> {paymentInfo.paymentId || paymentInfo.externalId || '—'}</p>
                {(paymentInfo.paymentId || paymentInfo.externalId) && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(String(paymentInfo.paymentId || paymentInfo.externalId))
                      } catch {}
                    }}
                    aria-label="Copiar ID do pagamento"
                    title="Copiar ID do pagamento"
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </button>
                )}
              </div>
              {typeof paymentInfo.amount === 'number' && (
                <p><strong>Valor:</strong> R$ {Number(paymentInfo.amount).toFixed(2).replace('.', ',')} {paymentInfo.currency || ''}</p>
              )}
              {getMethodLabel() && (
                <p><strong>Método:</strong> {getMethodLabel()}</p>
              )}
              {paymentInfo.userPlan && (
                <p><strong>Plano Atual:</strong> {paymentInfo.userPlan}</p>
              )}
            </div>
          )}
          
          {lastCheck && (
            <p className="text-center text-xs text-muted-foreground">
              Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
            </p>
          )}
          {paymentInfo?.status === 'pending' && (
            <p className="text-center text-xs text-muted-foreground">Atualizamos automaticamente a cada 15 segundos.</p>
          )}
          
          <p className="text-center text-muted-foreground text-sm">
            {paymentInfo?.status === 'pending' ? 
              'Você receberá um email assim que o pagamento for confirmado. Isso pode levar alguns minutos ou até 3 dias úteis para boletos.' :
              paymentInfo?.status === 'approved' ?
              'Faça login para acessar seu novo plano.' :
              'Entre em contato conosco se precisar de ajuda.'
            }
          </p>
          
          {renderActionButtons()}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Clock className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  )
}