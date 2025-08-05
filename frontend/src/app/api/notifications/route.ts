import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface NotificationData {
  title: string
  body: string
  icon?: string
  url?: string
  action?: string
}

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute
const RATE_WINDOW = 60000 // 1 minute

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now()
  const key = `${endpoint}:${Math.floor(now / RATE_WINDOW)}`
  const current = requestCounts.get(key) || { count: 0, resetTime: now + RATE_WINDOW }
  
  if (now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (current.count >= RATE_LIMIT) {
    return false
  }
  
  current.count++
  requestCounts.set(key, current)
  return true
}

// Send notification using Neynar's notification system
async function sendNotification(fid: number, notification: NotificationData): Promise<boolean> {
  if (!checkRateLimit('send-notification')) {
    console.warn('Rate limit exceeded for notifications')
    return false
  }

  try {
    const response = await fetch('https://api.neynar.com/v2/farcaster/notifications', {
      method: 'POST',
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        recipient_fid: fid,
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '🤠',
        url: notification.url || 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app',
        action: notification.action || 'Open QuickTop8'
      }),
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to send notification to FID ${fid}: ${response.status}`)
      return false
    }
    
    console.log(`Successfully sent notification to FID ${fid}`)
    return true
  } catch (error) {
    console.error(`Error sending notification to FID ${fid}:`, error)
    return false
  }
}

// Generate social FOMO notifications
function generateFOMONotification(type: string, data: any): NotificationData {
  switch (type) {
    case 'new_reply_guy':
      return {
        title: '🤠 New Reply Guy Alert!',
        body: `@${data.username} just became your #${data.rank} reply guy! Check out your updated leaderboard.`,
        icon: '🤠',
        url: 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app'
      }
    
    case 'leaderboard_rank_change':
      return {
        title: '📊 Leaderboard Update!',
        body: `You moved to #${data.newRank} on your friends' reply guy leaderboard! Keep engaging to climb higher.`,
        icon: '📊',
        url: 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app'
      }
    
    case 'friend_activity':
      return {
        title: '👥 Friend Activity!',
        body: `${data.friendCount} of your friends are also using QuickTop8! See how you stack up against them.`,
        icon: '👥',
        url: 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app'
      }
    
    case 'quality_score_increase':
      return {
        title: '⭐ Quality Score Boost!',
        body: `Your reply guy quality score increased to ${data.score}! You're attracting high-quality engagement.`,
        icon: '⭐',
        url: 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app'
      }
    
    case 'potential_connection':
      return {
        title: '🔗 New Connection Found!',
        body: `@${data.username} (${data.followerCount} followers) could be a great connection through your reply guy @${data.replyGuyUsername}!`,
        icon: '🔗',
        url: 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app'
      }
    
    case 'weekly_challenge':
      return {
        title: '🏆 Weekly Challenge!',
        body: 'This week\'s challenge: Get 5 new reply guys! Can you beat your friends\' scores?',
        icon: '🏆',
        url: 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app'
      }
    
    default:
      return {
        title: '🤠 QuickTop8 Update!',
        body: 'Your reply guys are waiting! Check out the latest insights and connections.',
        icon: '🤠',
        url: 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/app'
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fid, type, data } = await request.json()

    if (!fid || !type) {
      return NextResponse.json({ 
        error: "FID and notification type are required" 
      }, { status: 400 })
    }

    console.log(`Sending ${type} notification to FID: ${fid}`)

    // Generate notification based on type
    const notification = generateFOMONotification(type, data || {})
    
    // Send the notification
    const success = await sendNotification(parseInt(fid), notification)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Notification sent successfully to FID ${fid}`,
        notification
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to send notification"
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ 
      error: "Failed to send notification. Please try again." 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Notifications API ready",
    supported_types: [
      'new_reply_guy',
      'leaderboard_rank_change', 
      'friend_activity',
      'quality_score_increase',
      'potential_connection',
      'weekly_challenge'
    ],
    examples: {
      new_reply_guy: {
        fid: 123,
        type: 'new_reply_guy',
        data: {
          username: 'alice',
          rank: 3
        }
      },
      leaderboard_rank_change: {
        fid: 123,
        type: 'leaderboard_rank_change',
        data: {
          newRank: 2
        }
      }
    }
  })
} 