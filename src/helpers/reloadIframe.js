/*
 *  Recherche de l'ID de l'iframe Bubble puis envoi de la tâche Twilio par postMessage à l'application Bubble
 */

export const reloadIframe = (uri) => {
  if(!document.getElementsByTagName("iframe")) return;
  var iframes = document.getElementsByTagName("iframe");
  if(iframes[0]) 
  {
    iframes[0].src = uri;
  }
}
