import React from 'react';
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Title3,
  Body1,
  Button,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { CheckmarkCircle20Regular, DismissCircle20Regular } from '@fluentui/react-icons';
import { IncidentDetails } from '../types/serviceNow';

const useStyles = makeStyles({
  card: {
    marginBottom: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalM
  },
  confirmationButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM
  },
  incidentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
    minWidth: '120px'
  }
});

interface IncidentConfirmationProps {
  incident: IncidentDetails;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const IncidentConfirmation: React.FC<IncidentConfirmationProps> = ({
  incident,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const styles = useStyles();

  const getStateDisplayName = (state: string): string => {
    const stateMap: Record<string, string> = {
      '1': 'New',
      '2': 'In Progress',
      '3': 'On Hold',
      '6': 'Resolved',
      '7': 'Closed'
    };
    return stateMap[state] || state;
  };

  const getPriorityDisplayName = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      '1': 'Critical',
      '2': 'High',
      '3': 'Moderate',
      '4': 'Low',
      '5': 'Planning'
    };
    return priorityMap[priority] || priority;
  };

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Title3>Confirm Incident Details</Title3>}
        description={<Body1>Please verify this is the correct incident before triggering TRT call</Body1>}
      />
      
      <CardPreview>
        <div className={styles.incidentDetails}>
          <div className={styles.detailRow}>
            <Text className={styles.label}>Incident Number:</Text>
            <Text weight="semibold">{incident.number}</Text>
          </div>
          
          <div className={styles.detailRow}>
            <Text className={styles.label}>Short Description:</Text>
            <Text>{incident.short_description}</Text>
          </div>
          
          <div className={styles.detailRow}>
            <Text className={styles.label}>State:</Text>
            <Text>{getStateDisplayName(incident.state)}</Text>
          </div>
          
          <div className={styles.detailRow}>
            <Text className={styles.label}>Priority:</Text>
            <Text>{getPriorityDisplayName(incident.priority)}</Text>
          </div>
          
          {incident.assigned_to && (
            <div className={styles.detailRow}>
              <Text className={styles.label}>Assigned To:</Text>
              <Text>{incident.assigned_to}</Text>
            </div>
          )}
        </div>
      </CardPreview>
      
      <div className={styles.confirmationButtons}>
        <Button
          appearance="primary"
          icon={<CheckmarkCircle20Regular />}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Triggering TRT Call...' : 'Confirm & Trigger TRT Call'}
        </Button>
        
        <Button
          appearance="secondary"
          icon={<DismissCircle20Regular />}
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
};