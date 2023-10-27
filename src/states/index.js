import { combineReducers } from 'redux';
import { reduce as CrmReducer } from './CrmState';

// Register your redux store under a unique namespace
export const namespace = 'select_crm';

// Combine the reducers
export default combineReducers({
  crm: CrmReducer
});
