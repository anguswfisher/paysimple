'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, X, Building, Calendar, DollarSign, Users, FileText, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/database/projects'

export default function CreateProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    contractValue: '',
    startDate: '',
    estimatedCompletion: '',
    owner: '',
    contractor: '',
    architect: '',
    description: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const projectTypes = [
    { value: 'commercial', label: 'Commercial Construction' },
    { value: 'residential', label: 'Residential Construction' },
    { value: 'industrial', label: 'Industrial Construction' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'other', label: 'Other' }
  ]

  const suggestedTags = [
    'Construction Contract', 'Monthly Payments', '5% Retainage', 'Public Project', 
    'Fast Track', 'Design-Build', 'LEED', 'Union Labor'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create project in database
      const project = await createProject({
        name: formData.projectName,
        project_type: formData.projectType,
        contract_value: formData.contractValue,
        start_date: formData.startDate,
        estimated_completion: formData.estimatedCompletion,
        owner: formData.owner,
        contractor: formData.contractor,
        architect: formData.architect,
        description: formData.description,
        tags: formData.tags
      })

      // Redirect to the new project's upload page
      router.push(`/dashboard/projects/${project.id}/upload`)
    } catch (error) {
      console.error('Error creating project:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.projectName && formData.projectType && formData.contractValue

  return (
    <div className="min-h-screen bg-concrete">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-navy border-b-2 border-steel/30">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/75 border-white/20 hover:bg-white/10"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Dashboard
          </Button>
          <div className="font-semibold text-base text-white tracking-tight">
            Pay<span className="text-steel">Simple</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-white/75 border-white/20 hover:bg-white/10">
            Save Draft
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate mb-2">Create New Project</h1>
          <p className="text-slate/70">
            Set up your construction payment schedule project by providing basic project information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Information */}
          <Card className="bg-white border border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-steel" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., Office Building Construction"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    className="bg-concrete border-neutral-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                    <SelectTrigger className="bg-concrete border-neutral-300">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project scope and objectives"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-concrete border-neutral-300 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Project Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-danger" 
                        onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        handleRemoveTag(tag)
                      }}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag or select from suggestions"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newTag))}
                    className="bg-concrete border-neutral-300"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleAddTag(newTag)}
                    className="border-neutral-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-neutral-500">Suggested:</span>
                  {suggestedTags.slice(0, 4).map((tag: string, index: number) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-concrete"
                      onClick={() => handleAddTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card className="bg-white border border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-steel" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractValue">Contract Value *</Label>
                  <Input
                    id="contractValue"
                    placeholder="$450,000"
                    value={formData.contractValue}
                    onChange={(e) => handleInputChange('contractValue', e.target.value)}
                    className="bg-concrete border-neutral-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="bg-concrete border-neutral-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                  <Input
                    id="estimatedCompletion"
                    type="date"
                    value={formData.estimatedCompletion}
                    onChange={(e) => handleInputChange('estimatedCompletion', e.target.value)}
                    className="bg-concrete border-neutral-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Parties */}
          <Card className="bg-white border border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-steel" />
                Project Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input
                    id="owner"
                    placeholder="Company name"
                    value={formData.owner}
                    onChange={(e) => handleInputChange('owner', e.target.value)}
                    className="bg-concrete border-neutral-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contractor">Contractor</Label>
                  <Input
                    id="contractor"
                    placeholder="Company name"
                    value={formData.contractor}
                    onChange={(e) => handleInputChange('contractor', e.target.value)}
                    className="bg-concrete border-neutral-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="architect">Architect</Label>
                  <Input
                    id="architect"
                    placeholder="Company name (optional)"
                    value={formData.architect}
                    onChange={(e) => handleInputChange('architect', e.target.value)}
                    className="bg-concrete border-neutral-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Setup Options */}
          <Card className="bg-white border border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-steel" />
                Quick Setup Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-neutral-200 cursor-pointer hover:border-steel hover:-translate-y-0.5 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-navy" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate">Start from Contract</h4>
                        <p className="text-xs text-neutral-500">Upload contract document for AI extraction</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-neutral-200 cursor-pointer hover:border-steel hover:-translate-y-0.5 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-steel/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-steel" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate">Use Template</h4>
                        <p className="text-xs text-neutral-500">Start with a payment schedule template</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => router.push('/dashboard')}
              className="border-neutral-300"
            >
              Cancel
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                type="button"
                className="border-neutral-300"
              >
                Save Draft
              </Button>
              
              <Button 
                type="submit" 
                className="bg-steel hover:bg-steel/90"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    Create Project
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <Card className="mt-6 bg-navy/5 border-navy/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-navy mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate mb-1">Need Help?</h4>
                <p className="text-sm text-neutral-600">
                  You can always update project details later. The most important fields are project name, type, and contract value to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
