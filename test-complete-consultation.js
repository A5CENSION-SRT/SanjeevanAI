// Test script for the complete consultation API route
const fetch = require('node-fetch');

async function testCompleteConsultation() {
  try {
    console.log('Testing complete consultation API...');
    
    // Replace with a valid case ID from your database
    const testCaseId = '65f2a1234567890123456789'; // Example case ID - replace with real one
    
    const response = await fetch('http://localhost:3000/api/consultations/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPatientId: testCaseId,
        doctorId: 'test-doctor-id',
        doctorName: 'Dr. Test Doctor',
        doctorComments: 'Test consultation completed successfully',
        prescription: 'Test prescription content'
      })
    });
    
    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Test passed: API returned success response');
    } else {
      console.log('❌ Test failed: API returned error response');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testCompleteConsultation();
