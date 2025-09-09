import { ServiceNowConfig, ServiceNowResponse, IncidentDetails, OAuthTokenResponse } from '../types/serviceNow';

class ServiceNowService {
  private config: ServiceNowConfig;

  constructor(config: ServiceNowConfig) {
    this.config = config;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Use custom headers instead of OAuth token for CORS compatibility
    return {
      'X-Client-ID': this.config.clientId,
      'X-Client-Secret': this.config.clientSecret,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getIncidentByNumber(incidentNumber: string): Promise<IncidentDetails | null> {
    try {
      // Try custom REST API first (better CORS support)
      // Actual endpoint structure: /api/{scope_id}/actr1_incident/incident/{number}
      const customUrl = `${this.config.instanceUrl}/api/1813479/actr1_incident/incident/${incidentNumber}`;
      
      console.log('Attempting custom API call to:', customUrl);
      
      const customResponse = await fetch(customUrl, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        mode: 'cors'
      });

      if (customResponse.ok) {
        const customData: ServiceNowResponse = await customResponse.json();
        if (customData.result && customData.result.length > 0) {
          console.log('Custom API success:', customData.result[0]);
          return customData.result[0];
        }
      } else {
        console.log('Custom API failed with status:', customResponse.status, customResponse.statusText);
        if (customResponse.status === 401) {
          throw new Error('Authentication failed. Please check ServiceNow credentials.');
        }
        if (customResponse.status === 404) {
          console.log('Custom API endpoint not found, trying standard API...');
        }
      }
      
      console.log('Custom API failed, trying standard API...');
      
      // Fallback to standard API
      const standardUrl = `${this.config.instanceUrl}${this.config.tableApi}/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=number,short_description,state,priority,assigned_to,sys_id`;
      
      const response = await fetch(standardUrl, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        mode: 'cors'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check ServiceNow credentials.');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. Please check ServiceNow permissions.');
        }
        throw new Error(`ServiceNow API error: ${response.status} ${response.statusText}`);
      }

      const data: ServiceNowResponse = await response.json();
      
      if (data.result && data.result.length > 0) {
        return data.result[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching incident from ServiceNow:', error);
      
      // Log the actual error for debugging
      if (error instanceof Error) {
        console.error('Detailed error:', error.message);
      }
      
      // Don't use fallback data - let the real error show
      throw error;
    }
  }

  private getCORSFallbackData(incidentNumber: string): IncidentDetails | null {
    // Provide realistic demo data when CORS blocks the actual API call
    const demoData: Record<string, IncidentDetails> = {
      'INC0008001': {
        number: 'INC0008001',
        short_description: 'Network connectivity issues affecting email services across multiple locations',
        state: '2',
        priority: '1',
        assigned_to: 'John Smith',
        sys_id: 'demo-sys-id-001'
      },
      'INC0008002': {
        number: 'INC0008002',
        short_description: 'Database performance degradation causing application timeouts',
        state: '1',
        priority: '2',
        assigned_to: 'Sarah Johnson',
        sys_id: 'demo-sys-id-002'
      },
      'INC0008111': {
        number: 'INC0008111',
        short_description: 'Critical infrastructure failure requiring immediate response',
        state: '2',
        priority: '1',
        assigned_to: 'Mike Chen',
        sys_id: 'demo-sys-id-111'
      }
    };

    const fallbackData = demoData[incidentNumber];
    if (fallbackData) {
      console.log('Returning demo data for CORS fallback:', fallbackData);
    }
    return fallbackData || null;
  }

  async triggerTRTCall(incidentNumber: string): Promise<boolean> {
    try {
      // Try custom TRT API first
      const customTRTUrl = `${this.config.instanceUrl}/api/1813479/actr1_incident/trt_call`;
      
      console.log('Attempting custom TRT API call to:', customTRTUrl);
      
      const customResponse = await fetch(customTRTUrl, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          incident_number: incidentNumber,
          call_type: 'major_incident_trt'
        })
      });

      if (customResponse.ok) {
        console.log('Custom TRT API success');
        return true;
      }
      
      console.log('Custom TRT API failed, trying standard approach...');
      
      // Fallback to standard API endpoint
      const standardUrl = `${this.config.instanceUrl}/api/x_tr_trt/trigger_call`;
      
      const response = await fetch(standardUrl, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
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
  clientId: process.env.REACT_APP_SERVICENOW_CLIENT_ID || '',
  clientSecret: process.env.REACT_APP_SERVICENOW_CLIENT_SECRET || '',
  grantType: 'client_credentials'
};

// Debug configuration (remove in production)
console.log('ServiceNow Config Debug:', {
  instanceUrl: serviceNowConfig.instanceUrl,
  clientId: serviceNowConfig.clientId,
  clientSecretSet: !!serviceNowConfig.clientSecret,
  authMethod: 'Custom Headers (CORS-friendly)'
});

export const serviceNowService = new ServiceNowService(serviceNowConfig);