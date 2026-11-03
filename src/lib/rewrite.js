const example = 'hey, i wanted to check if you had time to review this and let me know your thoughts. no rush, whenever you get a chance.';

const shapeOptions = [
  ['clover', 'Green clover'], ['fork', 'Violet fork'], ['bloom', 'Blue bloom'],
  ['petals', 'Pink petals'], ['asterisk', 'White asterisk'], ['rays', 'Pink rays'],
  ['burst', 'Orange burst'], ['flow', 'Pink flow'], ['dots', 'Lime dots'],
  ['quad', 'Four pink dots'], ['split', 'Orange split'],
];

const commonTypos = {
  wen: 'when', teh: 'the', becuase: 'because', recieve: 'receive',
  adress: 'address', definately: 'definitely', thier: 'their',
  seperate: 'separate', tomorow: 'tomorrow', mesage: 'message',
  avaliable: 'available', wierd: 'weird', reviw: 'review',
  pleas: 'please', thnaks: 'thanks', alwasy: 'always',
};
function localRewrite(text) {
  let result = text.trim().replace(/\b[a-z]+\b/gi, word => {
    const corrected = commonTypos[word.toLowerCase()];
    if (!corrected) return word;
    if (word === word.toUpperCase()) return corrected.toUpperCase();
    return word[0] === word[0].toUpperCase() ? corrected[0].toUpperCase() + corrected.slice(1) : corrected;
  }).replace(/\bi\b/g, 'I').replace(/\bim\b/gi, "I'm").replace(/\bdont\b/gi, "don't").replace(/\bcant\b/gi, "can't");
  result = result.replace(/\bwanna\b/gi, 'want to').replace(/\bgotta\b/gi, 'have to').replace(/\bpls\b/gi, 'please').replace(/\bthx\b/gi, 'thank you');
  result = result.replace(/\b(u|ur)\b/gi, word => word.toLowerCase() === 'u' ? 'you' : 'your').replace(/\blemme\b/gi, 'let me').replace(/\s+/g, ' ').trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  if (!/[.!?]$/.test(result)) result += '.';
  result = result.replace(/i wanted to check if you had time to review this and let me know your thoughts\.?/i, 'I wanted to check whether you have had a chance to review this and share your thoughts.');
  return result.replace(/no rush, whenever you get a chance\.?/i, 'There is no rush—whenever you have a chance would be great.');
}
function alternativeRewrites(message) {
  const versions = [];
  const add = (label, text) => {
    if (text && text.toLowerCase() !== message.toLowerCase() && !versions.some(item => item.text.toLowerCase() === text.toLowerCase())) {
      versions.push({ label, text });
    }
  };
  const review = message.match(/^(?:(?:Hey|Hi),?\s*)?I wanted to check whether you have had a chance to (.+?) and share your thoughts\.(.*)$/i);
  const when = message.match(/^When can you (.+?)\?$/i);
  const request = message.match(/^(?:(?:Hey|Hi),?\s*)?(?:Can|Could) you (.+?)[.!?]$/i);
  const please = message.match(/^Please (.+?)[.!?]$/i);
  if (review) {
    const noRush = /no rush/i.test(review[2]);
    add('More direct', `Have you had a chance to ${review[1]}? I'd appreciate your thoughts${noRush ? ' when you have time' : ''}.`);
    add('More polite', `Could you please ${review[1]} and let me know what you think?${noRush ? ' No rush.' : ''}`);
  } else if (when) {
    add('More direct', `When will you ${when[1]}?`);
    add('More polite', `Could you let me know when you can ${when[1]}?`);
  } else if (request) {
    const action = request[1].replace(/^please\s+/i, '').replace(/\s*,?\s*please$/i, '');
    add('More direct', `Please ${action}.`);
    add('More polite', `Could you please ${action}?`);
    if (versions.length < 2) add('Another way', `Would you be able to ${action}?`);
  } else if (please) {
    add('More direct', `Can you ${please[1]}?`);
    add('More polite', `Could you please ${please[1]}?`);
  }
  if (versions.length < 2) {
    add('More polished', message.replace(/\bI'm\b/gi, 'I am').replace(/\bcan't\b/gi, 'cannot').replace(/\bdon't\b/gi, 'do not').replace(/\bI'd like to\b/gi, 'I would like to').replace(/\bthanks\b/gi, 'thank you').replace(/^Hey,?/i, 'Hello,'));
    add('More conversational', message.replace(/\bI am\b/gi, "I'm").replace(/\bcannot\b/gi, "can't").replace(/\bdo not\b/gi, "don't").replace(/\bI would like to\b/gi, "I'd like to").replace(/\bthank you\b/gi, 'thanks').replace(/^Hello,?/i, 'Hi,'));
  }
  return versions.slice(0, 2);
}

export { example, shapeOptions, localRewrite, alternativeRewrites };

