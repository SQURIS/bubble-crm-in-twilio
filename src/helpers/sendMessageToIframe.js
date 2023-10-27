/*
 *  Recherche de l'ID de l'iframe Bubble puis envoi de la tâche Twilio par postMessage à l'application Bubble
 */

export const sendMessageToIframe = (eventType, payload) => {
  console.log("envoi du message à bubble : ",payload);
  if(!document.getElementsByTagName("iframe")) return;
  var iframes = document.getElementsByTagName("iframe");
  if (payload) {
    for(var j=0; j<iframes.length; j++){
      if(iframes[j]){
	if (eventType == "MessageSent")
	{
	  iframes[j].contentWindow.postMessage(
	    JSON.stringify({"eventType":eventType, 
	      "conversationSid":payload.conversationSid,
	      "message":payload.body
	    }),
	    '*')
	} 
	else {
	  iframes[j].contentWindow.postMessage(
	    JSON.stringify({"eventType":eventType, 
	      "taskAttributes":payload._task.attributes, 
	      "taskAttributes":payload._task.attributes, 
	      "dateCreated":payload._task.dateCreated, 
	      "dateUpdated":payload._task.dateUpdated,
	      "status":payload._task.status,
	      "taskChannelSid":payload._task.taskChannelSid,
	      "taskChannelUniqueName":payload._task.taskChannelUniqueName
	    }),
	    '*') 
	}
      }
    }
  }
}
