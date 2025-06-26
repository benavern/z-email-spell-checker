import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import emailSpellChecker, { POPULAR_DOMAINS, POPULAR_TLDS } from '@zootools/email-spell-checker';
import sift3Distance from '@zootools/email-spell-checker/dist/lib/fuzzy-detection/sift3-distance';
import type { MailSuggestion, UserOptions } from '@zootools/email-spell-checker/dist/lib/types';

type ZEmailSpellCheckerOptions = Omit<UserOptions, 'email'>;

export type { MailSuggestion, ZEmailSpellCheckerOptions };

@customElement('z-email-spell-checker')
export class ZEmailSpellChecker extends LitElement {
    static POPULAR_DOMAINS = POPULAR_DOMAINS;
    static POPULAR_TLDS = POPULAR_TLDS;
    static distanceFunction = sift3Distance;

    private static _userOptions: ZEmailSpellCheckerOptions = {};

    static configure(config: ZEmailSpellCheckerOptions) {
        ZEmailSpellChecker._userOptions = {
            ...ZEmailSpellChecker._userOptions,
            ...config,
        };
    }

    @state()
    private _suggestion?: MailSuggestion;

    @state()
    private _targetEl?: HTMLInputElement;

    @property({ type: String })
    public email: string = '';

    @property({ type: String, attribute: 'aria-label' })
    public ariaLabel: string = 'Appliquer la suggestion d\'email';

    @property({ type: String, attribute:'spell-checker-target' })
    public spellCheckerTarget?: string;

    connectedCallback(): void {
        super.connectedCallback();

        if (this.spellCheckerTarget) {
            this._targetEl = this.ownerDocument.querySelector(`#${this.spellCheckerTarget}`) ?? undefined;

            if (this._targetEl) {
                this._targetEl.addEventListener('input', this._onTargetInput.bind(this));
            }
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();

        this._targetEl?.removeEventListener('input', this._onTargetInput.bind(this));
    }

    // override suggestion state value with a new call to emailSpellChecker.run each time the email property changes
    updated(changedProperties: Map<string | number | symbol, unknown>) {
        if (changedProperties.has('email')) this._onEmailChange();
    }

    private _onTargetInput(ev: Event) {
        this.email = (ev.target as HTMLInputElement).value;
    }

    private _onEmailChange() {
        const email = this.email.trim();

        this._suggestion = email ? emailSpellChecker.run({
            email,
            ...ZEmailSpellChecker._userOptions,
        }) : undefined;
    }

    private _onSuggestionClick() {
        if (!this._suggestion) return;

        // broadcast customEvent to notify the parent component of the suggestion click
        const suggestionClickEvent = new CustomEvent<MailSuggestion>('suggestion:apply', {
            detail: this._suggestion,
            bubbles: true,
            composed: true,
        });

        this.dispatchEvent(suggestionClickEvent);

        // if attached to a target, set its value to the suggestion
        if (this._targetEl) {
            this._targetEl.value = this._suggestion.full;
            this._targetEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    render() {
        return this._suggestion
            ? html`
                <button
                    part="suggestion"
                    aria-label=${`${this.ariaLabel}: ${this._suggestion.full}`}
                    @click=${this._onSuggestionClick}>
                    ${this._suggestion.full}
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
