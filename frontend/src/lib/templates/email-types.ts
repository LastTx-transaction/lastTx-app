// Email template data types
export interface EmailTemplateData {
  to_name: string;
  subject: string;
  notification_type:
    | 'INHERITANCE_CREATED'
    | 'CLAIM_NOTIFICATION'
    | 'EXPIRY_WARNING'
    | 'TEST';
  will_id: string;
  message: string;
  action_url?: string;
  beneficiary_name?: string;
  beneficiary_address?: string;
  percentage?: number;
  amount?: string;
  expiry_date?: string;
  time_remaining?: string;
  urgency_level?: 'EXPIRING_SOON' | 'EXPIRED';
}

export interface EmailStyles {
  headerClass: string;
  headerIcon: string;
  notificationClass: string;
  buttonClass: string;
  buttonText: string;
}
