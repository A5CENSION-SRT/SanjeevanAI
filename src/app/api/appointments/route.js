import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', require('@/models/Appointment'));
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor'));
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));
const Case = mongoose.models.Case || mongoose.model('Case', require('@/models/Case'));

// GET all appointments with optional filters
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    
    // Build query
    const query = {};
    
    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid doctor ID format' },
          { status: 400 }
        );
      }
      query.doctorId = doctorId;
    }
    
    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid patient ID format' },
          { status: 400 }
        );
      }
      query.patientId = patientId;
    }
    
    if (date) {
      // Create date range for the entire day
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }
    
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name age gender')
      .populate('caseId')
      .sort({ appointmentDate: 1 });
    
    return NextResponse.json({ success: true, data: appointments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments', error: error.message },
      { status: 500 }
    );
  }
}

// POST to create a new appointment
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { doctorId, patientId, caseId, appointmentDate, duration, status, notes } = body;
    
    if (!doctorId || !patientId || !appointmentDate) {
      return NextResponse.json(
        { success: false, message: 'Doctor ID, patient ID, and appointment date are required' },
        { status: 400 }
      );
    }
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid patient ID format' },
        { status: 400 }
      );
    }
    
    if (caseId && !mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case ID format' },
        { status: 400 }
      );
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Check if case exists if provided
    if (caseId) {
      const caseData = await Case.findById(caseId);
      
      if (!caseData) {
        return NextResponse.json(
          { success: false, message: 'Case not found' },
          { status: 404 }
        );
      }
      
      // Verify case belongs to the patient
      if (caseData.patientId.toString() !== patientId) {
        return NextResponse.json(
          { success: false, message: 'Case does not belong to the specified patient' },
          { status: 400 }
        );
      }
    }
    
    // Check for appointment conflicts
    const appointmentStart = new Date(appointmentDate);
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + (duration || 30));
    
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: { $lt: appointmentEnd },
      endTime: { $gt: appointmentStart },
      status: { $ne: 'cancelled' }
    });
    
    if (conflictingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Doctor already has an appointment scheduled during this time' },
        { status: 400 }
      );
    }
    
    const newAppointment = new Appointment({
      doctorId,
      patientId,
      caseId,
      appointmentDate: appointmentStart,
      endTime: appointmentEnd,
      duration: duration || 30,
      status: status || 'scheduled',
      notes
    });
    
    await newAppointment.save();
    
    // Populate the response
    const savedAppointment = await Appointment.findById(newAppointment._id)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name age gender')
      .populate('caseId');
    
    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      data: savedAppointment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create appointment', error: error.message },
      { status: 500 }
    );
  }
}
