import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { firebaseApp } from "./firebase";

export const auth = getAuth(firebaseApp);
export const authPersistence = setPersistence(
  auth,
  browserLocalPersistence,
);