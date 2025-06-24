import { convertBerlinTimeToUTC } from '@/app/common/commonFunctions';
import { supabase } from '../../../../lib/supabaseClient';

export async function PUT(req, { params }) {
  try {
    const appointmentId = params.id; // get from URL path param
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

    const start_conv = convertBerlinTimeToUTC(start);
    const end_conv = convertBerlinTimeToUTC(end);

    // Check for overlapping appointments excluding current one
    const { data: overlappingAppointments, error: overlapError } = await supabase
      .from('appointments')
      .select('id')
      .or(`and(start.lt.${end_conv},end.gt.${start_conv})`)
      .neq('id', appointmentId);

    if (overlapError) {
      console.error('Overlap check error:', overlapError);
      return new Response(JSON.stringify({ error: 'Überprüfung auf Überschneidung fehlgeschlagen.' }), { status: 500 });
    }

    if (overlappingAppointments && overlappingAppointments.length > 0) {
      return new Response(JSON.stringify({ error: 'Ein Termin überschneidet sich bereits mit diesem Zeitraum.' }), { status: 409 });
    }

    // Update appointment
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        start: start_conv,
        end: end_conv,
        title,
        notes,
        category,
        patient,
        location,
        attachements: [attachment],
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Appointment update error:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    // Optionally update related activity, assignee if needed
    // (You can extend this to update related tables as per your requirements)

    return new Response(JSON.stringify({ message: 'Termin erfolgreich aktualisiert' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400 });
  }
}
