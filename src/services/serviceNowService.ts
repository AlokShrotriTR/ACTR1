import { ServiceNowConfig, ServiceNowResponse, IncidentDetails } from '../types/serviceNow';

class ServiceNowService {
  private config: ServiceNowConfig;

  constructor(config: ServiceNowConfig) {
    this.config = config;
  }

  private getAuthHeaders(): HeadersInit {
    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getIncidentByNumber(incidentNumber: string): Promise<IncidentDetails | null> {
    try {
      const url = `${this.config.instanceUrl}${this.config.tableApi}/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=number,short_description,state,priority,assigned_to,sys_id`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`ServiceNow API error: ${response.status} ${response.statusText}`);
      }

      const data: ServiceNowResponse = await response.json();
      
      if (data.result && data.result.length > 0) {
        return data.result[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching incident from ServiceNow:', error);
      throw new Error('Failed to retrieve incident details from ServiceNow');
    }
  }

  async triggerTRTCall(incidentNumber: string): Promise<boolean> {
    try {
      // This would be your actual TRT call API endpoint
      const url = `${this.config.instanceUrl}/api/x_tr_trt/trigger_call`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          incident_number: incidentNumber,
          call_type: 'major_incident_trt'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error triggering TRT call:', error);
      return false;
    }
  }
}

// Export singleton instance
const serviceNowConfig: ServiceNowConfig = {
  instanceUrl: process.env.REACT_APP_SERVICENOW_INSTANCE || 'https://your-instance.service-now.com',
  tableApi: '/api/now/table',
  username: process.env.REACT_APP_SERVICENOW_USERNAME || '',
  password: process.env.REACT_APP_SERVICENOW_PASSWORD || ''
};

export const serviceNowService = new ServiceNowService(serviceNowConfig);