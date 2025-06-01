{
  "type": "object",
  "properties": {
    "patient_visit_context": {
      "type": "object",
      "description": "Patient and visit metadata for telemedicine consultation",
      "properties": {
        "patient_demographics": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Patient's full name"
            },
            "age": {
              "type": "integer",
              "description": "Patient's age in years"
            },
            "gender": {
              "type": "string",
              "description": "Patient's gender",
              "enum": ["Male", "Female", "Other"]
            },
            "contact_number": {
              "type": "string",
              "description": "Patient's phone number"
            },
            "location": {
              "type": "string",
              "description": "Patient's location (village/city, state)"
            }
          },
          "required": ["name", "age", "gender", "contact_number", "location"]
        },
        "consultation_details": {
          "type": "object",
          "properties": {
            "consultation_date": {
              "type": "string",
              "description": "Date of consultation (YYYY-MM-DD format)"
            },
            "consultation_time": {
              "type": "string",
              "description": "Time of consultation (HH:MM format)"
            },
            "modality": {
              "type": "string",
              "description": "Communication method used",
              "enum": ["Voice Call", "WhatsApp", "Telegram"]
            },
            "duration_minutes": {
              "type": "integer",
              "description": "Duration of consultation in minutes"
            },
            "language_used": {
              "type": "string",
              "description": "Primary language used during consultation"
            }
          },
          "required": ["consultation_date", "consultation_time", "modality", "duration_minutes"]
        }
      },
      "required": ["patient_demographics", "consultation_details"]
    },
    "subjective": {
      "type": "object",
      "description": "Patient's subjective complaints and history",
      "properties": {
        "chief_complaint": {
          "type": "string",
          "description": "Primary reason for consultation in patient's own words"
        },
        "history_present_illness": {
          "type": "object",
          "description": "Detailed history of present illness using OLDCARTS framework",
          "properties": {
            "onset": {
              "type": "string",
              "description": "When symptoms started"
            },
            "location": {
              "type": "string",
              "description": "Where symptoms are located"
            },
            "duration": {
              "type": "string",
              "description": "How long symptoms have persisted"
            },
            "character": {
              "type": "string",
              "description": "Nature and quality of symptoms"
            },
            "alleviating_factors": {
              "type": "array",
              "description": "Factors that improve symptoms",
              "items": {
                "type": "string"
              }
            },
            "aggravating_factors": {
              "type": "array",
              "description": "Factors that worsen symptoms",
              "items": {
                "type": "string"
              }
            },
            "radiation": {
              "type": "string",
              "description": "Does symptom spread elsewhere"
            },
            "temporal_pattern": {
              "type": "string",
              "description": "Time pattern of symptoms"
            },
            "severity": {
              "type": "string",
              "description": "Symptom severity",
              "enum": ["Mild", "Moderate", "Severe"]
            }
          },
          "required": ["onset", "duration", "character", "severity"]
        },
        "associated_symptoms": {
          "type": "array",
          "description": "Other symptoms accompanying the chief complaint",
          "items": {
            "type": "string"
          }
        },
        "relevant_history": {
          "type": "string",
          "description": "Other relevant information from patient narrative"
        }
      },
      "required": ["chief_complaint", "history_present_illness"]
    },
    "objective": {
      "type": "object",
      "description": "Objective findings from remote examination and patient-provided data",
      "properties": {
        "vital_signs": {
          "type": "object",
          "properties": {
            "temperature": {
              "type": "number",
              "description": "Body temperature in Celsius"
            },
            "blood_pressure": {
              "type": "string",
              "description": "Blood pressure (e.g., 120/80)"
            },
            "heart_rate": {
              "type": "integer",
              "description": "Heart rate in beats per minute"
            },
            "respiratory_rate": {
              "type": "integer",
              "description": "Breathing rate per minute"
            },
            "oxygen_saturation": {
              "type": "number",
              "description": "SpO2 percentage"
            },
            "data_source": {
              "type": "string",
              "description": "Source of vital sign measurements",
              "enum": ["Patient Self-Reported", "Home Device", "Family Member Assisted"]
            }
          }
        },
        "general_appearance": {
          "type": "object",
          "properties": {
            "overall_condition": {
              "type": "string",
              "description": "Patient's general condition",
              "enum": ["Well-appearing", "Mild distress", "Moderate distress", "Severe distress"]
            },
            "alertness": {
              "type": "string",
              "description": "Mental state",
              "enum": ["Alert", "Lethargic", "Confused"]
            },
            "speech_pattern": {
              "type": "string",
              "description": "Observations about patient's speech during call"
            },
            "breathing_pattern": {
              "type": "string",
              "description": "Observations about breathing during call"
            }
          }
        },
        "physical_examination": {
          "type": "object",
          "description": "Limited physical examination possible via telemedicine",
          "properties": {
            "inspection_findings": {
              "type": "string",
              "description": "Visual observations from video/photos if available"
            },
            "patient_demonstrated_movements": {
              "type": "string",
              "description": "Movements patient was able to demonstrate"
            },
            "examination_limitations": {
              "type": "string",
              "description": "Limitations of remote examination"
            }
          }
        }
      }
    },
    "medical_history": {
      "type": "object",
      "description": "Comprehensive medical background",
      "properties": {
        "past_medical_history": {
          "type": "array",
          "description": "Previous medical conditions",
          "items": {
            "type": "object",
            "properties": {
              "condition": {
                "type": "string"
              },
              "year_diagnosed": {
                "type": "string"
              },
              "current_status": {
                "type": "string",
                "enum": ["Active", "Resolved", "Chronic"]
              }
            }
          }
        },
        "current_medications": {
          "type": "array",
          "description": "Currently taking medications",
          "items": {
            "type": "object",
            "properties": {
              "medication_name": {
                "type": "string"
              },
              "dosage": {
                "type": "string"
              },
              "frequency": {
                "type": "string"
              },
              "indication": {
                "type": "string"
              }
            }
          }
        },
        "allergies": {
          "type": "array",
          "description": "Known allergies and reactions",
          "items": {
            "type": "object",
            "properties": {
              "allergen": {
                "type": "string"
              },
              "reaction": {
                "type": "string"
              },
              "severity": {
                "type": "string",
                "enum": ["Mild", "Moderate", "Severe"]
              }
            }
          }
        },
        "family_history": {
          "type": "array",
          "description": "Relevant family medical history",
          "items": {
            "type": "object",
            "properties": {
              "relation": {
                "type": "string"
              },
              "condition": {
                "type": "string"
              }
            }
          }
        },
        "social_history": {
          "type": "object",
          "properties": {
            "smoking_status": {
              "type": "string",
              "enum": ["Never", "Former", "Current"]
            },
            "alcohol_use": {
              "type": "string",
              "enum": ["None", "Occasional", "Regular"]
            },
            "occupation": {
              "type": "string"
            },
            "living_conditions": {
              "type": "string"
            }
          }
        }
      }
    },
    "assessment": {
      "type": "object",
      "description": "Clinical assessment and diagnostic reasoning",
      "properties": {
        "primary_diagnosis": {
          "type": "object",
          "properties": {
            "diagnosis": {
              "type": "string",
              "description": "Most likely diagnosis"
            },
            "confidence_level": {
              "type": "string",
              "description": "Confidence in primary diagnosis",
              "enum": ["High", "Moderate", "Low"]
            },
            "reasoning": {
              "type": "string",
              "description": "Clinical reasoning for this diagnosis"
            }
          },
          "required": ["diagnosis", "confidence_level", "reasoning"]
        },
        "differential_diagnoses": {
          "type": "array",
          "description": "Alternative possible diagnoses",
          "items": {
            "type": "object",
            "properties": {
              "diagnosis": {
                "type": "string"
              },
              "probability": {
                "type": "string",
                "enum": ["High", "Moderate", "Low"]
              },
              "supporting_factors": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "opposing_factors": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "severity_assessment": {
          "type": "string",
          "description": "Overall severity of patient's condition",
          "enum": ["Mild", "Moderate", "Severe", "Critical"]
        },
        "red_flags": {
          "type": "array",
          "description": "Warning signs that require immediate attention",
          "items": {
            "type": "string"
          }
        }
      },
      "required": ["primary_diagnosis", "severity_assessment"]
    },
    "plan": {
      "type": "object",
      "description": "Treatment and management plan",
      "properties": {
        "immediate_management": {
          "type": "object",
          "properties": {
            "emergency_referral": {
              "type": "boolean",
              "description": "Does patient need immediate emergency care"
            },
            "urgent_in_person_evaluation": {
              "type": "boolean",
              "description": "Does patient need urgent in-person visit"
            },
            "immediate_actions": {
              "type": "array",
              "description": "Immediate steps patient should take",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "medication_recommendations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "medication_name": {
                "type": "string",
                "description": "Generic medication name"
              },
              "jan_aushadhi_available": {
                "type": "boolean",
                "description": "Available in Jan Aushadhi stores"
              },
              "dosage": {
                "type": "string",
                "description": "Recommended dosage"
              },
              "frequency": {
                "type": "string",
                "description": "How often to take"
              },
              "duration": {
                "type": "string",
                "description": "How long to take medication"
              },
              "indication": {
                "type": "string",
                "description": "Why this medication is recommended"
              },
              "instructions": {
                "type": "string",
                "description": "Special instructions for taking medication"
              },
              "estimated_cost": {
                "type": "string",
                "description": "Approximate cost in rupees"
              }
            },
            "required": ["medication_name", "dosage", "frequency", "duration", "indication"]
          }
        },
        "non_pharmacological_treatment": {
          "type": "array",
          "description": "Lifestyle modifications, home remedies, physical therapy etc.",
          "items": {
            "type": "string"
          }
        },
        "follow_up": {
          "type": "object",
          "properties": {
            "follow_up_needed": {
              "type": "boolean"
            },
            "timeframe": {
              "type": "string",
              "description": "When to follow up (e.g., '3-5 days', '1 week')"
            },
            "method": {
              "type": "string",
              "description": "Preferred follow-up method",
              "enum": ["Telemedicine", "In-person", "Either"]
            },
            "warning_signs": {
              "type": "array",
              "description": "Signs that warrant immediate medical attention",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "patient_education": {
          "type": "array",
          "description": "Key points explained to patient in simple language",
          "items": {
            "type": "string"
          }
        }
      },
      "required": ["immediate_management", "follow_up"]
    },
    "ai_preliminary_analysis": {
      "type": "object",
      "description": "AI-generated preliminary analysis and recommendations",
      "properties": {
        "confidence_score": {
          "type": "number",
          "description": "AI confidence in overall assessment (0-1)"
        },
        "risk_stratification": {
          "type": "string",
          "description": "AI-assessed risk level",
          "enum": ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]
        },
        "suggested_specialist_referral": {
          "type": "object",
          "properties": {
            "referral_needed": {
              "type": "boolean"
            },
            "specialty": {
              "type": "string",
              "description": "Recommended specialty if referral needed"
            },
            "urgency": {
              "type": "string",
              "enum": ["Routine", "Urgent", "Emergent"]
            }
          }
        },
        "diagnostic_certainty": {
          "type": "string",
          "description": "AI assessment of diagnostic certainty",
          "enum": ["High", "Moderate", "Low", "Uncertain"]
        },
        "recommended_investigations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "investigation": {
                "type": "string"
              },
              "priority": {
                "type": "string",
                "enum": ["High", "Medium", "Low"]
              },
              "rationale": {
                "type": "string"
              }
            }
          }
        }
      },
      "required": ["confidence_score", "risk_stratification", "diagnostic_certainty"]
    },
    "telemedicine_specific": {
      "type": "object",
      "description": "Information specific to telemedicine consultation",
      "properties": {
        "technology_assessment": {
          "type": "object",
          "properties": {
            "audio_quality": {
              "type": "string",
              "enum": ["Excellent", "Good", "Fair", "Poor"]
            },
            "video_available": {
              "type": "boolean"
            },
            "video_quality": {
              "type": "string",
              "enum": ["Excellent", "Good", "Fair", "Poor", "Not Available"]
            },
            "technical_difficulties": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "examination_limitations": {
          "type": "array",
          "description": "Specific limitations due to remote nature of consultation",
          "items": {
            "type": "string"
          }
        },
        "patient_digital_literacy": {
          "type": "string",
          "description": "Assessment of patient's comfort with technology",
          "enum": ["High", "Moderate", "Low"]
        },
        "language_barriers": {
          "type": "object",
          "properties": {
            "barriers_present": {
              "type": "boolean"
            },
            "interpreter_used": {
              "type": "boolean"
            },
            "communication_effectiveness": {
              "type": "string",
              "enum": ["Excellent", "Good", "Fair", "Poor"]
            }
          }
        }
      }
    }
  },
  "required": [
    "patient_visit_context",
    "subjective",
    "objective", 
    "medical_history",
    "assessment",
    "plan",
    "ai_preliminary_analysis"
  ]
}