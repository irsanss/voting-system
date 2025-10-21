'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, Vote, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CountdownTimerProps {
  targetDate: string
  title: string
  onComplete?: () => void
}

function CountdownTimer({ targetDate, title, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (onComplete) onComplete()
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  return (
    <div className="flex gap-4 justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
        <div className="text-xs text-muted-foreground">Minutes</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
        <div className="text-xs text-muted-foreground">Seconds</div>
      </div>
    </div>
  )
}

interface VotingProject {
  id: string
  title: string
  description?: string
  votingType: string
  startDate: string
  endDate: string
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
  candidateCount: number
  voteCount?: number
  candidates?: Array<{
    id: string
    name: string
    photo?: string
  }>
}

interface VotingProjectCardProps {
  project: VotingProject
}

export function VotingProjectCard({ project }: VotingProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Voting Active'
      case 'UPCOMING':
        return 'Upcoming'
      case 'ENDED':
        return 'Ended'
      default:
        return status
    }
  }

  const getVotingTypeText = (type: string) => {
    switch (type) {
      case 'HEAD_OF_APARTMENT':
        return 'Apartment Leadership'
      case 'POLICY':
        return 'Policy Vote'
      case 'ACTION_PLAN':
        return 'Action Plan'
      case 'SURVEY':
        return 'Survey'
      default:
        return type
    }
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {getVotingTypeText(project.votingType)}
          </div>
        </div>
        <CardTitle className="text-xl">{project.title}</CardTitle>
        {project.description && (
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status-specific content */}
        {project.status === 'UPCOMING' && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Voting starts in:</span>
            </div>
            <CountdownTimer targetDate={project.startDate} />
          </div>
        )}

        {project.status === 'ACTIVE' && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <Vote className="w-4 h-4" />
              <span>Voting is now open!</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Ends in: <CountdownTimer targetDate={project.endDate} />
            </div>
          </div>
        )}

        {project.status === 'ENDED' && (
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Voting has ended
            </div>
            {project.voteCount !== undefined && (
              <div className="text-sm">
                Total votes: <span className="font-semibold">{project.voteCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Project stats */}
        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{project.candidateCount} Candidates</span>
          </div>
          {project.voteCount !== undefined && project.voteCount > 0 && (
            <div className="flex items-center gap-1">
              <Vote className="w-4 h-4" />
              <span>{project.voteCount} Votes</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="pt-2">
          {project.status === 'UPCOMING' && (
            <Link href={`/candidates?project=${project.id}`}>
              <Button variant="outline" className="w-full">
                View Candidates
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
          
          {project.status === 'ACTIVE' && (
            <Link href={`/vote?project=${project.id}`}>
              <Button className="w-full">
                Cast Your Vote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
          
          {project.status === 'ENDED' && (
            <Link href={`/results/${project.id}`}>
              <Button variant="outline" className="w-full">
                View Results
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}