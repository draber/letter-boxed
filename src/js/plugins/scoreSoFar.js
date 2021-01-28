import el from '../modules/element.js';
import data from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * Score so far plugin
 * 
 * @param {App} app
 * @returns {Plugin} ScoreSoFar
 */
class ScoreSoFar extends Plugin {

    /**
     * Build table data set
     * @returns {(string[]|(string|number)[])[]}
     */
    getData() {
        const foundWordsLength = data.getSize('foundTerms');
        const maxWords = data.getData('maxWords')
        return [
            ['', '✓', '?', '∑'],
            [
                'Letters',
                data.getSize('foundLetters'),
                data.getSize('remainingLetters'),
                data.getSize('allLetters')
            ],
            [
                'Words',
                foundWordsLength,
                maxWords - foundWordsLength,
                maxWords
            ]
        ];
    }

    /**
     * Build plugin
     * @param app
     */
    constructor(app) {

        super(app, 'Score so far', {
            canChangeState: true
        });

        this.ui = el.details({
            attributes: {
                open: true
            }
        });

        // add and populate content pane        
        const pane = tbl.build(this.getData());

        this.ui.append(el.summary({
            text: this.title
        }), pane);

        // update on demand
        app.on(prefix('wordsUpdated'), () => {
            tbl.refresh(this.getData(), pane);
        })

        this.add();
    }
}

export default ScoreSoFar;