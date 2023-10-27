import { Actions, TaskHelper, Manager, Notifications } from '@twilio/flex-ui';
import fetch from 'node-fetch';
import {
  sendMessageToIframe
} from './../helpers';

const URL_AGENT_OUTBOUND_SMS = process.env.FLEX_APP_URL_AGENT_OUTBOUND_SMS;
const URL_AGENT_OUTBOUND_WHATSAPP = process.env.FLEX_APP_URL_AGENT_OUTBOUND_WHATSAPP;
const URL_AGENT_OUTBOUND_MESSENGER  = process.env.FLEX_APP_URL_AGENT_OUTBOUND_MESSENGER;
const URL_PARK_AN_INTERACTION = process.env.FLEX_APP_URL_PARK_AN_INTERACTION;
const URL_UNPARK_AN_INTERACTION = process.env.FLEX_APP_URL_UNPARK_AN_INTERACTION;

const sendAgentOutboundSms = async (payload, original) => {
  const manager = Manager.getInstance();

  const body = {
    clientName : payload.clientName,
    clientNumber : payload.clientNumber, 
    workspace_sid : manager.workerClient.workspaceSid,
    worker_sid : manager.workerClient.workerSid,
    agentNumber : payload.agentNumber,
    Token: manager.store.getState().flex.session.ssoTokenPayload.token
  }
  console.log ('Body :', body, 'URL ', URL_AGENT_OUTBOUND_SMS);
  try {
    await fetch(URL_AGENT_OUTBOUND_SMS, {
      headers: {
	'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

  } catch (error) {
    console.error(error)

  }
}

Actions.registerAction('SendAgentOutboundSms', (payload, original) =>
  sendAgentOutboundSms(payload, original)
)


const sendAgentOutboundWhatsapp = async (payload, original) => {
  const manager = Manager.getInstance();

  const body = {
    clientName : payload.clientName,
    clientNumber : payload.clientNumber, 
    workspace_sid : manager.workerClient.workspaceSid,
    worker_sid : manager.workerClient.workerSid,
    agentNumber : payload.agentNumber,
    Token: manager.store.getState().flex.session.ssoTokenPayload.token
  }
  console.log ('Body :', body, 'URL ', URL_AGENT_OUTBOUND_WHATSAPP);
  try {
    await fetch(URL_AGENT_OUTBOUND_WHATSAPP, {
      headers: {
	'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

  } catch (error) {
    console.error(error)

  }
}

Actions.registerAction('SendAgentOutboundWhatsapp', (payload, original) =>
  sendAgentOutboundWhatsapp(payload, original)
)


const sendAgentOutboundMessenger = async (payload, original) => {
  const manager = Manager.getInstance();

  const body = {
    clientName : payload.clientName,
    clientMessengerId: payload.clientMessengerId, 
    workspace_sid : manager.workerClient.workspaceSid,
    worker_sid : manager.workerClient.workerSid,
    agentMessengerId : payload.agentMessengerId,
    Token: manager.store.getState().flex.session.ssoTokenPayload.token
  }
  console.log ('Body :', body, 'URL ', URL_AGENT_OUTBOUND_MESSENGER);
  try {
    await fetch(URL_AGENT_OUTBOUND_MESSENGER, {
      headers: {
	'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

  } catch (error) {
    console.error(error)

  }
}

Actions.registerAction('SendAgentOutboundMessenger', (payload, original) =>
  sendAgentOutboundMessenger(payload, original)
)

const unparkAnInteraction = async (payload, original) => {
  const manager = Manager.getInstance();

  const body = {
    ConversationSid : payload.conversationSid,
    workspace_sid : manager.workerClient.workspaceSid,
    worker_sid : manager.workerClient.workerSid,
    Token: manager.store.getState().flex.session.ssoTokenPayload.token
  }
  console.log ('Body :', body, 'URL ', URL_UNPARK_AN_INTERACTION);
  try {
    await fetch(URL_UNPARK_AN_INTERACTION, {
      headers: {
	'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    return Notifications.showNotification('unparkedNotification')
  } catch (error) {
    console.error(error)

    return Notifications.showNotification('errorNotification')
  }
}

Actions.registerAction('UnparkAnInteraction', (payload, original) =>
  unparkAnInteraction(payload, original)
)

const getAgent = async payload => {
  const participants = await payload.task.getParticipants(
    payload.task.attributes.flexInteractionChannelSid
  )

  let agent
  for (const p of participants) {
    if (p.type === 'agent') {
      agent = p
      break
    }
  }

  return agent
}

const parkInteraction = async (payload, original) => {
  if (!TaskHelper.isCBMTask(payload.task)) {
    return original(payload)
  }

  const agent = await getAgent(payload)

  const manager = Manager.getInstance()
  const body = {
    channelSid: agent.channelSid,
    interactionSid: agent.interactionSid,
    participantSid: agent.participantSid,
    conversationSid: agent.mediaProperties.conversationSid,
    taskSid: payload.task.taskSid,
    workflowSid: payload.task.workflowSid,
    taskChannelUniqueName: payload.task.taskChannelUniqueName,
    targetSid: payload.targetSid,
    workerName: manager.user.identity,
    taskAttributes: payload.task.attributes,
    Token: manager.store.getState().flex.session.ssoTokenPayload.token
  }

  try {
    await fetch(URL_PARK_AN_INTERACTION, {
      headers: {
	'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    }).then(response => {

    });
    return Notifications.showNotification('parkedNotification')
  } catch (error) {
    console.error(error)

    return Notifications.showNotification('errorNotification')
  }
}


Actions.registerAction('ParkInteraction', (payload, original) => {
  parkInteraction(payload, original);
  console.log("ParkInteraction ok", payload);
  sendMessageToIframe("Park", payload.task);
}
)
