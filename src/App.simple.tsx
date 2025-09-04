import React, { useState, useEffect } from 'react';
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
} from '@fluentui/react-components';

interface UserInput {
  majorIncidentNumber: string;
}

export const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    majorIncidentNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation function for incident number format
  const isValidIncidentNumber = (incidentNumber: string): boolean => {
    const regex = /^INC\d{7}$/;
    return regex.test(incidentNumber);
  };

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
    setError(null);
  };

  const searchIncident = async () => {
    if (!isValidIncidentNumber(userInput.majorIncidentNumber)) {
      setError('Please enter a valid incident number in format INC1234567');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Searching for incident: ${userInput.majorIncidentNumber}`);
    } catch (error) {
      setError('Failed to search incident');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Title1>ACTR1 Major Incident Reporting</Title1>
        <Body1>Submit major incident numbers for ServiceNow integration and TRT call triggering.</Body1>
        <Body1>Enter incident numbers in the format INC followed by 7 digits.</Body1>
        
        <Divider />

        {error && (
          <div style={{ 
            color: 'red', 
            padding: '10px', 
            marginBottom: '10px',
            border: '1px solid red',
            borderRadius: '4px',
            backgroundColor: '#ffeaea'
          }}>
            ❌ {error}
          </div>
        )}

        <Card style={{ marginTop: '20px' }}>
          <CardHeader
            header={<Title1>Major Incident Search</Title1>}
            description={<Body1>Enter incident number to retrieve details from ServiceNow</Body1>}
          />
          
          <Field label="Major Incident Number">
            <Input
              placeholder="INC1234567"
              value={userInput.majorIncidentNumber}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={isLoading}
              maxLength={10}
            />
          </Field>
          
          <Button
            appearance="primary"
            onClick={searchIncident}
            disabled={!isValidIncidentNumber(userInput.majorIncidentNumber) || isLoading}
            style={{ marginTop: '10px' }}
          >
            {isLoading ? 'Searching...' : 'Search Incident'}
          </Button>
        </Card>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>✅ GitHub Pages deployment working</p>
          <p>✅ React and Fluent UI loaded successfully</p>
          <p>⏳ ServiceNow integration ready (simplified version)</p>
        </div>
      </div>
    </FluentProvider>
  );
};
