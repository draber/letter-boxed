import el from '../modules/element.js';
import data from '../modules/data.js';
import Plugin from '../modules/plugin.js';

/**
 * Spill the beans plugin
 *
 * @param {App} app
 * @returns {Plugin} SpillTheBeans
 */
class SpillTheBeans extends Plugin {

    /**
     * Check per letter the typed letters still fit a word in the remainder list
     * @param {String} value
     * @returns {string}
     */
    react(value) {
        if (!value) {
            return '😐';
        }
        if (!Array.from(data.getData('remainingTerms')).filter(term => term.startsWith(value)).length) {
            return '🙁';
        }
        return '🙂';
    }

    constructor(app) {

        super(app, 'Spill the beans', {
            canChangeState: true
        });

        this.ui = el.details();

        const pane = el.div({
            classNames: ['pane']
        });
        pane.append(el.div({
            text: 'Watch my reaction!',
            classNames: ['spill-title']
        }));
        const reaction = el.div({
            text: '😐',
            classNames: ['spill']
        });
        pane.append(reaction);
        this.ui.append(el.summary({
            text: this.title
        }), pane);

        (new MutationObserver(mutationsList => {
            reaction.textContent = this.react(mutationsList.pop().target.textContent.trim());
        })).observe(el.$('.lb-text-field', app.game), {
            childList: true
        });

        this.add();
    }
}

export default SpillTheBeans;
