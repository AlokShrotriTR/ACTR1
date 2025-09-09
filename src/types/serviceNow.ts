export interface ServiceNowConfig {
  instanceUrl: string;
  tableApi: string;
  clientId: string;
  clientSecret: string;
  grantType?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
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