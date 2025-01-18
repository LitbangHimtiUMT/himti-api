import admin from "firebase-admin";
import { FirebaseNotificationMessage } from "../interface/firebase-notification-message";
import { environment } from "../libs";

export const firebase = admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: environment.FIREBASE.CLIENT_EMAIL,
    privateKey: environment.FIREBASE.PRIVATE_KEY.replace(/\\n/g, "\n"),
    projectId: environment.FIREBASE.PROJECT_ID,
  }),
});

export const SendFirebaseNotification = async (
  message: FirebaseNotificationMessage
) => {
  try {
    const response = await firebase.messaging().send(message);
    console.log({ response });
  } catch (error) {
    console.log({ error });
  }
};
