import { Notifications, NotificationType } from '@twilio/flex-ui'

Notifications.registerNotification({
  id: 'parkedNotification',
  closeButton: true,
  content: 'Conversation was paused successfully!',
  timeout: 3000,
  type: NotificationType.success
})

Notifications.registerNotification({
  id: 'unparkedNotification',
  closeButton: true,
  content: 'Conversation was unpaused successfully!',
  timeout: 3000,
  type: NotificationType.success
})

Notifications.registerNotification({
  id: 'errorNotification',
  closeButton: true,
  content: 'An error has ocurred',
  timeout: 3000,
  type: NotificationType.error
})
