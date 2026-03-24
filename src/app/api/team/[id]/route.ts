import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Create server-side Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  return user
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    
    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
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

    // Check if current user is admin
    const { data: currentUser, error: currentUserError } = await (supabase
      .from('team_members') as any)
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentUserError || currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to update roles' },
        { status: 403 }
      )
    }

    const { data: member, error: updateError } = await (supabase
      .from('team_members') as any)
      .update({ 
        role, 
        permissions: getDefaultPermissions(role) 
      })
      .eq('user_id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member role:', updateError)
      throw new Error('Failed to update member role')
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating member role:', error)
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update member role' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)

    // Cannot remove yourself
    if (params.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the team' },
        { status: 400 }
      )
    }

    // Check if current user is admin
    const { data: currentUser, error: currentUserError } = await (supabase
      .from('team_members') as any)
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentUserError || currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to remove team members' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await (supabase
      .from('team_members') as any)
      .delete()
      .eq('user_id', params.id)

    if (deleteError) {
      console.error('Error removing team member:', deleteError)
      throw new Error('Failed to remove team member')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing team member:', error)
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove team member' },
      { status: 500 }
    )
  }
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case 'admin':
      return {
        can_manage_team: true,
        can_manage_settings: true,
        can_manage_billing: true,
        can_view_all_projects: true,
        can_create_projects: true,
        can_export_data: true
      }
    case 'member':
      return {
        can_manage_team: false,
        can_manage_settings: false,
        can_manage_billing: false,
        can_view_all_projects: true,
        can_create_projects: true,
        can_export_data: true
      }
    case 'viewer':
      return {
        can_manage_team: false,
        can_manage_settings: false,
        can_manage_billing: false,
        can_view_all_projects: true,
        can_create_projects: false,
        can_export_data: false
      }
    default:
      return {}
  }
}
