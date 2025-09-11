import React, { useState, useEffect } from 'react';
import * as microsoftTeams from '@microsoft/teams-js';
import {
  FluentProvider,
  webLightTheme,
  Button,
  Input,
  Field,
  Card,
  CardHeader,
  Text,
  Title1,
  Body1,
  MessageBar,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Search20Regular } from '@fluentui/react-icons';

interface UserInput {
  majorIncidentNumber: string;
}

interface TeamsContext {
  userDisplayName?: string;
  userPrincipalName?: string;
  teamName?: string;
  channelName?: string;
  locale?: string;
}

interface IncidentData {
  number: string;
  short_description: string;
  state: string;
  priority: string;
  assigned_to?: { display_value: string };
  caller_id?: { display_value: string };
  opened_at: string;
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
}

interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

const useStyles = makeStyles({
  appContainer: {
    padding: tokens.spacingVerticalL,
    maxWidth: '600px',
    margin: '0 auto'
  },
  inputSection: {
    marginBottom: tokens.spacingVerticalL
  },
  searchButton: {
    marginTop: tokens.spacingVerticalM
  },
  messageBar: {
    marginBottom: tokens.spacingVerticalM
  }
});

export const App: React.FC = () => {
  const styles = useStyles();
  const [userInput, setUserInput] = useState<UserInput>({ majorIncidentNumber: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isTeamsInitialized, setIsTeamsInitialized] = useState(false);
  const [teamsContext, setTeamsContext] = useState<TeamsContext | null>(null);
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [oauthToken, setOauthToken] = useState<OAuthToken | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // OAuth Configuration for ServiceNow
  const oauthConfig: OAuthConfig = {
    clientId: 'f5128ff271732250433aeb0e714b8cae', // ServiceNow OAuth app client ID
    clientSecret: 'VxgMXG`ccF', // ServiceNow OAuth app client secret
    redirectUri: 'https://alokshrotritr.github.io/ACTR1/oauth-callback.html', // Dedicated OAuth callback page
    scope: 'useraccount', // ServiceNow OAuth scope
    authUrl: 'https://dev279775.service-now.com/oauth_auth.do',
    tokenUrl: 'https://dev279775.service-now.com/oauth_token.do'
  };

  const isValidIncidentNumber = (value: string): boolean => {
    return /^INC\d{7}$/.test(value);
  };

  // OAuth Authentication Functions
  const initiateOAuthFlow = () => {
    setIsAuthenticating(true);
    setMessage('🔐 Opening ServiceNow authentication window...');
    setMessageType('info');

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: oauthConfig.clientId,
      redirect_uri: oauthConfig.redirectUri,
      scope: oauthConfig.scope,
      state: Math.random().toString(36).substring(2, 15) // CSRF protection
    });

    const authUrl = `${oauthConfig.authUrl}?${authParams.toString()}`;
    
    // Open OAuth in popup window to avoid CORS issues
    const popup = window.open(
      authUrl,
      'servicenow-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      setMessage('❌ Popup blocked. Please allow popups and try again.');
      setMessageType('error');
      setIsAuthenticating(false);
      return;
    }

    // Listen for popup completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        if (!oauthToken) {
          setMessage('❌ Authentication was cancelled');
          setMessageType('error');
          setIsAuthenticating(false);
        }
      }
    }, 1000);

    // Listen for message from popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', messageListener);
        
        const { code } = event.data;
        if (code) {
          exchangeCodeForToken(code);
        } else {
          setMessage('❌ No authorization code received');
          setMessageType('error');
          setIsAuthenticating(false);
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', messageListener);
        setMessage(`❌ Authentication failed: ${event.data.error}`);
        setMessageType('error');
        setIsAuthenticating(false);
      }
    };

    window.addEventListener('message', messageListener);
  };

  const exchangeCodeForToken = async (authCode: string): Promise<OAuthToken | null> => {
    try {
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        code: authCode,
        redirect_uri: oauthConfig.redirectUri
      });

      const response = await fetch(oauthConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: tokenParams.toString()
      });

      if (response.ok) {
        const tokenData: OAuthToken = await response.json();
        console.log('✅ OAuth token received successfully');
        return tokenData;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to exchange code for token:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('❌ Error during token exchange:', error);
      return null;
    }
  };

  const refreshAccessToken = async (refreshToken: string): Promise<OAuthToken | null> => {
    try {
      const tokenParams = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        refresh_token: refreshToken
      });

      const response = await fetch(oauthConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: tokenParams.toString()
      });

      if (response.ok) {
        const tokenData: OAuthToken = await response.json();
        console.log('✅ Access token refreshed successfully');
        return tokenData;
      } else {
        console.error('❌ Failed to refresh token');
        return null;
      }
    } catch (error) {
      console.error('❌ Error during token refresh:', error);
      return null;
    }
  };

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (!oauthToken) {
      throw new Error('No OAuth token available');
    }

    const headers = {
      'Authorization': `Bearer ${oauthToken.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    let response = await fetch(url, {
      ...options,
      headers
    });

    // If token expired, try to refresh
    if (response.status === 401 && oauthToken.refresh_token) {
      console.log('🔄 Access token expired, attempting refresh...');
      const newToken = await refreshAccessToken(oauthToken.refresh_token);
      
      if (newToken) {
        setOauthToken(newToken);
        localStorage.setItem('servicenow_oauth_token', JSON.stringify(newToken));
        
        // Retry the request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken.access_token}`
          }
        });
      }
    }

    return response;
  };

  useEffect(() => {
    const initializeTeams = async () => {
      try {
        await microsoftTeams.app.initialize();
        setIsTeamsInitialized(true);
        
        const context = await microsoftTeams.app.getContext();
        setTeamsContext({
          userDisplayName: context.user?.displayName,
          userPrincipalName: context.user?.userPrincipalName,
          teamName: context.team?.displayName,
          channelName: context.channel?.displayName,
          locale: context.app.locale
        });
        
        console.log('✅ Teams SDK initialized successfully');
        setMessage(`👋 Welcome ${context.user?.displayName || 'User'}! Teams integration active.`);
        setMessageType('success');
      } catch (error) {
        console.warn('⚠️ Teams SDK initialization failed - running in standalone mode', error);
        setIsTeamsInitialized(false);
        setMessage('Running in standalone mode (not in Teams)');
        setMessageType('info');
      }
    };

    const handleOAuthCallback = async () => {
      // Check if we're returning from OAuth flow
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('❌ OAuth error:', error);
        setMessage(`❌ Authentication failed: ${error}`);
        setMessageType('error');
        setIsAuthenticating(false);
        return;
      }

      if (authCode) {
        console.log('🔐 Processing OAuth callback...');
        setMessage('🔐 Completing authentication...');
        setMessageType('info');

        const token = await exchangeCodeForToken(authCode);
        if (token) {
          setOauthToken(token);
          localStorage.setItem('servicenow_oauth_token', JSON.stringify(token));
          setMessage('✅ Successfully authenticated with ServiceNow!');
          setMessageType('success');
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setMessage('❌ Failed to complete authentication');
          setMessageType('error');
        }
        setIsAuthenticating(false);
      }
    };

    const loadStoredToken = () => {
      // Check for stored OAuth token
      const storedToken = localStorage.getItem('servicenow_oauth_token');
      if (storedToken) {
        try {
          const token: OAuthToken = JSON.parse(storedToken);
          setOauthToken(token);
          console.log('✅ Loaded stored OAuth token');
        } catch (error) {
          console.error('❌ Failed to parse stored token:', error);
          localStorage.removeItem('servicenow_oauth_token');
        }
      }
    };

    initializeTeams();
    handleOAuthCallback();
    loadStoredToken();
  }, []);

  // OAuth-enabled ServiceNow API call function
  const searchServiceNow = async (incidentNumber: string) => {
    if (!oauthToken) {
      setMessage('❌ Please authenticate with ServiceNow first');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('Searching ServiceNow...');
    setMessageType('info');
    setIncidentData(null);

    try {
      console.log('🔍 Starting ServiceNow search for:', incidentNumber);
      
      const url = `https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=number,short_description,state,priority,assigned_to,caller_id,opened_at`;
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          const incident = data.result[0];
          setIncidentData(incident);
          setMessage(`✅ Found incident: ${incident.short_description}`);
          setMessageType('success');
        } else {
          setMessage(`❌ No incident found with number: ${incidentNumber}`);
          setMessageType('error');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        setMessage(`❌ API Error: ${response.status} - ${errorText}`);
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('🚫 Network Error:', error);
      setMessage(`🚫 Network Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase();
    setUserInput({ majorIncidentNumber: value });
    setMessage(null); // Clear any previous messages
  };

  const handleSearch = async () => {
    if (!isValidIncidentNumber(userInput.majorIncidentNumber)) {
      setMessage('Please enter a valid incident number (format: INC0000000)');
      setMessageType('error');
      return;
    }

    if (!oauthToken) {
      setMessage('❌ Please authenticate with ServiceNow first');
      setMessageType('error');
      return;
    }

    // Call ServiceNow API
    await searchServiceNow(userInput.majorIncidentNumber);
  };

  const handleLogout = () => {
    setOauthToken(null);
    localStorage.removeItem('servicenow_oauth_token');
    setMessage('✅ Logged out successfully');
    setMessageType('success');
    setIncidentData(null);
  };

  // OAuth-enabled add work notes to ServiceNow incident
  const addWorkNotesToIncident = async (incidentNumber: string, meetingInfo: string): Promise<boolean> => {
    if (!oauthToken) {
      console.error('❌ No OAuth token available');
      return false;
    }

    try {
      console.log('📝 Adding work notes to incident:', incidentNumber);
      
      const workNote = `TRT Call initiated at ${new Date().toLocaleString()}\n${meetingInfo}\n\nTechnical Response Team has been activated for this incident.`;
      
      // Get incident sys_id first
      const searchUrl = `https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=sys_id`;
      
      console.log('🔍 Searching for incident sys_id...');
      const searchResponse = await makeAuthenticatedRequest(searchUrl, {
        method: 'GET'
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('📋 Search response:', searchData);
        
        if (searchData.result && searchData.result.length > 0) {
          const sysId = searchData.result[0].sys_id;
          console.log('✅ Found incident sys_id:', sysId);
          
          // Update the incident with work notes
          const updateUrl = `https://dev279775.service-now.com/api/now/table/incident/${sysId}`;
          
          console.log('📝 Updating incident with work notes...');
          const updateResponse = await makeAuthenticatedRequest(updateUrl, {
            method: 'PATCH',
            body: JSON.stringify({
              work_notes: workNote
            })
          });

          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            console.log('✅ Work notes added successfully:', updateData);
            return true;
          } else {
            const errorText = await updateResponse.text();
            console.error('❌ Failed to add work notes:', updateResponse.status, errorText);
            return false;
          }
        } else {
          console.error('❌ Incident not found');
          return false;
        }
      } else {
        const errorText = await searchResponse.text();
        console.error('❌ Failed to search incident:', searchResponse.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error adding work notes:', error);
      return false;
    }
  };

  // Handle TRT Call - Create Teams meeting and add link to ServiceNow work notes
  const handleStartTRTCall = async () => {
    if (!incidentData) {
      setMessage('❌ No incident data available');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('🚨 Starting TRT Call...');
    setMessageType('info');

    try {
      let meetingInfo = '';
      
      // Create Teams meeting URL
      const meetingSubject = `TRT Call - ${incidentData.number}`;
      const meetingBody = `Technical Response Team call for incident ${incidentData.number}: ${incidentData.short_description}`;
      
      // Generate Teams meeting URL
      const meetingUrl = `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(meetingSubject)}&content=${encodeURIComponent(meetingBody)}`;
      
      meetingInfo = `Teams Meeting: ${meetingUrl}`;
      console.log('📞 Generated Teams meeting URL:', meetingUrl);

      // Add work notes to ServiceNow incident
      const workNotesSuccess = await addWorkNotesToIncident(incidentData.number, meetingInfo);

      // Open the meeting URL
      window.open(meetingUrl, '_blank');
      console.log('🚀 Opening Teams meeting URL');

      if (workNotesSuccess) {
        setMessage(`✅ TRT Call started! Meeting link added to incident ${incidentData.number}`);
        setMessageType('success');
      } else {
        setMessage(`⚠️ TRT Call started! However, failed to update work notes in ServiceNow`);
        setMessageType('error');
      }

    } catch (error: any) {
      console.error('❌ Failed to start TRT call:', error);
      setMessage(`❌ Failed to start TRT call: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.appContainer}>
        <Title1>ACTR1 - Incident Search</Title1>
        <Body1 style={{ marginBottom: tokens.spacingVerticalL }}>
          Enter a major incident number to search ServiceNow
        </Body1>

        {message && (
          <MessageBar intent={messageType} className={styles.messageBar}>
            {message}
          </MessageBar>
        )}

        {/* OAuth Authentication Section */}
        {!oauthToken ? (
          <Card style={{ marginBottom: '20px' }}>
            <CardHeader
              header={<Text weight="semibold">🔐 ServiceNow Authentication</Text>}
            />
            <div style={{ padding: '10px' }}>
              <Body1 style={{ marginBottom: '15px' }}>
                Please authenticate with ServiceNow to access incident data.
              </Body1>
              <Button
                appearance="primary"
                onClick={initiateOAuthFlow}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Authenticating...' : '🔐 Login to ServiceNow'}
              </Button>
            </div>
          </Card>
        ) : (
          <Card style={{ marginBottom: '20px' }}>
            <CardHeader
              header={<Text weight="semibold">✅ ServiceNow Authenticated</Text>}
            />
            <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Body1>You are authenticated with ServiceNow</Body1>
              <Button
                appearance="outline"
                onClick={handleLogout}
              >
                🚪 Logout
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader
            header={<Text weight="semibold">🔍 Search Major Incident</Text>}
          />
          <Field 
            label="Major Incident Number"
            hint="Format: INC followed by 7 digits (e.g., INC0008001)"
          >
            <Input
              placeholder="Enter incident number (e.g., INC0008001)"
              value={userInput.majorIncidentNumber}
              onChange={handleInputChange}
              maxLength={10}
            />
          </Field>
          
          <Button
            appearance="primary"
            icon={<Search20Regular />}
            onClick={handleSearch}
            disabled={!isValidIncidentNumber(userInput.majorIncidentNumber) || isLoading || !oauthToken}
            className={styles.searchButton}
          >
            {isLoading ? 'Searching...' : 'Search Incident'}
          </Button>
        </Card>

        {/* Display incident data if found */}
        {incidentData && (
          <Card style={{ marginTop: '20px' }}>
            <CardHeader
              header={<Text weight="semibold">📋 Incident Details</Text>}
            />
            <div style={{ padding: '10px' }}>
              <p><strong>Number:</strong> {incidentData.number}</p>
              <p><strong>Description:</strong> {incidentData.short_description}</p>
              <p><strong>State:</strong> {incidentData.state}</p>
              <p><strong>Priority:</strong> {incidentData.priority}</p>
              {incidentData.assigned_to && (
                <p><strong>Assigned To:</strong> {incidentData.assigned_to.display_value}</p>
              )}
              {incidentData.caller_id && (
                <p><strong>Caller:</strong> {incidentData.caller_id.display_value}</p>
              )}
              <p><strong>Opened:</strong> {incidentData.opened_at}</p>
              
              {/* Start TRT Call Button */}
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e5e5' }}>
                <Button
                  appearance="primary"
                  onClick={handleStartTRTCall}
                  disabled={isLoading}
                  style={{ 
                    backgroundColor: '#dc3545',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {isLoading ? 'Starting TRT Call...' : '🚨 Start TRT Call'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          <p>✅ Clean UI working</p>
          <p>✅ Input validation working</p>
          <p>✅ OAuth ServiceNow integration added</p>
          <p>✅ TRT Call functionality ready</p>
          <p>{isTeamsInitialized ? '✅ Teams integration active' : '⚠️ Standalone mode (not in Teams)'}</p>
          <p>{oauthToken ? '✅ ServiceNow OAuth authenticated' : '🔐 ServiceNow authentication required'}</p>
        </div>
      </div>
    </FluentProvider>
  );
};

export default App;
