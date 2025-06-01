import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Import models
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', require('@/models/Appointment'));
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', require('@/models/Doctor'));
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/models/Patient'));

// GET a specific appointment by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID format' },
        { status: 400 }
      );
    }
    
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', require('@/models/Appointment').schema);
    const appointment = await Appointment.findById(id)
      .populate('doctorId', 'name specialization email phone')
      .populate('patientId', 'name age gender contact email')
      .populate('caseId');
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: appointment }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointment', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update appointment information
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { appointmentDate, appointmentTime, status, notes } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID format' },
        { status: 400 }
      );
    }
    
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', require('@/models/Appointment').schema);
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Update fields if provided
    const updateData = {};
    
    if (appointmentDate && appointmentTime) {
      updateData.appointmentDate = new Date(`${appointmentDate}T${appointmentTime}`);
      
      // Check for conflicting appointments if date/time is changed
      if (updateData.appointmentDate.getTime() !== appointment.appointmentDate.getTime()) {
        const conflictingAppointment = await Appointment.findOne({
          _id: { $ne: id },
          doctorId: appointment.doctorId,
          appointmentDate: updateData.appointmentDate,
          status: { $ne: 'cancelled' }
        });
        
        if (conflictingAppointment) {
          return NextResponse.json(
            { success: false, message: 'Doctor already has an appointment at this time' },
            { status: 409 }
          );
        }
      }
    } else if (appointmentDate) {
      // If only date is provided, keep the same time
      const currentTime = appointment.appointmentDate.toTimeString().slice(0, 5);
      updateData.appointmentDate = new Date(`${appointmentDate}T${currentTime}`);
    } else if (appointmentTime) {
      // If only time is provided, keep the same date
      const currentDate = appointment.appointmentDate.toISOString().slice(0, 10);
      updateData.appointmentDate = new Date(`${currentDate}T${appointmentTime}`);
    }
    
    if (status) {
      updateData.status = status;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    updateData.updatedAt = new Date();
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name age gender');
    
    return NextResponse.json(
      { success: true, message: 'Appointment updated successfully', data: updatedAppointment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update appointment', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE an appointment
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID format' },
        { status: 400 }
      );
    }
    
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', require('@/models/Appointment').schema);
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    
    if (!deletedAppointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete appointment', error: error.message },
      { status: 500 }
    );
  }
}
