import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the requesting user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if requesting user is admin
    const { data: adminCheck } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminCheck) {
      throw new Error('Only admins can grant admin access');
    }

    // Get email from request body
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    console.log(`Admin ${user.email} attempting to grant access to ${email}`);

    // Find user by email using service role
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    const targetUser = users?.find(u => u.email === email);

    if (!targetUser) {
      return new Response(
        JSON.stringify({ 
          error: 'User not found. The user must sign up first.' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found user ${targetUser.id} for email ${email}`);

    // Grant admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: targetUser.id, 
        role: 'admin' 
      });

    if (insertError) {
      // Check if it's a duplicate (user already has admin role)
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'User already has admin access' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      console.error('Error inserting role:', insertError);
      throw insertError;
    }

    console.log(`Successfully granted admin access to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Admin access granted to ${email}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in grant-admin-access:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
