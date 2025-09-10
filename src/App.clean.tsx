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

  const isValidIncidentNumber = (value: string): boolean => {
    return /^INC\d{7}$/.test(value);
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

    initializeTeams();
  }, []);

  // Simple ServiceNow API call function
  const searchServiceNow = async (incidentNumber: string) => {
    setIsLoading(true);
    setMessage('Searching ServiceNow...');
    setMessageType('info');
    setIncidentData(null);

    try {
      console.log('🔍 Starting ServiceNow search for:', incidentNumber);
      
      const apiUsername = 'actr1_user';
      const apiPassword = '->CW+?p-l$U]=}q7E#g.+1!i7m6i0(TV;XSfi(f!m6BTI}cR2-h(+Gz0}Aj<mwrOI:_F#3&hCW9@4dq;aU&A6-3FRe_:&GLswavQ';
      
      const url = `https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=number,short_description,state,priority,assigned_to,caller_id,opened_at`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${apiUsername}:${apiPassword}`),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
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

    // Call ServiceNow API
    await searchServiceNow(userInput.majorIncidentNumber);
  };

  // Add work notes to ServiceNow incident
  const addWorkNotesToIncident = async (incidentNumber: string, meetingInfo: string): Promise<boolean> => {
    try {
      console.log('📝 Adding work notes to incident:', incidentNumber);
      
      const apiUsername = 'actr1_user';
      const apiPassword = '->CW+?p-l$U]=}q7E#g.+1!i7m6i0(TV;XSfi(f!m6BTI}cR2-h(+Gz0}Aj<mwrOI:_F#3&hCW9@4dq;aU&A6-3FRe_:&GLswavQ';
      
      const workNote = `TRT Call initiated at ${new Date().toLocaleString()}\n${meetingInfo}\n\nTechnical Response Team has been activated for this incident.`;
      
      // Get incident sys_id first
      const searchUrl = `https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=sys_id`;
      
      console.log('🔍 Searching for incident sys_id...');
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${apiUsername}:${apiPassword}`),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
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
          const updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Basic ' + btoa(`${apiUsername}:${apiPassword}`),
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
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
            disabled={!isValidIncidentNumber(userInput.majorIncidentNumber) || isLoading}
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
          <p>✅ ServiceNow API integration added</p>
          <p>✅ TRT Call functionality ready</p>
          <p>{isTeamsInitialized ? '✅ Teams integration active' : '⚠️ Standalone mode (not in Teams)'}</p>
        </div>
      </div>
    </FluentProvider>
  );
};

export default App;
