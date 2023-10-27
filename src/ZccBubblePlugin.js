import React from 'react';
import { FlexPlugin } from '@twilio/flex-plugin';
import { TeamsView } from '@twilio/flex-ui';
import { VERSION } from '@twilio/flex-ui';
import reducers, { namespace } from './states';
import CrmSelect from './components/CrmSelect/CrmSelect';
import { FiltersListItemType } from "@twilio/flex-ui";
import { Actions } from "@twilio/flex-ui";
import { Actions as CrmActions } from './states/CrmState';
import CrmUtil from './utils/CrmUtil';
import { CustomizationProvider } from '@twilio-paste/core/customization'
import { 
  ParkButton 
} from './components'
import {
  teamFilter,
  skillFilter
} from './filters';
import './actions';
import {
  sendMessageToIframe,
  reloadIframe
} from './helpers';


const PLUGIN_NAME = 'ZccBubblePlugin';




export default class ZccBubblePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }



  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   */
  async init(flex, manager) {
    console.log('URI : ', process.env.CRM_BUBBLE_APP_URI);
    console.log('Manager : ', manager);

    this.registerReducers(manager);
    /**
     *
     * To add a CRM app selector
     *
     */

    flex.MainHeader.Content.add(
      <CrmSelect key="select-crm" />,
      { sortOrder: 1, align: 'end' }
    );


    //manager.store.dispatch(CrmActions.setCrm(myCrm));
    /**
     * To Customize Flex Theme
     */
    flex.setProviders({
      PasteThemeProvider: CustomizationProvider
    })

    /**
     * Change the layout 
     */
    flex.AgentDesktopView.defaultProps.splitterOptions = {
      initialFirstPanelSize: "20%",
      minimumFirstPanelSize: "20%"
    };

    flex.TaskCanvasHeader.Content.add(
      <ParkButton key='conversation-park-button' />,
      {
	sortOrder: 1,
	if: props =>
	props.channelDefinition.capabilities.has('Chat') &&
	props.task.taskStatus === 'assigned'
      }
    )

    /**
     * Change the default view with agent-desktop 
     */
    Actions.invokeAction("NavigateToView", { viewName: "agent-desktop" });


    /**
     * Hide dialpad Button even Outbound Call is active
     */

    flex.MainHeader.Content.remove("dialpad-button");

    /**
     * Add Team View Filter by team
     */

    flex.TeamsView.defaultProps.filters = [
      flex.TeamsView.activitiesFilter,
      teamFilter,
      skillFilter
    ];

    /**
     * Set the uri of CRM app
     **/

    /**
     *
     flex.CRMContainer.defaultProps.uri = process.env.CRM_BUBBLE_APP_URI;
     *
     */
    const unsubscribe = manager.store.subscribe(() => {
      const newState = manager.store.getState();
      console.log('State has changed:', newState.select_crm, flex.CRMContainer.defaultProps.uri);
      let crmUrl =  CrmUtil.getCrmUrl(newState.select_crm.crm.id);
      console.log ("crm URL ----> ", crmUrl,flex.CRMContainer.defaultProps.uri);
      if (crmUrl != flex.CRMContainer.defaultProps.uri) {
	flex.CRMContainer.defaultProps.uri = crmUrl;
	reloadIframe(crmUrl);
	/**flex.CRMContainer.defaultProps.uriCallback = (task) => {
	    return crmUrl;
	}  **/
      }
    });


    /**
     * Ring Tone for incoming call
     **/
    let alertSound = new Audio(process.env.TWILIO_FUNCTION_DOMAIN_URI+'/ringtone_incoming_call.mp3');
    alertSound.loop = true;
    let whatsAppSound = new Audio(process.env.TWILIO_FUNCTION_DOMAIN_URI+'/ringtone_incoming_whatsapp.mp3');
    whatsAppSound.loop = false;
    let smsSound = new Audio(process.env.TWILIO_FUNCTION_DOMAIN_URI+'/ringtone_incoming_sms.mp3');
    smsSound.loop = false;
    let messengerSound = new Audio(process.env.TWILIO_FUNCTION_DOMAIN_URI+'/ringtone_incoming_messenger.mp3');
    messengerSound.loop = false;

    const resStatus = ["accepted","canceled","rejected","rescinded","timeout"];

    manager.workerClient.on("reservationCreated", function(reservation) {
      console.log ("reservation :", reservation);
      if (
	reservation.task.taskChannelUniqueName === "voice" &&
	reservation.task.attributes.direction === "inbound"
      ) {
	alertSound.muted = false;
	alertSound.volume = 0.5;
	alertSound.play();
      }
      if (
	reservation.task.taskChannelUniqueName === "sms" &&
	reservation.task.attributes.channelType === "sms" &&
	reservation.task.attributes.direction === "inbound"
      ) {
	console.log ("sms sound :");
	smsSound.muted = false;
	smsSound.volume = 0.8;
	smsSound.play();
      }
      if (
	reservation.task.taskChannelUniqueName === "sms" &&
	reservation.task.attributes.channelType === "whatsapp" &&
	reservation.task.attributes.direction === "inbound"
      ) {
	console.log ("whatsapp sound :");
	whatsAppSound.muted = false;
	whatsAppSound.volume = 0.8;
	whatsAppSound.play();
      }
      if (
	reservation.task.taskChannelUniqueName === "chat" &&
	reservation.task.attributes.channelType === "messenger" &&
	reservation.task.attributes.direction === "inbound"
      ) {
	console.log ("messenger sound :");
	messengerSound.muted = false;
	messengerSound.volume = 0.8;
	messengerSound.play();
      }
      resStatus.forEach((e) => {
	reservation.on(e, () => {
	  alertSound.volume = 0.5;
	  alertSound.pause();
	  alertSound.muted = true;
	});
      });
    });

    /**
     * Notification en cas de deconnectionn de l'application Bubble Zelig Customer Care pour prévenir de la relance de l'appli Allin
     **/

    flex.Notifications.registerNotification({
      id: "relaunchNotification",
      closeButton: false,
      content: "Vous êtes déconnecté de l'application Zelig Customer Care.  L'application va se relancer.",
      timeout: 0,
      type: flex.NotificationType.warning,
      actions: [
	<flex.NotificationBar.Action
	onClick={(_, notification) => {
	  flex.Notifications.dismissNotification(notification);
	}}
	label="Relaunch"
	icon="Bell"
	/>
      ],
      options: {
	browser: {
	  title: "Relance de l'application Zelig Customer Care",
	  body: "Vous êtes déconnecté de Allin. L'application va se relancer."
	}
      }
    });

    /*
     * Set Task Wrap-up Timeout
     */
    let wrapupTimeout = 45000; 

    manager.workerClient.on('reservationCreated', (reservation) => {
      const trueReservation = reservation.addListener
	? reservation
	: reservation.source;
      console.log("wrapup timeout from task attributes -->", reservation.task);
      if (((typeof reservation.task.attributes.context) !== 'undefined') && ((typeof reservation.task.attributes.context.wrapupTimeout) !== 'undefined') && (reservation.task.attributes.context.wrapupTimeout !== null))  {
	console.log("wrapup timeout from task attributes", reservation.task.attributes.context.wrapupTimeout);
	wrapupTimeout =  reservation.task.attributes.context.wrapupTimeout;
      }

      console.log('final wrapup timeout :', wrapupTimeout);
      trueReservation.on('wrapup', (reservation) => {
	setTimeout(() => {
	  //alert("End Media Capture - WrapupTask");
	  console.log('befre invokeaction CompleteTask - rservation', reservation);
	  flex.Actions.invokeAction('CompleteTask', {
	    sid: reservation.sid,
	  });
	}, wrapupTimeout);
      }); 
    });


    /**
     *  Feature to call a phone number and create a conference with current worker
     */

    /** TODO JMV
     * Manage Call if Worker is offline
     * */

    flex.Actions.replaceAction("StartOutboundCall", (payload, original) => {
      var newPayload = payload;
      console.log('worker phone : ', manager.workerClient);

      newPayload.callerId = manager.workerClient.attributes.phone_number;
      //newPayload.callerId = manager.workerClient.sid;
      console.log('Payload outboudcall', newPayload);
      original(newPayload);
    });

    //Define a function for what to do when a message from postMessage() comes in
    function receiveMessage(event) {
      console.log("Receive message in flex : ", JSON.stringify(event.data.action));
      switch (event.data.action) {
	case 'call':
	  // Make a call to data.number
	  console.log('Action call', event.data);
	  flex.Actions.invokeAction("StartOutboundCall", {destination: JSON.stringify(event.data.clientNumber)});
	  break;
	case 'sms':
	  // Start a conversation and send a sms
	  console.log('Action sms', event.data);
	  flex.Actions.invokeAction('SendAgentOutboundSms', {
	    clientName : event.data.clientName ,
	    clientNumber : event.data.clientNumber, 
	    agentNumber : event.data.agentNumber,
	  });
	  break;
	case 'whatsapp':
	  // Start a conversation and send a whatsapp message
	  console.log('Action whatsapp', event.data);
	  flex.Actions.invokeAction('SendAgentOutboundWhatsapp', {
	    clientName : event.data.clientName ,
	    clientNumber : event.data.clientNumber, 
	    agentNumber : event.data.agentNumber,
	  });
	  break;
	case 'messenger':
	  // Start a conversation and send a whatsapp message
	  console.log('Action messenger', event.data);
	  flex.Actions.invokeAction('SendAgentOutboundMessenger', {
	    clientName : event.data.clientName ,
	    clientMessengerId : event.data.clientMessengerId, 
	    agentMessengerId : event.data.agentMessengerId,
	  });
	  break;
	case 'unpark':
	  // unpark a conversation 
	  console.log('Action Unpark', event.data);
	  flex.Actions.invokeAction('UnparkAnInteraction', {
	    conversationSid : event.data.conversationSid
	  });
	  break;
	case 'relaunch':
	  // Bubble app user is logout -> relaunch Bubble login process
	  const newState = manager.store.getState();
	  console.log('Action relaunch CRM Bubble App', event.data);
	  flex.Notifications.showNotification("relaunchNotification");
	  let crmUrl =  CrmUtil.getCrmUrl(newState.select_crm.crm.id);
	  if (crmUrl != flex.CRMContainer.defaultProps.uri) {
	    flex.CRMContainer.defaultProps.uri = crmUrl;
	    //	reloadIframe(crmUrl);
	  }
	  break;
	default:
	  console.log(`Sorry, action unknowned.`);
      }
    }

    /**
     * Add an event listener to associate the postMessage() data with the receiveMessage logic
     * in order to let CRM app communicate with flex 
     **/
    window.addEventListener("message", receiveMessage, false);


    /** 
     * Send message to CRM App to display task context when task is in wrappup state
     **/

    flex.Actions.addListener("afterSelectTask", (payload) => {
      console.log("afterSelectTask : ", payload);
      if (((typeof payload.task) !== 'undefined') && 
	(payload.task !== null) &&
	((typeof payload.task._task) !== 'undefined') &&
	(payload.task._task !== null) 
	//&&
	//(payload.task._task.attributes.direction !== "outbound") 
      ) {
	sendMessageToIframe("taskSelected", payload.task);
      };
    });

    /** 
     * Send message to CRM App to display task context when task is accepted by agent
     **/

    flex.Actions.addListener("afterAcceptTask", (payload) => {
      console.log("afterAcceptTask : ", payload);
      if (((typeof payload.task) !== 'undefined') && 
	(payload.task !== null) &&
	((typeof payload.task._task) !== 'undefined') &&
	(payload.task._task !== null)
	//&&
	//(payload.task._task.attributes.direction !== "outbound")
      ) {
	sendMessageToIframe("taskAccepted", payload.task);
      }
    });

    /** 
     * Send message to CRM App when the task linked to call outbound is completed
     **/

    flex.Actions.addListener("afterCompleteTask", (payload) => {
      console.log("afterCompleteTask : ", payload);
      if (((typeof payload.task) !== 'undefined') && 
	(payload.task !== null) &&
	((typeof payload.task._task) !== 'undefined') &&
	(payload.task._task !== null) 
	//	      &&
	//	(payload.task._task.attributes.direction == "outbound")
      ) {
	sendMessageToIframe("taskCompleted", payload.task);
      }
    });

    /** 
     * Send message to CRM App when the call is hung up
     **/

    flex.Actions.addListener("afterHangupCall", (payload) => {
      console.log("afterHangupCall : ", payload.task);
      if (((typeof payload.task) !== 'undefined') && 
	(payload.task !== null) &&
	((typeof payload.task._task) !== 'undefined') &&
	(payload.task._task !== null) 
	//	      &&
	//	(payload.task._task.attributes.direction == "outbound")
      ) {
	sendMessageToIframe("HangupCall", payload.task);
      }
    });

    /** 
     * Send message to CRM App when a message is sent
     **/

    flex.Actions.addListener("afterSendMessage", (payload) => {
      console.log("afterSendMessage : ", payload);
      if (((typeof payload.body) !== 'undefined') && 
	(payload.body !== null) &&
	((typeof payload.body) !== 'undefined')
      ) {
	sendMessageToIframe("MessageSent", payload);
      }
    });
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }
    manager.store.addReducer(namespace, reducers);
  }

}


