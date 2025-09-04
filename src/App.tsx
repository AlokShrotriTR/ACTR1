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
  Subtitle2,
  Body1,
  Divider,
} from '@fluentui/react-components';

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

export const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    majorIncidentNumber: ''
  });
  
  const [teamsContext, setTeamsContext] = useState<TeamsContext>({});
  const [isTeamsInitialized, setIsTeamsInitialized] = useState(false);
  const [submittedData, setSubmittedData] = useState<UserInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation function for incident number format
  const isValidIncidentNumber = (incidentNumber: string): boolean => {
    const regex = /^INC\d{7}$/;
    return regex.test(incidentNumber);
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
          locale: context.app.locale,
        });
        
        // Teams context retrieved but no pre-filling needed for incident number
        console.log('Teams context loaded:', {
          userDisplayName: context.user?.displayName,
          teamName: context.team?.displayName,
          channelName: context.channel?.displayName
        });
        
      } catch (error) {
        console.log('Teams initialization failed, running in standalone mode:', error);
        setIsTeamsInitialized(false);
      }
    };

    initializeTeams();
  }, []);

  const handleInputChange = (field: keyof UserInput, value: string) => {
    setUserInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the submitted data
      setSubmittedData(userInput);
      
      // Show notification in Teams if available
      if (isTeamsInitialized) {
        try {
          await microsoftTeams.app.notifySuccess();
        } catch (error) {
          console.log('Failed to show Teams notification:', error);
        }
      }
      
      // Reset form
      setUserInput({
        majorIncidentNumber: ''
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (isTeamsInitialized) {
        try {
          await microsoftTeams.app.notifyFailure({
            reason: microsoftTeams.app.FailedReason.Other,
            message: 'Error submitting form'
          });
        } catch (notificationError) {
          console.log('Failed to show Teams notification:', notificationError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearResponse = () => {
    setSubmittedData(null);
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="app-container">
        <Title1>Automated TRT Call for Major Incidents</Title1>
        <div style={{ marginBottom: '20px' }}>
          <Body1>Submit major incident numbers for processing and tracking.</Body1>
          <Body1>Enter incident numbers in the format INC followed by 7 digits.</Body1>
        </div>
        
        {/* Teams Context Information */}
        <Card className="teams-context">
          <CardHeader>
            <Subtitle2>Teams Context</Subtitle2>
          </CardHeader>
          <div>
            <Text>
              <strong>Status:</strong> {isTeamsInitialized ? '✅ Connected to Teams' : '❌ Standalone Mode'}
            </Text>
            {isTeamsInitialized && (
              <>
                {teamsContext.userDisplayName && (
                  <div><Text><strong>User:</strong> {teamsContext.userDisplayName}</Text></div>
                )}
                {teamsContext.teamName && (
                  <div><Text><strong>Team:</strong> {teamsContext.teamName}</Text></div>
                )}
                {teamsContext.channelName && (
                  <div><Text><strong>Channel:</strong> {teamsContext.channelName}</Text></div>
                )}
              </>
            )}
          </div>
        </Card>

        <Divider />

        {/* User Input Form */}
        <Card className="form-container">
          <CardHeader>
            <Subtitle2>Major Incident Input Form</Subtitle2>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <Field label="Major Incident Number" required>
              <Input
                value={userInput.majorIncidentNumber}
                onChange={(e, data) => {
                  // Format the input to ensure INC prefix and numeric format
                  let value = data.value.toUpperCase();
                  
                  // If user types without INC prefix, add it
                  if (value && !value.startsWith('INC')) {
                    // Remove any non-numeric characters and add INC prefix
                    const numericPart = value.replace(/[^0-9]/g, '');
                    value = numericPart ? `INC${numericPart}` : 'INC';
                  } else if (value.startsWith('INC')) {
                    // Ensure only numeric characters after INC
                    const numericPart = value.slice(3).replace(/[^0-9]/g, '');
                    value = `INC${numericPart}`;
                  }
                  
                  // Limit to INC + 7 digits maximum
                  if (value.length > 10) {
                    value = value.slice(0, 10);
                  }
                  
                  handleInputChange('majorIncidentNumber', value);
                }}
                placeholder="INC1234567"
                pattern="INC[0-9]{7}"
                title="Format: INC followed by 7 digits (e.g., INC1234567)"
              />
            </Field>

            <div style={{ marginTop: '20px' }}>
              <Button
                type="submit"
                appearance="primary"
                disabled={isLoading || !isValidIncidentNumber(userInput.majorIncidentNumber)}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Response Section */}
        {submittedData && (
          <Card className="response-section">
            <CardHeader>
              <Subtitle2>✅ Major Incident Submitted Successfully</Subtitle2>
            </CardHeader>
            <div>
              <Text><strong>Major Incident Number:</strong> {submittedData.majorIncidentNumber}</Text><br />
              <Text style={{ color: '#107c10', marginTop: '10px' }}>
                Your major incident has been recorded and will be processed by the support team.
              </Text>
              
              <div style={{ marginTop: '15px' }}>
                <Button onClick={clearResponse} appearance="secondary">
                  Submit Another Incident
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </FluentProvider>
  );
};
