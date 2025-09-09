import React, { useState } from 'react';
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
  
  const [userInput, setUserInput] = useState<UserInput>({
    majorIncidentNumber: ''
  });
  
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [incidentData, setIncidentData] = useState<any>(null);
  const [showCredentialTest, setShowCredentialTest] = useState(false);
  const [testCredentials, setTestCredentials] = useState({ username: '', password: '' });

  // Validation function for incident number format
  const isValidIncidentNumber = (incidentNumber: string): boolean => {
    const regex = /^INC\d{7}$/;
    return regex.test(incidentNumber);
  };

  // Simple ServiceNow API call function
  const searchServiceNow = async (incidentNumber: string) => {
    setIsLoading(true);
    setMessage('Searching ServiceNow...');
    setMessageType('info');
    setIncidentData(null);

    try {
      console.log('🔍 Starting ServiceNow search for:', incidentNumber);
      
      // Use your tested API credentials
      const apiUsername = testCredentials.username || 'actr1_user'; // Replace with your actual username
      const apiPassword = testCredentials.password || '->CW+?p-l$U]=}q7E#g.+1!i7m6i0(TV;XSfi(f!m6BTI}cR2-h(+Gz0}Aj<mwrOI:_F#3&hCW9@4dq;aU&A6-3FRe_:&GLswavQ'; // Replace with your actual password
      
      const url = `https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=${incidentNumber}&sysparm_fields=number,short_description,state,priority,assigned_to,caller_id,opened_at`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${apiUsername}:${apiPassword}`),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      console.log('📡 API Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response Data:', data);
        
        if (data.result && data.result.length > 0) {
          const incident = data.result[0];
          setIncidentData(incident);
          setMessage(`✅ Found incident: ${incident.number} - ${incident.short_description}`);
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

  // Test different credentials function
  const testApiCredentials = async () => {
    if (!testCredentials.username || !testCredentials.password) {
      setMessage('Please enter both username and password to test');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('Testing API credentials...');
    setMessageType('info');

    try {
      console.log('🔐 Testing credentials for user:', testCredentials.username);
      
      const url = 'https://dev279775.service-now.com/api/now/table/incident?sysparm_limit=1&sysparm_fields=number,short_description';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${testCredentials.username}:${testCredentials.password}`),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      console.log('📡 Credential Test Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Credential Test Success:', data);
        setMessage(`✅ Credentials work! Found ${data.result?.length || 0} incidents. Ready to use these credentials.`);
        setMessageType('success');
      } else {
        const errorText = await response.text();
        console.error('❌ Credential Test Failed:', response.status, errorText);
        
        if (response.status === 401) {
          setMessage('❌ Authentication failed - Check username/password');
        } else if (response.status === 403) {
          setMessage('❌ Access denied - User needs proper roles/permissions');
        } else {
          setMessage(`❌ API Error: ${response.status} - ${errorText}`);
        }
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('🚫 Credential Test Network Error:', error);
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

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.appContainer}>
        <Title1>ACTR1 - Incident Search</Title1>
        <Body1 style={{ marginBottom: tokens.spacingVerticalL }}>
          Enter a major incident number to search ServiceNow
        </Body1>

        {message && (
          <MessageBar
            intent={messageType}
            className={styles.messageBar}
          >
            {message}
          </MessageBar>
        )}

        <Card className={styles.inputSection}>
          <CardHeader
            header={<Text weight="semibold">Major Incident Information</Text>}
          />
          
          <Field
            label="Major Incident Number"
            hint="Format: INC0000000 (e.g., INC0008001)"
            validationMessage={
              userInput.majorIncidentNumber && !isValidIncidentNumber(userInput.majorIncidentNumber)
                ? "Invalid format. Use INC followed by 7 digits."
                : undefined
            }
            validationState={
              userInput.majorIncidentNumber && !isValidIncidentNumber(userInput.majorIncidentNumber)
                ? "error"
                : "none"
            }
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

        {/* Credential Testing Section */}
        <Card style={{ marginTop: '20px' }}>
          <CardHeader
            header={<Text weight="semibold">🔐 Test API Credentials</Text>}
          />
          <div style={{ padding: '10px' }}>
            <Button 
              appearance="secondary" 
              onClick={() => setShowCredentialTest(!showCredentialTest)}
              style={{ marginBottom: '10px' }}
            >
              {showCredentialTest ? 'Hide' : 'Show'} Credential Tester
            </Button>
            
            {showCredentialTest && (
              <div>
                <Field label="Username">
                  <Input
                    placeholder="actr1_api_user"
                    value={testCredentials.username}
                    onChange={(e) => setTestCredentials({...testCredentials, username: e.target.value})}
                    disabled={isLoading}
                  />
                </Field>
                <Field label="Password" style={{ marginTop: '10px' }}>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials({...testCredentials, password: e.target.value})}
                    disabled={isLoading}
                  />
                </Field>
                <Button
                  appearance="secondary"
                  onClick={testApiCredentials}
                  disabled={isLoading || !testCredentials.username || !testCredentials.password}
                  style={{ marginTop: '10px' }}
                >
                  {isLoading ? 'Testing...' : 'Test Credentials'}
                </Button>
              </div>
            )}
          </div>
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
            </div>
          </Card>
        )}

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          <p>✅ Clean UI working</p>
          <p>✅ Input validation working</p>
          <p>✅ ServiceNow API integration added</p>
          <p>💡 First test your API credentials, then search incidents</p>
          <p>🔧 Test with incident number: INC0008001</p>
        </div>
      </div>
    </FluentProvider>
  );
};
