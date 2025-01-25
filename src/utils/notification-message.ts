import { FirebaseNotificationMessage } from "../interface/firebase-notification-message";

export const NotificationMessage = (title: string, body: string, fcmToken: string):FirebaseNotificationMessage => {
    return {
        notification: {
            title,
            body,
        },
        android: {
            notification: {
                sound: "default",
            },
            data: {
                title,
                body,
            },
        },
        token: fcmToken
    };
}