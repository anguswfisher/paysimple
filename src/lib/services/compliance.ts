import { supabase } from '@/lib/supabase/client'
import { ComplianceScore, ComplianceMetrics, ComplianceRule, Resolution } from '@/types/compliance'
import { ComplianceFlag } from '@/types/project'

export class ComplianceService {
  async calculateProjectScore(projectId: string): Promise<ComplianceScore> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Verify user has access to this project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      throw new Error('Project not found or access denied')
    }

    // Get all compliance flags for the project
    const { data: flags, error: flagsError } = await (supabase
      .from('compliance_flags') as any)
      .select('*')
      .eq('project_id', projectId)

    if (flagsError) {
      console.error('Error fetching compliance flags:', flagsError)
      throw new Error('Failed to fetch compliance flags')
    }

    // Calculate scores
    const categoryScores = this.calculateCategoryScores(flags || [])
    const overallScore = this.calculateOverallScore(categoryScores)

    // Update or insert compliance score
    const { data: score, error: scoreError } = await (supabase
      .from('compliance_scores') as any)
      .upsert({
        project_id: projectId,
        overall_score: overallScore,
        category_scores: categoryScores,
        last_calculated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (scoreError) {
      console.error('Error saving compliance score:', scoreError)
      throw new Error('Failed to save compliance score')
    }

    return score as ComplianceScore
  }

  async analyzeContract(projectId: string): Promise<ComplianceFlag[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get project and extracted terms
    const { data: project } = await (supabase
      .from('projects') as any)
      .select('id, contract_text')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project || !project.contract_text) {
      throw new Error('Project or contract text not found')
    }

    // Get active compliance rules
    const { data: rules, error: rulesError } = await (supabase
      .from('compliance_rules') as any)
      .select('*')
      .eq('is_active', true)

    if (rulesError) {
      console.error('Error fetching compliance rules:', rulesError)
      throw new Error('Failed to fetch compliance rules')
    }

    const newFlags: ComplianceFlag[] = []

    // Evaluate each rule against the contract
    for (const rule of rules || []) {
      const result = this.evaluateRule(rule, project.contract_text)
      
      if (!result.passed && result.flag) {
        const { data: flag } = await (supabase
          .from('compliance_flags') as any)
          .insert({
            project_id: projectId,
            severity: rule.severity,
            category: rule.category,
            title: result.flag.title || rule.name,
            description: result.flag.description,
            recommendation: result.flag.recommendation,
            source_clause: result.flag.source_clause,
            is_resolved: false
          })
          .select()
          .single()

        if (flag) {
          newFlags.push(flag as ComplianceFlag)
        }
      }
    }

    // Recalculate score after adding new flags
    await this.calculateProjectScore(projectId)

    return newFlags
  }

  async resolveFlag(flagId: string, resolution: Resolution): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get the flag to verify access
    const { data: flag } = await (supabase
      .from('compliance_flags') as any)
      .select('project_id')
      .eq('id', flagId)
      .single()

    if (!flag) {
      throw new Error('Compliance flag not found')
    }

    // Verify user has access to the project
    const { data: project } = await (supabase
      .from('projects') as any)
      .select('id')
      .eq('id', flag.project_id)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      throw new Error('Access denied')
    }

    // Update the flag
    const updateData: any = {
      is_resolved: resolution.resolved,
      resolved_by: user.id
    }

    if (resolution.resolved && resolution.resolved_at) {
      updateData.resolved_at = resolution.resolved_at
    }

    if (resolution.resolution_note) {
      updateData.resolution_note = resolution.resolution_note
    }

    const { error } = await (supabase
      .from('compliance_flags') as any)
      .update(updateData)
      .eq('id', flagId)

    if (error) {
      console.error('Error resolving compliance flag:', error)
      throw new Error('Failed to resolve compliance flag')
    }

    // Recalculate project score
    await this.calculateProjectScore(flag.project_id)
  }

  async getComplianceMetrics(userId: string): Promise<ComplianceMetrics> {
    // Get user's projects
    const { data: projects, error: projectsError } = await (supabase
      .from('projects') as any)
      .select('id, name, contract_text')
      .eq('user_id', userId)

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      throw new Error('Failed to fetch projects')
    }

    if (!projects || projects.length === 0) {
      return {
        total_projects: 0,
        overall_score: 0,
        open_flags: 0,
        resolved_flags: 0,
        contracts_reviewed: 0,
        scores_by_project: []
      }
    }

    const projectIds = projects.map((p: any) => p.id)

    // Get compliance scores for all projects
    const { data: scores } = await (supabase
      .from('compliance_scores_details') as any)
      .select('*')
      .in('project_id', projectIds)

    // Get compliance flags counts
    const { data: flags } = await (supabase
      .from('compliance_flags') as any)
      .select('project_id, is_resolved, severity')
      .in('project_id', projectIds)

    // Calculate metrics
    const totalProjects = projects.length
    const contractsReviewed = projects.filter((p: any) => p.contract_text).length
    const openFlags = flags?.filter((f: any) => !f.is_resolved).length || 0
    const resolvedFlags = flags?.filter((f: any) => f.is_resolved).length || 0

    // Calculate overall score
    const overallScore = scores && scores.length > 0
      ? Math.round(scores.reduce((sum: number, score: any) => sum + score.overall_score, 0) / scores.length)
      : 0

    // Prepare scores by project
    const scoresByProject = projects.map((project: any) => {
      const score = scores?.find((s: any) => s.project_id === project.id)
      return {
        project_id: project.id,
        project_name: project.name,
        score: score?.overall_score || 0
      }
    })

    return {
      total_projects: totalProjects,
      overall_score: overallScore,
      open_flags: openFlags,
      resolved_flags: resolvedFlags,
      contracts_reviewed: contractsReviewed,
      scores_by_project: scoresByProject
    }
  }

  async getComplianceFlags(projectId?: string, severity?: string): Promise<ComplianceFlag[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    let query = (supabase
      .from('compliance_flags') as any)
      .select('*')

    if (projectId) {
      // If specific project, verify access
      const { data: project } = await (supabase
        .from('projects') as any)
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (!project) {
        throw new Error('Project not found or access denied')
      }

      query = query.eq('project_id', projectId)
    } else {
      // Get flags for all user's projects
      const { data: userProjects } = await (supabase
        .from('projects') as any)
        .select('id')
        .eq('user_id', user.id)

      if (userProjects && userProjects.length > 0) {
        const projectIds = userProjects.map((p: any) => p.id)
        query = query.in('project_id', projectIds)
      } else {
        return []
      }
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching compliance flags:', error)
      throw new Error('Failed to fetch compliance flags')
    }

    return data || []
  }

  private evaluateRule(rule: ComplianceRule, contractText: string): { passed: boolean; flag?: Partial<ComplianceFlag> } {
    const logic = rule.rule_logic

    // Pattern matching rules
    if (logic.pattern) {
      const pattern = new RegExp(logic.pattern, 'i')
      if (pattern.test(contractText)) {
        return {
          passed: false,
          flag: {
            title: rule.name,
            description: logic.description || `Pattern detected: ${logic.pattern}`,
            recommendation: logic.recommendation,
            source_clause: this.extractMatchingClause(contractText, pattern)
          }
        }
      }
    }

    // Condition-based rules
    if (logic.condition) {
      // This would be more sophisticated in a real implementation
      // For now, just check if condition string exists in contract
      if (contractText.toLowerCase().includes(logic.condition.toLowerCase())) {
        return {
          passed: false,
          flag: {
            title: rule.name,
            description: logic.description || `Condition detected: ${logic.condition}`,
            recommendation: logic.recommendation
          }
        }
      }
    }

    return { passed: true }
  }

  private calculateCategoryScores(flags: any[]): Record<string, number> {
    const categories = ['retainage_terms', 'prompt_payment', 'lien_waivers', 'stored_materials', 'contract_basics']
    const scores: Record<string, number> = {}

    for (const category of categories) {
      const categoryFlags = flags.filter(f => f.category === category)
      const totalFlags = categoryFlags.length
      const resolvedFlags = categoryFlags.filter(f => f.is_resolved).length

      if (totalFlags === 0) {
        scores[category] = 100 // No issues = perfect score
      } else {
        // Score based on resolution rate, weighted by severity
        const highSeverityWeight = 3
        const mediumSeverityWeight = 2
        const lowSeverityWeight = 1

        let weightedTotal = 0
        let weightedResolved = 0

        for (const flag of categoryFlags) {
          const weight = flag.severity === 'high' ? highSeverityWeight :
                        flag.severity === 'medium' ? mediumSeverityWeight : lowSeverityWeight
          
          weightedTotal += weight
          if (flag.is_resolved) {
            weightedResolved += weight
          }
        }

        scores[category] = weightedTotal === 0 ? 100 : Math.round((weightedResolved / weightedTotal) * 100)
      }
    }

    return scores
  }

  private calculateOverallScore(categoryScores: Record<string, number>): number {
    const categories = Object.keys(categoryScores)
    if (categories.length === 0) return 100

    const totalScore = categories.reduce((sum, category) => sum + categoryScores[category], 0)
    return Math.round(totalScore / categories.length)
  }

  private extractMatchingClause(text: string, pattern: RegExp): string {
    const match = text.match(pattern)
    if (match && match.index !== undefined) {
      const start = Math.max(0, match.index - 50)
      const end = Math.min(text.length, match.index + match[0].length + 50)
      return text.substring(start, end).trim()
    }
    return ''
  }

  private generateRecommendations(flag: ComplianceFlag): string[] {
    const recommendations: string[] = []

    if (flag.recommendation) {
      recommendations.push(flag.recommendation)
    }

    // Add default recommendations based on category and severity
    switch (flag.category) {
      case 'payment_terms':
        if (flag.severity === 'high') {
          recommendations.push('Consult with legal counsel to review payment terms')
          recommendations.push('Consider state-specific prompt payment act requirements')
        }
        break
      case 'retainage':
        recommendations.push('Verify retainage terms align with project requirements')
        recommendations.push('Document retainage release conditions clearly')
        break
      case 'lien_waivers':
        recommendations.push('Ensure lien waiver requirements meet state laws')
        recommendations.push('Track lien waiver deadlines carefully')
        break
    }

    return recommendations
  }
}
