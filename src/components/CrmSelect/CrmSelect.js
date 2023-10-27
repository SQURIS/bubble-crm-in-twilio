import React from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Manager, withTaskContext } from '@twilio/flex-ui';

import { Actions as CrmActions } from '../../states/CrmState';
import CrmUtil from '../../utils/CrmUtil';

import { Theme } from '@twilio-paste/core/theme';
import { Flex, Select, Option } from "@twilio-paste/core";

const manager = Manager.getInstance();

class CrmSelect extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      crms: [
	{
	  'name': 'Zelig Customer Care Copy',
	  'key': 'ZCC_C',
	},
	{
	  'name': 'Zelig Customer Care',
	  'key': 'ZCC',
	},
	{
	  'name': 'MotoBlouz',
	  'key': 'DEMO1',
	}
      ]
    }
    this.handleChange = this.handleChange.bind(this);
  }


  handleChange = async (e) => {
    console.log('Selected crm: ', e.target.value);
    let crmUrl = await CrmUtil.getCrmUrl(e.target.value);
    if (crmUrl) {
      this.props.setCrm(e.target.value);
    }
  }

  render() {
    return (
      <Theme.Provider theme="flex">
      {this.state.crms && this.state.crms.length > 1 ? (
	<Flex>
	<Select
	key="crm-picker"
	defaultValue={this.props.currentCrm}
	onChange={this.handleChange}
	>
	{this.state.crms.map((crm) => (
	  <Option key={crm.key} value={crm.key}>
	  {crm.name}
	  </Option>
	))}
	</Select>
	</Flex>
      ) : null}
      </Theme.Provider>
    )
  }
}
// Voir ici le pb de language !!!!!!!
const mapStateToProps = state => {
  return {
    currentCrm: state['select_crm']?.crm?.key || 'ZCC_C'
  };
}

const mapDispatchToProps = (dispatch) => ({
  setCrm: bindActionCreators(CrmActions.setCrm, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTaskContext(CrmSelect));
