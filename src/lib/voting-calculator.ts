import { db } from '@/lib/db'
import { VotingMethod, VotingType } from '@prisma/client'

export interface VoteResult {
  candidateId: string
  candidateName: string
  voteCount: number
  weightedVotes: number
  percentage: number
  weightedPercentage: number
}

export interface VotingSummary {
  totalVotes: number
  totalWeightedVotes: number
  totalEligibleVoters: number
  totalArea?: number
  votingMethod: VotingMethod
  votingType: VotingType
  results: VoteResult[]
  winner?: VoteResult
  metadata: {
    hasQuorum: boolean
    quorumRequired: number
    votingEndTime: Date
    isCompleted: boolean
  }
}

export class VotingCalculator {
  /**
   * Calculate voting results based on the specified method
   */
  static async calculateResults(projectId: string): Promise<VotingSummary> {
    const project = await db.votingProject.findUnique({
      where: { id: projectId },
      include: {
        candidates: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        votes: {
          include: {
            user: {
              select: { apartmentSize: true }
            }
          }
        }
      }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    const totalEligibleVoters = await this.getTotalEligibleVoters()
    const totalVotes = project.votes.length
    const hasQuorum = totalVotes >= Math.ceil(totalEligibleVoters * 0.5) // 50% quorum
    const isCompleted = new Date() > project.endDate

    let results: VoteResult[] = []
    let totalWeightedVotes = 0
    let totalArea: number | undefined

    // Calculate results based on voting method
    switch (project.votingMethod) {
      case 'ONE_PERSON_ONE_VOTE':
        results = this.calculateOnePersonOneVote(project.votes, project.candidates)
        totalWeightedVotes = totalVotes
        break

      case 'WEIGHTED_BY_SIZE_MANUAL':
        if (!project.totalArea) {
          throw new Error('Total area is required for weighted voting method 2')
        }
        totalArea = project.totalArea
        results = this.calculateWeightedBySizeManual(project.votes, project.candidates, totalArea)
        totalWeightedVotes = results.reduce((sum, r) => sum + r.weightedVotes, 0)
        break

      case 'WEIGHTED_BY_SIZE_VOTERS':
        results = this.calculateWeightedBySizeVoters(project.votes, project.candidates)
        totalWeightedVotes = results.reduce((sum, r) => sum + r.weightedVotes, 0)
        totalArea = project.votes.reduce((sum, vote) => sum + (vote.user.apartmentSize || 0), 0)
        break

      default:
        throw new Error(`Unknown voting method: ${project.votingMethod}`)
    }

    // Calculate percentages
    results = results.map(result => ({
      ...result,
      percentage: totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0,
      weightedPercentage: totalWeightedVotes > 0 ? (result.weightedVotes / totalWeightedVotes) * 100 : 0
    }))

    // Determine winner
    const winner = results.reduce((prev, current) => 
      (current.weightedVotes > prev.weightedVotes) ? current : prev
    , results[0])

    return {
      totalVotes,
      totalWeightedVotes,
      totalEligibleVoters,
      totalArea,
      votingMethod: project.votingMethod,
      votingType: project.votingType,
      results,
      winner,
      metadata: {
        hasQuorum,
        quorumRequired: Math.ceil(totalEligibleVoters * 0.5),
        votingEndTime: project.endDate,
        isCompleted
      }
    }
  }

  /**
   * Method 1: One person, one vote
   */
  private static calculateOnePersonOneVote(votes: any[], candidates: any[]): VoteResult[] {
    const voteCounts = new Map<string, number>()

    // Count votes per candidate
    votes.forEach(vote => {
      const count = voteCounts.get(vote.candidateId) || 0
      voteCounts.set(vote.candidateId, count + 1)
    })

    // Create results for all candidates
    return candidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name || candidate.user?.name || 'Unknown',
      voteCount: voteCounts.get(candidate.id) || 0,
      weightedVotes: voteCounts.get(candidate.id) || 0,
      percentage: 0, // Will be calculated later
      weightedPercentage: 0 // Will be calculated later
    }))
  }

  /**
   * Method 2: Weighted by apartment size (manual total area)
   */
  private static calculateWeightedBySizeManual(votes: any[], candidates: any[], totalArea: number): VoteResult[] {
    const voteWeights = new Map<string, number>()

    // Calculate weighted votes per candidate
    votes.forEach(vote => {
      const apartmentSize = vote.user.apartmentSize || 0
      const currentWeight = voteWeights.get(vote.candidateId) || 0
      voteWeights.set(vote.candidateId, currentWeight + apartmentSize)
    })

    // Create results for all candidates
    return candidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name || candidate.user?.name || 'Unknown',
      voteCount: votes.filter(v => v.candidateId === candidate.id).length,
      weightedVotes: voteWeights.get(candidate.id) || 0,
      percentage: 0, // Will be calculated later
      weightedPercentage: 0 // Will be calculated later
    }))
  }

  /**
   * Method 3: Weighted by apartment size (voters' total area)
   */
  private static calculateWeightedBySizeVoters(votes: any[], candidates: any[]): VoteResult[] {
    const voteWeights = new Map<string, number>()

    // Calculate weighted votes per candidate
    votes.forEach(vote => {
      const apartmentSize = vote.user.apartmentSize || 0
      const currentWeight = voteWeights.get(vote.candidateId) || 0
      voteWeights.set(vote.candidateId, currentWeight + apartmentSize)
    })

    // Create results for all candidates
    return candidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name || candidate.user?.name || 'Unknown',
      voteCount: votes.filter(v => v.candidateId === candidate.id).length,
      weightedVotes: voteWeights.get(candidate.id) || 0,
      percentage: 0, // Will be calculated later
      weightedPercentage: 0 // Will be calculated later
    }))
  }

  /**
   * Get total eligible voters
   */
  private static async getTotalEligibleVoters(): Promise<number> {
    return await db.user.count({
      where: {
        isActive: true,
        role: {
          in: ['VOTER', 'CANDIDATE', 'COMMITTEE']
        }
      }
    })
  }

  /**
   * Calculate vote weight for a user based on the voting method
   */
  static async calculateVoteWeight(userId: string, projectId: string): Promise<number> {
    const project = await db.votingProject.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    switch (project.votingMethod) {
      case 'ONE_PERSON_ONE_VOTE':
        return 1.0

      case 'WEIGHTED_BY_SIZE_MANUAL':
      case 'WEIGHTED_BY_SIZE_VOTERS':
        return user.apartmentSize || 0

      default:
        return 1.0
    }
  }

  /**
   * Validate if a user can vote in a project
   */
  static async canUserVote(userId: string, projectId: string): Promise<{
    canVote: boolean
    reason?: string
  }> {
    const project = await db.votingProject.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return { canVote: false, reason: 'Project not found' }
    }

    if (!project.isActive) {
      return { canVote: false, reason: 'Voting is not active' }
    }

    const now = new Date()
    if (now < project.startDate) {
      return { canVote: false, reason: 'Voting has not started yet' }
    }

    if (now > project.endDate) {
      return { canVote: false, reason: 'Voting has ended' }
    }

    const existingVote = await db.vote.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    })

    if (existingVote) {
      return { canVote: false, reason: 'You have already voted in this project' }
    }

    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.isActive) {
      return { canVote: false, reason: 'User account is not active' }
    }

    // For weighted voting, user must have apartment size
    if (project.votingMethod !== 'ONE_PERSON_ONE_VOTE' && !user.apartmentSize) {
      return { canVote: false, reason: 'Apartment size is required for weighted voting' }
    }

    return { canVote: true }
  }

  /**
   * Get voting method description
   */
  static getVotingMethodDescription(method: VotingMethod): string {
    switch (method) {
      case 'ONE_PERSON_ONE_VOTE':
        return 'One Person, One Vote - Each voter has equal voting power'
      case 'WEIGHTED_BY_SIZE_MANUAL':
        return 'Weighted by Apartment Size (Manual Total) - Vote weight based on apartment size, total area manually set'
      case 'WEIGHTED_BY_SIZE_VOTERS':
        return 'Weighted by Apartment Size (Voters Total) - Vote weight based on apartment size, total area from participating voters'
      default:
        return 'Unknown voting method'
    }
  }

  /**
   * Get voting type description
   */
  static getVotingTypeDescription(type: VotingType): string {
    switch (type) {
      case 'HEAD_OF_APARTMENT':
        return 'Head of Apartment Election'
      case 'POLICY':
        return 'Policy Voting'
      case 'ACTION_PLAN':
        return 'Action Plan Voting'
      case 'SURVEY':
        return 'Survey Voting'
      default:
        return 'Unknown voting type'
    }
  }
}

export default VotingCalculator