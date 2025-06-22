// import { v4 as uuidv4 } from "uuid";
import { supabase } from '../../../lib/supabaseClient';

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   const {
//     start,
//     end,
//     location,
//     patient,
//     category,
//     notes,
//     title,
//   } = req.body;

//   if (!start || !end || !patient) {
//     return res.status(400).json({ error: "start, end, and patient are required" });
//   }

//   const appointmentId = uuidv4(); // Generate UUID for appointment
//   const activityId = uuidv4(); // Generate UUID for activity

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     // Insert appointment
//     await client.query(
//       `INSERT INTO appointments (id, start, end, location, patient, category, notes, title)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//       [appointmentId, start, end, location, patient, category, notes, title]
//     );

//     // Insert activity linked to appointment
//     await client.query(
//       `INSERT INTO activities (id, appointment_id, type, content, created_by)
//        VALUES ($1, $2, $3, $4, $5)`,
//       [activityId, appointmentId, "appointment_created", "Appointment was created", null]
//     );

//     await client.query("COMMIT");

//     return res.status(201).json({ appointmentId, message: "Appointment and activity created" });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   } finally {
//     client.release();
//   }
// }
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
    } = await req.json();

    const appointmentId = uuidv4();
    const activityId = uuidv4();
    const assigneeId = uuidv4();

    // Step 1: Insert appointment with explicit id
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert([{
        id: appointmentId,
        start,
        end,
        title,
        notes,
        category,
        patient,
        location,
      }]);

    if (appointmentError) {
      console.error('Appointment insert error:', appointmentError);
      return new Response(JSON.stringify({ error: appointmentError.message }), { status: 500 });
    }

    // Step 2: Insert dummy activity with explicit id
    const { error: activityError } = await supabase
      .from('activities')
      .insert([{
        id: activityId,
        appointment: appointmentId,
        created_by: patient,  // or another UUID representing the creator
        type: 'creation',
        content: `Appointment created with title: ${title}`
      }]);

    if (activityError) {
      console.error('Activity insert error:', activityError);
      return new Response(JSON.stringify({ error: activityError.message }), { status: 500 });
    }

    // Step 3: Insert dummy appointment_assignee with explicit id
    const { error: assigneeError } = await supabase
      .from('appointment_assignee')
      .insert([{
        id: assigneeId,
        appointment: appointmentId,
        user: patient,  // dummy user (patient)
        user_type: 'patient',
      }]);

    if (assigneeError) {
      console.error('Appointment assignee insert error:', assigneeError);
      return new Response(JSON.stringify({ error: assigneeError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Appointment, activity, and assignee created', appointmentId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}