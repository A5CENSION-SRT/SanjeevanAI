import { NextResponse } from 'next/server';
import { createAnayaPatient } from '@/lib/db/utils/patientUtils';

export async function POST() {
    try {
        const patient = await createAnayaPatient();
        return NextResponse.json(patient);
    } catch (error) {
        console.error('Error creating Anaya patient:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 