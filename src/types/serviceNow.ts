export interface ServiceNowConfig {
  instanceUrl: string;
  tableApi: string;
  username: string;
  password: string;
}

export interface IncidentDetails {
  number: string;
  short_description: string;
  state: string;
  priority: string;
  assigned_to: string;
  sys_id: string;
}

export interface ServiceNowResponse {
  result: IncidentDetails[];
}

export interface IncidentConfirmation {
  incident: IncidentDetails;
  isConfirmed: boolean;
}