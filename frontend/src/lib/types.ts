export interface Top8User {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
  mutual_affinity_score: number
  rank: number
  verified: boolean
  follower_count: number
  following_count: number
  
  // Enhanced interaction data
  interaction_stats?: {
    total_interactions: number
    recent_interactions: number // last 30 days
    interaction_types: {
      likes: number
      recasts: number
      replies: number
    }
    last_interaction_date?: string
    engagement_score: number // calculated based on interaction frequency and recency
  }
  
  // Their top 3 friends
  top_friends?: Array<{
    fid: number
    username: string
    display_name: string
    pfp_url: string
    bio: string
    ens_name?: string
    mutual_affinity_score: number
    neynar_user_score?: number
  }>
  
  // Social scope - who they're connected to in your network
  social_scope?: {
    mutual_friends: Array<{
      fid: number
      username: string
      display_name: string
      pfp_url: string
      mutual_affinity_score: number
    }>
    friends_of_friends: Array<{
      fid: number
      username: string
      display_name: string
      pfp_url: string
      mutual_affinity_score: number
      connected_via: string // who connects them
    }>
    network_stats: {
      total_mutual_friends: number
      total_friends_of_friends: number
      network_density: number // percentage of your network they're connected to
    }
  }
}

export interface Top8Stats {
  total_users: number
  average_affinity_score: number
  top_affinity_score: number
  total_followers: number
  total_following: number
  verified_users: number
}

export interface AffinityTitle {
  title: string
  icon: string
  color: string
} 