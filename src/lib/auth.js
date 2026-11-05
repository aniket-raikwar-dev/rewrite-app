import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export const authRedirectUrl = makeRedirectUri({
  scheme: 'rewrite-ai',
  path: 'auth/callback',
});

let currentCallbackUrl = null;
let currentCallbackPromise = null;

function getAuthParams(url) {
  const params = {};
  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const fragment = url.includes('#') ? url.split('#')[1] : '';

  for (const value of [query, fragment]) {
    new URLSearchParams(value).forEach((item, key) => {
      params[key] = item;
    });
  }

  return params;
}

async function finishSessionFromUrl(url) {
  const params = getAuthParams(url);
  const errorCode = params.error_code;

  if (errorCode || params.error) {
    throw new Error(params.error_description || errorCode || params.error);
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return data.session;
  }

  return null;
}

export function createSessionFromUrl(url) {
  if (url === currentCallbackUrl && currentCallbackPromise) return currentCallbackPromise;

  currentCallbackUrl = url;
  currentCallbackPromise = finishSessionFromUrl(url).finally(() => {
    currentCallbackUrl = null;
    currentCallbackPromise = null;
  });
  return currentCallbackPromise;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authRedirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Google sign-in could not be started.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectUrl);
  if (result.type !== 'success') return null;

  return createSessionFromUrl(result.url);
}
