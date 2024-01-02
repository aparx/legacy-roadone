import { signIn, signOut } from 'next-auth/react';


/** Opens a form that enables the end-user to sign-in. */
export const logIn = () => signIn('google');

/** Signs the user out. */
export const logOut = () => signOut();