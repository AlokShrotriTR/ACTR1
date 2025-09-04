import React from 'react';
import * as microsoftTeams from '@microsoft/teams-js';
import {
  FluentProvider,
  webLightTheme,
  Button,
  Text,
  Title1,
  Body1,
} from '@fluentui/react-components';

export const Config: React.FC = () => {
  const handleSaveConfig = async () => {
    try {
      await microsoftTeams.pages.config.setConfig({
        entityId: 'userInputTab',
        contentUrl: 'https://localhost:3000',
        suggestedDisplayName: 'User Input',
        websiteUrl: 'https://localhost:3000',
      });
      
      await microsoftTeams.pages.config.setValidityState(true);
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  React.useEffect(() => {
    const initializeConfig = async () => {
      try {
        await microsoftTeams.app.initialize();
        
        // Register the save handler
        microsoftTeams.pages.config.registerOnSaveHandler((saveEvent) => {
          handleSaveConfig();
          saveEvent.notifySuccess();
        });
        
        // Set initial validity state
        await microsoftTeams.pages.config.setValidityState(true);
      } catch (error) {
        console.error('Error initializing Teams config:', error);
      }
    };

    initializeConfig();
  }, []);

  return (
    <FluentProvider theme={webLightTheme}>
      <div style={{ padding: '20px' }}>
        <Title1>Configure User Input Tab</Title1>
        <Body1>
          This will add a User Input tab to your team or channel where members can submit feedback, requests, and other information.
        </Body1>
        
        <div style={{ marginTop: '20px' }}>
          <Text>Click "Save" to add this tab to your team.</Text>
        </div>
      </div>
    </FluentProvider>
  );
};
