import { createClient } from 'npm:@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  userId: string;
  type: 'campaign' | 'performance' | 'billing' | 'system';
  title: string;
  message: string;
  data?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId, type, title, message, data }: NotificationRequest = await req.json();

    console.log(`Sending notification to user ${userId}: ${title}`);

    // Check user's notification preferences
    const { data: preferences, error: prefError } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      throw new Error('Failed to fetch notification preferences');
    }

    // Default preferences if none exist
    const userPrefs = preferences || {
      email_campaigns: true,
      email_performance: true,
      email_billing: true,
      email_system: true,
      push_campaigns: false,
      push_performance: true,
      push_billing: true,
      push_system: true
    };

    // Check if user wants this type of notification
    const emailKey = `email_${type}` as keyof typeof userPrefs;
    const pushKey = `push_${type}` as keyof typeof userPrefs;

    if (!userPrefs[emailKey] && !userPrefs[pushKey]) {
      console.log(`User ${userId} has disabled ${type} notifications`);
      return new Response(
        JSON.stringify({ success: true, message: 'Notification skipped due to user preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert notification into database
    const { data: notification, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        title: title,
        message: message,
        data: data || {}
      })
      .select()
      .single();

    if (notificationError) {
      throw notificationError;
    }

    // Here you could integrate with external services like:
    // - Email service (SendGrid, Mailgun, etc.)
    // - Push notification service (Firebase, OneSignal, etc.)
    // - SMS service (Twilio, etc.)

    console.log(`Notification sent successfully: ${notification.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationId: notification.id,
        message: 'Notification sent successfully' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});