import { NextResponse } from 'next/server';
import { getAllPatients } from '@/lib/db/utils/patientUtils';

export async function GET() {
    try {
        const patients = await getAllPatients();
        return NextResponse.json(patients);
    } catch (error) {
        console.error('Error fetching all patients:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}