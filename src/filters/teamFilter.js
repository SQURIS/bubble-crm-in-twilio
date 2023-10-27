import React from 'react';
import { FiltersListItemType } from "@twilio/flex-ui";


const teams = [
  'Team Welcome',
  'Team Relation', 
  'Team Incident',
  'Team Admin'
];

export const teamFilter = (appState) => {
  // const managerTeam = appState.flex.worker.attributes.manager;
  const teamName = appState.flex.worker.attributes.team_name;
  // console.log ("managerTeam ",managerTeam);
  console.log ("teamName ",teamName);
  return {
    id: 'data.attributes.team_name',
    title: 'Teams',
    fieldName: 'teams',
    type: FiltersListItemType.multiValue,
    options: teams.map(value => ({
      value: value,
      label: value,
      default:(value == teamName)?true:false
    })),
    condition: 'IN'
  }
};
