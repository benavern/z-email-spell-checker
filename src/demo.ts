import './z-email-spell-checker'
import type { ZEmailSpellChecker, MailSuggestion } from './z-email-spell-checker';

const $input = document.querySelector<HTMLInputElement>('#full-example-input');
const $suggestion = document.querySelector<ZEmailSpellChecker>('#full-example-suggestion');

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
