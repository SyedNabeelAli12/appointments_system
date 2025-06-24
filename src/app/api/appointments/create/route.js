import { convertBerlinTimeToUTC } from '@/app/common/commonFunctions';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const {
      start,
      end,
      title,
      notes,
      category,
      patient,
      location,
      attachment
    } = await req.json();

    const appointmentId = uuidv4();
    const activityId = uuidv4();
    const assigneeId = uuidv4();

    const start_conv = convertBerlinTimeToUTC(start);
    const end_conv = convertBerlinTimeToUTC(end);

    // Step 0: Check for any overlapping appointment
    const { data: overlappingAppointments, error: overlapError } = await supabase
      .from('appointments')
      .select('id')
      .or(`and(start.lt.${end_conv},end.gt.${start_conv})`);

    if (overlapError) {
      console.error('Overlap check error:', overlapError);
      return new Response(JSON.stringify({ error: 'Overlap check failed' }), { status: 500 });
    }

    if (overlappingAppointments && overlappingAppointments.length > 0) {
      return new Response(JSON.stringify({ error: 'Ein Termin überschneidet sich bereits mit diesem Zeitraum.' }), { status: 409 });
    }

    // Step 1: Insert appointment
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert([{
        id: appointmentId,
        start: start_conv,
        end: end_conv,
        title,
        notes,
        category,
        patient,
        location,
        attachements: [attachment],
      }]);

    if (appointmentError) {
      console.error('Appointment insert error:', appointmentError);
      return new Response(JSON.stringify({ error: appointmentError.message }), { status: 500 });
    }

    // Step 2: Insert activity
    const { error: activityError } = await supabase
      .from('activities')
      .insert([{
        id: activityId,
        appointment: appointmentId,
        created_by: patient,
        type: 'creation',
        content: `Appointment created with title: ${title}`
      }]);

    if (activityError) {
      console.error('Activity insert error:', activityError);
      return new Response(JSON.stringify({ error: activityError.message }), { status: 500 });
    }

    // Step 3: Insert assignee
    const { error: assigneeError } = await supabase
      .from('appointment_assignee')
      .insert([{
        id: assigneeId,
        appointment: appointmentId,
        user: patient,
        user_type: 'patient',
      }]);

    if (assigneeError) {
      console.error('Assignee insert error:', assigneeError);
      return new Response(JSON.stringify({ error: assigneeError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({
      message: 'Appointment, activity, and assignee created',
      appointmentId
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}
