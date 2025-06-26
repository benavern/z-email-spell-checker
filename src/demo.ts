import './z-email-spell-checker'
import { ZEmailSpellChecker, MailSuggestion } from './z-email-spell-checker';

// example configuration
ZEmailSpellChecker.configure({
    domains: [
        ...ZEmailSpellChecker.POPULAR_DOMAINS,
        'caradeuc.info',
    ],
    distanceFunction(domain: string, knownDomain: string) {
        const dist = ZEmailSpellChecker.distanceFunction(domain, knownDomain);
        // force prioritize .com matches over .co and .ca
        // @see: https://github.com/smashsend/email-spell-checker/issues/33
        if (knownDomain === 'com') return dist - 0.75;
        return dist;
    }
});

// example control via js
const $input = document.querySelector<HTMLInputElement>('#attribute-event__input');
const $suggestion = document.querySelector<ZEmailSpellChecker>('#attribute-event__suggestion');

$input?.addEventListener('input', (event) => {
    const email = (event.target as HTMLInputElement).value.trim();
    if ($suggestion) $suggestion.email = email;
});

$suggestion?.addEventListener('suggestion:apply', (event) => {
    const suggestion = (event as CustomEvent<MailSuggestion>).detail.full;

    if ($input) {
        $input.value = suggestion;
        $input.dispatchEvent(new Event('input', { bubbles: true }));
    }
});
