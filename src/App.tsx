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
  Divider,
  MessageBar,
  Spinner,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Search20Regular, ErrorCircle20Regular } from '@fluentui/react-icons';
import { IncidentConfirmation } from './components/IncidentConfirmation';
import { serviceNowService } from './services/serviceNowService';
import { IncidentDetails } from './types/serviceNow';

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

const useStyles = makeStyles({
  appContainer: {
    padding: tokens.spacingVerticalL,
    maxWidth: '800px',
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
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM
  }
});

export const App: React.FC = () => {
  const styles = useStyles();
  
  const [userInput, setUserInput] = useState<UserInput>({
    majorIncidentNumber: ''
  });
  
  const [teamsContext, setTeamsContext] = useState<TeamsContext>({});
  const [isTeamsInitialized, setIsTeamsInitialized] = useState(false);
  const [incident, setIncident] = useState<IncidentDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTriggeringTRT, setIsTriggeringTRT] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Validation function for incident number format
  const isValidIncidentNumber = (incidentNumber: string): boolean => {
    const regex = /^INC\d{7}$/;
    return regex.test(incidentNumber);
  };

  // Debug function to test ServiceNow API
  const testServiceNowAPI = async () => {
    setDebugInfo('🔄 Testing ServiceNow API...\n');
    setError(null);
    
    try {
      // Test 1: Custom API
      setDebugInfo(prev => prev + '1️⃣ Testing Custom API endpoint...\n');
      try {
        const customResult = await serviceNowService.getIncidentByNumber('INC0008001');
        setDebugInfo(prev => prev + '✅ Custom API SUCCESS!\n' + JSON.stringify(customResult, null, 2) + '\n\n');
      } catch (customError: any) {
        setDebugInfo(prev => prev + '❌ Custom API FAILED: ' + customError.message + '\n\n');
      }
      
      // Test 2: Standard API
      setDebugInfo(prev => prev + '2️⃣ Testing Standard API endpoint...\n');
      try {
        const response = await fetch('https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=INC0008001&sysparm_fields=number,short_description,state', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('admin:x{?Gktp(@n>932KeG)w{0Ix{eJnEFW{_cN)*[-Fvd)3>y&vu^14Ljp4E_Y@uI=+b}'),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          setDebugInfo(prev => prev + '✅ Standard API SUCCESS!\n' + JSON.stringify(data, null, 2) + '\n\n');
        } else {
          const errorText = await response.text();
          setDebugInfo(prev => prev + `❌ Standard API FAILED: ${response.status} ${response.statusText}\n${errorText}\n\n`);
        }
      } catch (standardError: any) {
        setDebugInfo(prev => prev + '❌ Standard API NETWORK ERROR: ' + standardError.message + '\n\n');
      }
      
    } catch (error: any) {
      setDebugInfo(prev => prev + '🚫 Debug test failed: ' + error.message + '\n');
    }
  };

  useEffect(() => {
    // Initialize Microsoft Teams SDK
    const initializeTeams = async () => {
      try {
        await microsoftTeams.app.initialize();
        setIsTeamsInitialized(true);
        
        // Get Teams context
        const context = await microsoftTeams.app.getContext();
        setTeamsContext({
          userDisplayName: context.user?.displayName,
          userPrincipalName: context.user?.userPrincipalName,
          teamName: context.team?.displayName,
          channelName: context.channel?.displayName,
          locale: context.app.locale
        });
      } catch (error) {
        console.warn('Teams SDK initialization failed - running in standalone mode');
        setIsTeamsInitialized(false);
      }
    };

    initializeTeams();
  }, []);

  const handleInputChange = (value: string) => {
    // Auto-format input to include INC prefix and limit to 7 digits
    let formattedValue = value.toUpperCase();
    
    if (!formattedValue.startsWith('INC')) {
      if (/^\d/.test(formattedValue)) {
        formattedValue = 'INC' + formattedValue.replace(/\D/g, '');
      } else {
        formattedValue = 'INC';
      }
    } else {
      const digits = formattedValue.substring(3).replace(/\D/g, '');
      formattedValue = 'INC' + digits;
    }
    
    // Limit to 10 characters total (INC + 7 digits)
    if (formattedValue.length > 10) {
      formattedValue = formattedValue.substring(0, 10);
    }
    
    setUserInput({ majorIncidentNumber: formattedValue });
    
    // Clear previous results when input changes
    setIncident(null);
    setError(null);
    setSuccess(null);
  };

  const searchIncident = async () => {
    if (!isValidIncidentNumber(userInput.majorIncidentNumber)) {
      setError('Please enter a valid incident number in format INC1234567');
      return;
    }

    console.log('Starting search for incident:', userInput.majorIncidentNumber);
    setIsSearching(true);
    setError(null);
    setIncident(null);

    try {
      // Use real ServiceNow service for production testing
      const incidentDetails = await serviceNowService.getIncidentByNumber(userInput.majorIncidentNumber);
      
      console.log('ServiceNow response:', incidentDetails);
      
      if (incidentDetails) {
        setIncident(incidentDetails);
        console.log('Incident state set successfully, should display confirmation UI');
      } else {
        setError(`No incident found with number: ${userInput.majorIncidentNumber}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search incident';
      setError(errorMessage);
      
      // Teams error notification
      if (isTeamsInitialized) {
        try {
          console.warn('Teams error notification - API call failed');
        } catch (teamsError) {
          console.warn('Teams error notification failed:', teamsError);
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmIncident = async () => {
    if (!incident) return;

    setIsTriggeringTRT(true);
    setError(null);

    try {
      // Use real ServiceNow service for TRT call trigger
      const success = await serviceNowService.triggerTRTCall(incident.number);
      
      if (success) {
        setSuccess(`TRT call successfully triggered for incident ${incident.number}. Emergency response team has been notified.`);
        
        // Reset form
        setUserInput({ majorIncidentNumber: '' });
        setIncident(null);
      } else {
        setError('Failed to trigger TRT call. Please try again or contact support.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to trigger TRT call';
      setError(errorMessage);
    } finally {
      setIsTriggeringTRT(false);
    }
  };

  const handleCancelConfirmation = () => {
    setIncident(null);
    setError(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.appContainer}>
        <Title1>Automated TRT Call for Major Incidents</Title1>
        <Body1>Submit major incident numbers for ServiceNow integration and TRT call triggering.</Body1>
        <Body1>Enter incident numbers in the format INC followed by 7 digits.</Body1>
        
        {/* Production Mode Notice */}
        <MessageBar intent="info" className={styles.messageBar}>
          <div>
            <Body1><strong>Production Mode:</strong> Connected to ServiceNow instance {process.env.REACT_APP_SERVICENOW_INSTANCE}</Body1>
            <Body1>Enter any valid incident number from your ServiceNow instance to test real integration.</Body1>
          </div>
        </MessageBar>
        
        {/* Error/Success Messages */}
        {error && (
          <MessageBar
            intent="error"
            className={styles.messageBar}
          >
            <ErrorCircle20Regular />
            {error}
          </MessageBar>
        )}
        
        {success && (
          <MessageBar
            intent="success"
            className={styles.messageBar}
          >
            {success}
          </MessageBar>
        )}

        {debugInfo && (
          <Card style={{ marginBottom: '20px' }}>
            <CardHeader header={<Body1>🔧 Debug Information</Body1>} />
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '12px', 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {debugInfo}
            </pre>
          </Card>
        )}

        {/* Teams Context Information */}
        {isTeamsInitialized && (
          <Card>
            <CardHeader
              header={<Body1>Teams Context</Body1>}
              description={
                <div>
                  <Body1>User: {teamsContext.userDisplayName || 'Unknown'}</Body1>
                  {teamsContext.teamName && <Body1>Team: {teamsContext.teamName}</Body1>}
                </div>
              }
            />
          </Card>
        )}

        <Divider />

        {/* Input Section */}
        <Card className={styles.inputSection}>
          <CardHeader
            header={<Title1>Major Incident Search</Title1>}
            description={<Body1>Enter incident number to retrieve details from ServiceNow</Body1>}
          />
          
          <Field label="Major Incident Number">
            <Input
              placeholder="INC1234567"
              value={userInput.majorIncidentNumber}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={isSearching}
              maxLength={10}
            />
          </Field>
          
          <Button
            appearance="primary"
            icon={<Search20Regular />}
            onClick={searchIncident}
            disabled={!isValidIncidentNumber(userInput.majorIncidentNumber) || isSearching}
            className={styles.searchButton}
          >
            Search Incident
          </Button>

          <Button
            appearance="secondary"
            onClick={testServiceNowAPI}
            disabled={isSearching}
            style={{ marginLeft: '10px' }}
          >
            🔧 Debug API
          </Button>
          
          {isSearching && (
            <div className={styles.loadingContainer}>
              <Spinner size="small" />
              <Body1>Searching ServiceNow...</Body1>
            </div>
          )}
        </Card>

        {/* Incident Confirmation */}
        {incident && (
          <IncidentConfirmation
            incident={incident}
            onConfirm={handleConfirmIncident}
            onCancel={handleCancelConfirmation}
            isLoading={isTriggeringTRT}
          />
        )}
      </div>
    </FluentProvider>
  );
};
