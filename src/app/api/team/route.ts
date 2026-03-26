import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Create server-side Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get team members with user profile data
    const { data: members, error: membersError } = await (supabase
      .from('team_members') as any)
      .select('*')
      .order('joined_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching team members:', membersError)
      throw new Error('Failed to fetch team members')
    }

    console.log('Team members fetched:', members)

    // Get profile data separately
    const userIds = (members || []).map((m: any) => m.user_id)
    const { data: profiles, error: profilesError } = userIds.length > 0 
      ? await (supabase
          .from('profiles') as any)
          .select('id, name, company_name, created_at')
          .in('id', userIds)
      : { data: [], error: null }

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      // Continue with empty profiles
    }

    // Combine member and profile data
    const membersWithProfiles = (members || []).map((member: any) => {
      const profile = (profiles || []).find((p: any) => p.id === member.user_id)
      return {
        ...member,
        user: profile ? {
          id: profile.id,
          name: profile.name || `User ${member.user_id.slice(0, 8)}`,
          company_name: profile.company_name || 'No company set',
          created_at: profile.created_at
        } : {
          id: member.user_id,
          name: `User ${member.user_id.slice(0, 8)}`,
          company_name: 'No company set',
          created_at: member.joined_at
        }
      }
    })

    // Get pending invitations
    const { data: invitations, error: invitationsError } = await (supabase
      .from('team_invitations') as any)
      .select('*')
      .eq('inviter_id', user.id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError)
      throw new Error('Failed to fetch invitations')
    }

    return NextResponse.json({
      members: membersWithProfiles,
      invitations: invitations || []
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Create invitation
    const invitationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: invitation, error: inviteError } = await (supabase
      .from('team_invitations') as any)
      .insert({
        inviter_id: user.id,
        email,
        role,
        token: invitationToken,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      throw new Error('Failed to create invitation')
    }

    // TODO: Send invitation email with actual link
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitationToken}`
    console.log('Sending invitation email to:', email, 'with link:', invitationLink)
    
    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just log it - in production, implement actual email sending
    /*
    import { Resend } from 'resend'
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'noreply@paysimple.io',
      to: email,
      subject: `You're invited to join PaySimple`,
      html: `
        <h2>You're invited to join PaySimple!</h2>
        <p>You've been invited to join PaySimple as a ${role}.</p>
        <p>Click the link below to accept your invitation:</p>
        <a href="${invitationLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Accept Invitation
        </a>
        <p>This invitation expires on ${new Date(expiresAt).toLocaleDateString()}.</p>
        <p>If you don't have an account yet, you'll be able to create one when you click the link.</p>
      `
    })
    */

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
