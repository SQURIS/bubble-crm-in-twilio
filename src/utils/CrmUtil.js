import { Manager } from '@twilio/flex-ui';
const manager = Manager.getInstance();

class CrmUtil {
  getCrmUrl = (crm) => {
	  let crmUrl = `${process.env.CRM_BUBBLE_APP_URI_ZCC_COPY}`;
    console.debug(' Getting Url for CRM:', crm);
      switch (crm) {
	case 'ZCC':
	  // Make a call to data.number
	  crmUrl = `${process.env.CRM_BUBBLE_APP_URI_ZCC}`;
	  console.log('CRM Url ZCC:', crmUrl);
	  break;
	case 'ZCC_C':
	  // Make a call to data.number
	  crmUrl = `${process.env.CRM_BUBBLE_APP_URI_ZCC_COPY}`;
	  console.log('CRM Url ZCC_COPY:', crmUrl);
	  break;
	case 'DEMO1':
	  crmUrl = `${process.env.CRM_BUBBLE_APP_URI_DEMO1}`;
	  console.log('CRM Url Demo 1 :', crmUrl);
	  break;
	default:
	  console.log('CRM Url Default: ', crmUrl);
      }
  
    return crmUrl;
  }
}

const crmUtil = new CrmUtil();

export default crmUtil;
