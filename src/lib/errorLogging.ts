import { supabase } from './supabase';
import toast from 'react-hot-toast';

interface ErrorLogData {
  error: any;
  context?: string;
  metadata?: Record<string, any>;
}

export async function logError({ error, context, metadata }: ErrorLogData) {
  try {
    const errorData = {
      message: error.message || 'Unknown error',
      code: error.code,
      details: error.details,
      stack: error.stack,
      context,
      metadata,
    };

    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: context || 'unknown',
        operation: 'ERROR',
        new_data: errorData,
        query: error.query,
      });

    if (logError) {
      console.error('Failed to log error:', logError);
    }

    // Always log to console for development
    console.error(`Error in ${context}:`, error);

    // Show user-friendly error message
    const message = getErrorMessage(error);
    toast.error(message);
  } catch (loggingError) {
    console.error('Error logging failed:', loggingError);
    toast.error('An unexpected error occurred');
  }
}

function getErrorMessage(error: any): string {
  // Handle Supabase errors
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'No data found';
      case '42501':
        return 'Permission denied';
      case '23505':
        return 'This record already exists';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  // Handle network errors
  if (error.name === 'NetworkError') {
    return 'Network connection error. Please check your internet connection.';
  }

  // Handle other types of errors
  return error.message || 'An unexpected error occurred';
}