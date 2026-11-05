import { supabase } from './supabase';

export async function rewriteMessage({
  text,
  language = 'en',
  styles = ['better'],
}) {
  const { data, error } = await supabase.functions.invoke('rewrite-message', {
    body: {
      text: text.trim(),
      language,
      styles,
    },
  });

  if (error) {
    throw new Error(error.message || 'The message could not be rewritten.');
  }

  if (!data?.outputs?.length) {
    throw new Error('No rewrite was returned.');
  }

  return data;
}
