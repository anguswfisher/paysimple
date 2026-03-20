// Placeholder for compliance rules
export const complianceRules = [
  {
    id: '1',
    name: 'Lien Waiver Required',
    description: 'Contract should specify lien waiver requirements',
    category: 'legal',
    severity: 'high' as const,
    check: () => ({ passed: false })
  }
]
