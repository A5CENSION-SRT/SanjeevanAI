import { NextResponse } from 'next/server';
import { appendChatMessage, appendImage } from '@/lib/db/utils/patientUtils';
import { updateAISummary } from '@/lib/db/utils/currentPatientUtils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber, chatData, imageData, consultationId } = body;
        
        // Validate required fields
        if (!phoneNumber) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Missing required field: phoneNumber is required',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }
        
        // Either chatData or imageData must be provided
        if (!chatData && !imageData) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Either chatData or imageData must be provided',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }
        
        let result;
        
        // Process chat message
        if (chatData) {
            // Validate chat data
            if (!chatData.role || !chatData.content) {
                return NextResponse.json(
                    {
                        status: 'error',
                        message: 'Chat data must contain role and content',
                        timestamp: new Date().toISOString()
                    },
                    { status: 400 }
                );
            }
            
            result = await appendChatMessage(phoneNumber, chatData, consultationId);
            
            // If this is an AI message, update the AI summary in CurrentPatient
            if (chatData.role === 'assistant' && chatData.content) {
                // Use a simple summary (first 100 characters)
                const aiSummary = chatData.content.length > 100 
                    ? `${chatData.content.substring(0, 100)}...`
                    : chatData.content;
                
                await updateAISummary(result.patient._id.toString(), aiSummary);
            }
        }
        
        // Process image
        if (imageData) {
            // Validate image data
            if (!imageData.url) {
                return NextResponse.json(
                    {
                        status: 'error',
                        message: 'Image data must contain url',
                        timestamp: new Date().toISOString()
                    },
                    { status: 400 }
                );
            }
            
            result = await appendImage(phoneNumber, imageData, consultationId);
        }
        
        return NextResponse.json({
            status: 'success',
            data: result,
            message: chatData ? 'Chat message appended' : 'Image appended',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error appending data to consultation:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to append data to consultation',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 