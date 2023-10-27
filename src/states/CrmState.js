const ACTION_SET_CRM = 'SET_CRM';

const initialState = {};

export class Actions {
  static setCrm = (crm) => ({ type: ACTION_SET_CRM, crm });
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_SET_CRM: {
      return {id: action.crm};
    }
    default:
      return state;
  }
};
