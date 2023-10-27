import React from 'react';
import { FiltersListItemType, Manager } from "@twilio/flex-ui";

const skillsArray = Manager.getInstance().serviceConfiguration.taskrouter_skills?.map(skill => ({
  value: skill.name,
  label: skill.name,
  default: false
}))

/* 
  This filter is based on the skills model thats proposed by Flex

  Its entirely possible a different skills model could be adopted
  in which case this filter would need modified appropriately.

  The filter does an OR'd match on any of the selected skills.
  In other words, if an agent has any of the selected skills
  they will be returned in the search results.
  */

export const skillFilter = () => ({
  id: 'data.attributes.routing.skills',
  title: 'Skills',
  fieldName: 'skills',
  type: FiltersListItemType.multiValue,
  options: skillsArray? skillsArray : [],
  condition: 'IN'
});
