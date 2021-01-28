import el from '../modules/element.js';
import data from '../modules/data.js';
import {
	prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import tbl from '../modules/tables.js';

/**
 * Spoilers plugin
 * 
 * @param {App} app
 * @returns {Plugin} Spoilers
 */
class Spoilers extends Plugin {

	getMinSteps() {
		let lastLetter = data.getData('lastLetter');
		if(!lastLetter) {
			return true;
		}
		let foundLetters = data.getData('foundLetters');
		let block = data.getBlock(lastLetter);
		let maxWords = data.getData('maxWords');
		return false
	}

	getData() {
        return [
            [
                'Shortest solution',
                `${data.getSize('solution')} words`
            ],
            [
				'Do I still have a chance?',
				this.getMinSteps() ? 'Yes' : 'No'
            ]
        ];
	}


	constructor(app) {

		super(app, 'Spoilers', {
			canChangeState: true
		});

		this.ui = el.details();

		// add and populate content pane    
		const pane = tbl.build(this.getData());

		this.ui.append(el.summary({
			text: this.title
		}), pane);

		// update on demand
		app.on(prefix('wordsUpdated'), () => {
			tbl.refresh(this.getData(), pane);
		});

		this.add();
	}
}
export default Spoilers;