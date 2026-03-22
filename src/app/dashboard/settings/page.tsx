'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { User, Bell, CreditCard, Brain, Trash2, AlertTriangle, Check, RefreshCw } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'

export default function SettingsPage() {
  const { settings, loading, error, updateProfile, updatePreferences } = useSettings()
  const [profileData, setProfileData] = useState({
    name: '',
    company_name: ''
  })

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    try {
      await updatePreferences({
        notification_preferences: {
          [key]: value
        }
      })
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
    }
  }

  const handleAIUpdate = async (key: string, value: any) => {
    try {
      await updatePreferences({
        ai_preferences: {
          [key]: value
        }
      })
    } catch (error) {
      console.error('Failed to update AI preferences:', error)
    }
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <p className="text-sm text-slate/70">Your personal information</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-navy text-white text-2xl font-bold flex items-center justify-center">
                AF
              </div>
              <div>
                <div className="font-semibold text-slate">Angus Fisher</div>
                <div className="text-sm text-slate/70">Educational Demo • Member since Jan 2026</div>
                <Button variant="outline" size="sm" className="mt-2">Change Photo</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate/70">First Name</label>
                <Input value="Angus" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate/70">Last Name</label>
                <Input value="Fisher" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate/70">Email Address</label>
              <Input value="angus@paysimple.io" type="email" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate/70">Company</label>
              <Input value="PaySimple" />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-navy hover:bg-navy/90">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <p className="text-sm text-slate/70">Choose what alerts you receive</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate/10">
              <div>
                <div className="font-medium text-slate">Compliance Risk Alerts</div>
                <div className="text-sm text-slate/70">Get notified when new risk flags are detected</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate/10">
              <div>
                <div className="font-medium text-slate">Payment Schedule Reminders</div>
                <div className="text-sm text-slate/70">Upcoming payment due dates</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate/10">
              <div>
                <div className="font-medium text-slate">Lien Waiver Deadlines</div>
                <div className="text-sm text-slate/70">7 days before deadline</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate/10">
              <div>
                <div className="font-medium text-slate">Team Activity</div>
                <div className="text-sm text-slate/70">When teammates upload or update projects</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate/30 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-slate">Weekly Summary</div>
                <div className="text-sm text-slate/70">Email digest every Monday</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Plan & Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Plan & Billing</CardTitle>
            <p className="text-sm text-slate/70">Your current subscription</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-900">Educational Demo</div>
                <div className="text-sm text-blue-700 mt-1">Portfolio Project • Free</div>
              </div>
              <Button variant="outline" size="sm">Manage Plan</Button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate/70">Projects used</span>
                <span className="font-semibold">1 / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate/70">Team members</span>
                <span className="font-semibold">5 / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate/70">Exports this month</span>
                <span className="font-semibold">3 / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate/70">AI analyses</span>
                <span className="font-semibold">7 / unlimited</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate/10">
              <div className="text-sm text-slate/70 mb-3">Payment Method</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <span className="text-sm font-medium">•••• •••• •••• 4242</span>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Extraction Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>AI Extraction Preferences</CardTitle>
            <p className="text-sm text-slate/70">Customize how PaySimple analyzes contracts</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate/10">
              <div>
                <div className="font-medium text-slate">Default Contract Type</div>
              </div>
              <Select value="a101">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a101">AIA A101</SelectItem>
                  <SelectItem value="a102">AIA A102</SelectItem>
                  <SelectItem value="a103">AIA A103</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate/10">
              <div>
                <div className="font-medium text-slate">Flag Pay-When-Paid Clauses</div>
                <div className="text-sm text-slate/70">Always highlight conditional payment language</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate/10">
              <div>
                <div className="font-medium text-slate">Auto-generate Payment Schedule</div>
                <div className="text-sm text-slate/70">Create schedule immediately after extraction</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-navy transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-slate">Default Retainage Alert Threshold</div>
              </div>
              <Select value="10">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-danger/20">
          <CardHeader>
            <CardTitle className="text-danger">Danger Zone</CardTitle>
            <p className="text-sm text-slate/70">Irreversible actions — proceed with caution</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-slate">Delete Account</div>
                <div className="text-sm text-slate/70">Permanently delete your account and all data</div>
              </div>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
