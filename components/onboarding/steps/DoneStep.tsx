'use client'

import React from 'react'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/lib/useWindowSize'

export function DoneStep() {
  const router = useRouter()
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900">You're All Set!</h2>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome to BidPerfect. Your account is ready to go.
          </p>
        </div>

        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Explore your dashboard</p>
                <p className="text-sm text-gray-600">View your company profile and settings</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Upload your first RFP</p>
                <p className="text-sm text-gray-600">Start working on proposals immediately</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Invite your team</p>
                <p className="text-sm text-gray-600">Collaborate on bids together</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button size="lg" onClick={() => router.push('/dashboard')}>
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/ingest')}>
            Upload First RFP
          </Button>
        </div>
      </div>
    </>
  )
}

