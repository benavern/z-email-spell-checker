import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import emailSpellChecker /*, { POPULAR_DOMAINS, POPULAR_TLDS } */ from '@zootools/email-spell-checker';
// import distance from '@zootools/email-spell-checker/dist/lib/helpers/sift3Distance';
import type { MailSuggestion } from '@zootools/email-spell-checker/dist/lib/types';
export type { MailSuggestion };

@customElement('z-email-spell-checker')
export class ZEmailSpellChecker extends LitElement {
    @state()
    private suggestion: MailSuggestion | undefined;

    @property({ type: String })
    public ariaLabel: string = 'Appliquer la suggestion d\'email';

    @property({ type: String })
    public email: string = '';

    // override suggestion state value with a new call to emailSpellChecker.run each time the email property changes
    updated(changedProperties: Map<string | number | symbol, unknown>) {
        if (changedProperties.has('email')) this._onEmailChange();
    }

    // broadcast customEvent to notify the parent component of the suggestion click
    private _onSuggestionClick() {
        if (!this.suggestion) return;

        const suggestionClickEvent = new CustomEvent<MailSuggestion>('suggestion:apply', {
            detail: this.suggestion,
            bubbles: true,
            composed: true,
        });

        this.dispatchEvent(suggestionClickEvent);
    }

    private _onEmailChange() {
        const email = this.email.trim();
        this.suggestion = email ? emailSpellChecker.run({ email }) : undefined;
    }

    render() {
        return this.suggestion
            ? html`
                <button
                    part="suggestion"
                    .aria-label=${`${this.ariaLabel}: ${this.suggestion.full}`}
                    @click=${this._onSuggestionClick}>
                    ${this.suggestion.full}
                </button>
            `
            : nothing;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'z-email-spell-checker': ZEmailSpellChecker,
    }
}
