# Backend API Utility Functions Guide

This guide provides an overview of the utility functions available for interacting with the MongoDB database. These functions are primarily designed for use by the backend team, for example, when integrating with the WhatsApp AI agent.

## Core Concepts

- **`Patient`**: Represents a patient in the system, including their personal details and a history of all their consultations.
- **`CurrentPatient`**: A separate collection to track patients who have an *active* consultation that a doctor needs to review. This is used to populate the doctor's dashboard.
- **`CompletedConsultation`**: Stores a snapshot of a consultation once it's marked as completed by a doctor.
- **`Doctor`**: Represents a doctor in the system.

All utility functions handle database connection internally.

## Patient Utility Functions (`src/lib/db/utils/patientUtils.ts`)

These functions operate primarily on the `Patient` collection.

### 1. `createPatient`

- **Purpose**: Creates a new patient record or adds a new consultation if the patient (identified by phone number) already exists.
- **When to Use**: When a new user interacts with the WhatsApp agent for the first time, or an existing user starts a new consultation.
- **Parameters**:
    - `name: string` - Patient's full name.
    - `age: number` - Patient's age.
    - `gender: string` - Patient's gender.
    - `phoneNumber: string` - Patient's phone number (should be unique).
    - `initialMessage: string` - The first message from the user for this consultation.
- **Returns**: `Promise<{ patient: IPatient, consultationId: ObjectId, isNew: boolean }>`
    - `patient`: The created or updated patient document.
    - `consultationId`: The ID of the newly created consultation.
    - `isNew`: Boolean indicating if a new patient was created (`true`) or if a new consultation was added to an existing patient (`false`).
- **Side Effects**: If a new consultation is created, it also calls `addToCurrentPatients` to add this consultation to the doctor's active queue.

### 2. `appendChatMessage`

- **Purpose**: Appends a new chat message (either from the user or the AI assistant) to a patient's consultation.
- **When to Use**: Every time a message is exchanged between the user and the WhatsApp AI agent.
- **Parameters**:
    - `phoneNumber: string` - Patient's phone number.
    - `message: { role: 'user' | 'assistant', content: string }` - The chat message object.
    - `consultationId?: string` (Optional) - The ID of the specific consultation to append to. If not provided, the message is appended to the patient's most recent consultation.
- **Returns**: `Promise<{ patient: IPatient, consultation: IConsultation }>` - The updated patient and the specific consultation.
- **Side Effects**: If the message `role` is `'assistant'`, this function will also call `updateAISummary` to update the `CurrentPatient` record with a summary of the AI's last response.

### 3. `appendImage`

- **Purpose**: Appends an image sent by the user to their consultation.
- **When to Use**: When the user sends an image via WhatsApp.
- **Parameters**:
    - `phoneNumber: string` - Patient's phone number.
    - `imageData: { url: string, description?: string }` - Object containing the image URL and an optional description.
    - `consultationId?: string` (Optional) - The ID of the specific consultation. Defaults to the most recent.
- **Returns**: `Promise<{ patient: IPatient, consultation: IConsultation }>` - The updated patient and consultation.

### 4. `updatePrescription`

- **Purpose**: Updates or creates the AI-generated prescription for a specific consultation.
- **When to Use**: After the AI agent has formulated a diagnosis, medication list, and recommendations.
- **Parameters**:
    - `phoneNumber: string` - Patient's phone number.
    - `prescriptionData: { diagnosis: string, medications: Array<{ name: string, dosage: string, frequency: string, duration: string }>, recommendations: string[] }` - The detailed prescription object.
    - `consultationId?: string` (Optional) - The ID of the specific consultation. Defaults to the most recent.
- **Returns**: `Promise<{ patient: IPatient, consultation: IConsultation }>` - The updated patient and consultation.

### 5. `getPatientByPhone`

- **Purpose**: Retrieves a patient's full record by their phone number.
- **When to Use**: If you need to fetch all details of a patient.
- **Parameters**:
    - `phoneNumber: string` - Patient's phone number.
- **Returns**: `Promise<IPatient | null>` - The patient document or `null` if not found.

### 6. `getPendingConsultations`

- **Purpose**: Retrieves all patients who have consultations with a status of `'pending_review'`.
- **When to Use**: Useful for administrative purposes or if you need a list of all consultations awaiting a doctor's first review (before they are actively picked up from the `CurrentPatient` queue).
- **Returns**: `Promise<IPatient[]>` - An array of patient documents.

### 7. `updateConsultationStatus`

- **Purpose**: Allows updating the status of a specific consultation within a patient's record and optionally adding review comments from a doctor.
- **When to Use**: This might be used by the doctor's UI, but if the backend needs to programmatically change a consultation status (e.g., from `pending_review` to `reviewed` after initial processing).
- **Parameters**:
    - `patientId: string` - The patient's `_id`.
    - `consultationId: string` - The `_id` of the specific consultation.
    - `doctorId: string` - The `_id` of the doctor performing the action.
    - `status: 'reviewed' | 'completed'` - The new status.
    - `comments?: string` (Optional) - Comments from the doctor.
- **Returns**: `Promise<IPatient | null>` - The updated patient document.

### 8. `getAllPatients`

- **Purpose**: Retrieves all patients in the database.
- **When to Use**: For administrative views or data export.
- **Returns**: `Promise<IPatient[]>` - An array of all patient documents.

## Current Patient Utility Functions (`src/lib/db/utils/currentPatientUtils.ts`)

These functions manage the `CurrentPatient` collection, which drives the doctor's dashboard for active consultations.

### 1. `addToCurrentPatients`

- **Purpose**: Adds a patient's specific consultation to the `CurrentPatient` list, making it visible on the doctor's dashboard. If the patient already has an active consultation in the queue, it updates that record with the new `consultationId`.
- **When to Use**: This is typically called internally by `createPatient` when a new consultation starts.
- **Parameters**:
    - `patientId: string` - The `_id` of the `Patient`.
    - `consultationId: string` - The `_id` of the new active consultation from the `Patient`'s `consultations` array.
- **Returns**: `Promise<ICurrentPatient>` - The created or updated `CurrentPatient` document.

### 2. `getCurrentPatients`

- **Purpose**: Retrieves all patients currently in the active consultation queue.
- **When to Use**: Used by the Doctor's UI to display the list of patients needing attention.
- **Parameters**: None.
- **Returns**: `Promise<ICurrentPatient[]>` - An array of `CurrentPatient` documents, sorted by `lastUpdated` descending.

### 3. `updateAISummary`

- **Purpose**: Updates the `aiSummary` field for an active consultation in the `CurrentPatient` record.
- **When to Use**: Called internally by `appendChatMessage` when the AI assistant sends a message. This provides a quick summary for the doctor on the dashboard.
- **Parameters**:
    - `patientId: string` - The `_id` of the `Patient`. (This is used to find the active `CurrentPatient` record).
    - `aiSummary: string` - A brief summary of the AI's latest interaction.
- **Returns**: `Promise<ICurrentPatient | null>` - The updated `CurrentPatient` document.

### 4. `completeConsultation`

- **Purpose**: Moves a consultation from the active queue (`CurrentPatient`) to the `CompletedConsultation` collection. It also updates the original `Patient` record to mark the consultation as `'completed'`. This is a transactional operation.
- **When to Use**: When a doctor clicks "Complete Consultation" in the UI.
- **Parameters**:
    - `currentPatientId: string` - The `_id` of the `CurrentPatient` document (from the doctor's dashboard).
    - `doctorId: string` - The `_id` of the doctor completing the consultation.
    - `doctorName: string` - The name of the doctor.
    - `doctorComments: string` - Final comments from the doctor.
- **Returns**: `Promise<ICompletedConsultation>` - The newly created `CompletedConsultation` document.
- **Side Effects**:
    - Creates a new record in `CompletedConsultation`.
    - Updates the status of the consultation in the `Patient` document.
    - Deletes the record from `CurrentPatient`.

This guide should help your backend team leverage these utility functions effectively. 