(function () {
    'use strict';

    const fn = {
        $: (expr, container = null) => {
            return typeof expr === 'string' ? (container || document).querySelector(expr) : expr || null;
        },
        $$: (expr, container = null) => {
            return [].slice.call((container || document).querySelectorAll(expr));
        }
    };
    const create = function ({
        tag,
        text = '',
        attributes = {},
        style = {},
        data = {},
        events = {},
        classNames = [],
        svg
    } = {}) {
        const el = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
        el.textContent = text;
        for (let [key, value] of Object.entries(attributes)) {
            value = value.toString();
            if (svg) {
                el.setAttributeNS(null, key, value);
            } else {
                el[key] = value;
            }
        }
        for (let [key, value] of Object.entries(data)) {
            value = value.toString();
            el.dataset[key] = value;
        }
        for (const [event, fn] of Object.entries(events)) {
            el.addEventListener(event, fn, false);
        }
        Object.assign(el.style, style);
        if (classNames.length) {
            el.classList.add(...classNames);
        }
        return el;
    };
    const el = new Proxy(fn, {
        get(target, prop) {
            return function () {
                const args = Array.prototype.slice.call(arguments);
                if (target.hasOwnProperty(prop) && typeof target[prop] === 'function') {
                    target[prop].bind(target);
                    return target[prop].apply(null, args);
                }
                return create({
                    ...{
                        tag: prop
                    },
                    ...args.shift()
                });
            }
        }
    });

    var label = "Letter Boxed Assistant";
    var title = "Assistant";
    var url = "https://letter-boxed-assistant.app/";
    var repo = "draber/draber.github.io.git";
    var targetUrl = "https://www.nytimes.com/puzzles/letter-boxed";
    var prefix = "lba";

    var version = "1.0.0";

    const settings = {
        version: version,
        label: label,
        title: title,
        url: url,
        prefix: prefix,
        repo: repo,
        targetUrl: targetUrl,
        options: JSON.parse(localStorage.getItem(prefix + '-settings') || '{}')
    };
    const get = key => {
        let current = Object.create(settings);
        for (let token of key.split('.')) {
            if (typeof current[token] === 'undefined') {
                return undefined;
            }
            current = current[token];
        }
        return current;
    };
    const set = (key, value) => {
        const keys = key.split('.');
        const last = keys.pop();
        let current = settings;
        for (let part of keys) {
            if (!current[part]) {
                current[part] = {};
            }
            if (Object.prototype.toString.call(current) !== '[object Object]') {
                console.error(`${part} is not of the type Object`);
                return false;
            }
            current = current[part];
        }
        current[last] = value;
        localStorage.setItem(prefix + '-settings', JSON.stringify(settings.options));
    };
    var settings$1 = {
        get,
        set
    };

    const pf = settings$1.get('prefix');
    const camel = term => {
        return term.replace(/[_-]+/, ' ').replace(/(?:^[\w]|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return '';
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    };
    const dash = term => {
        return term.replace(/[\W_]+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('-');
    };
    const prefix$1 = (term, mode = 'c') => {
        switch (mode) {
            case 'c':
                return camel(pf + '_' + term);
            case 'd':
                return dash(pf + term.charAt(0).toUpperCase() + term.slice(1));
            default:
                return pf + term;
        }
    };

    let data;
    const getBlock = letter => {
        if (!data.grouped[letter]) {
            return new Set();
        }
        return data.grouped[letter];
    };
    const refresh = (app, foundTerms) => {
        data.foundTerms = new Set(foundTerms);
        data.lastTerm = foundTerms[foundTerms.length - 1] || '';
        data.lastLetter = data.lastTerm ? data.lastTerm.slice(-1) : '';
        data.foundLetters = new Set();
        data.remainingTerms = new Set(Array.from(data.dictionary).filter(term => !data.foundTerms.has(term)));
        data.foundTerms.forEach(term => {
            term.split('').forEach(letter => {
                data.foundLetters.add(letter);
            });
        });
        data.remainingLetters = new Set();
        data.allLetters.forEach(letter => {
            if (!data.foundLetters.has(letter)) {
                data.remainingLetters.add(letter);
            }
        });
        data.grouped = {};
        data.remainingTerms.forEach(term => {
            const letter = term.charAt(0);
            if (!data.grouped[letter]) {
                data.grouped[letter] = new Set();
            }
            data.grouped[letter].add(term);
        });
        console.log(data);
        app.trigger(prefix$1('wordsUpdated'));
    };
    const init = (app, foundTerms, maxWords) => {
        data = {
            dictionary: new Set(window.gameData.dictionary),
            allLetters: new Set(window.gameData.sides.join('').split('')),
            maxWords: maxWords,
            solution: new Set(window.gameData.ourSolution)
        };
        app.on(prefix$1('resultChange'), (evt) => {
            refresh(app, evt.detail);
        });
        refresh(app, foundTerms);
    };
    const getSize = type => {
        if(!data[type] || (typeof data[type].length === 'undefined' && typeof data[type].size === 'undefined')) {
            console.error(`data[${type}] is not countable`);
            return false;
        }
        return data[type].size || data[type].length;
    };
    const getData = type => {
        return data[type];
    };
    var data$1 = {
        init,
        getData,
        getSize,
        getBlock
    };

    const icons = {
        options: {
            children: {
                path: 'M16 14c0-2.203-1.797-4-4-4s-4 1.797-4 4 1.797 4 4 4 4-1.797 4-4zm8-1.703v3.469c0 .234-.187.516-.438.562l-2.891.438a8.86 8.86 0 01-.609 1.422c.531.766 1.094 1.453 1.672 2.156.094.109.156.25.156.391s-.047.25-.141.359c-.375.5-2.484 2.797-3.016 2.797a.795.795 0 01-.406-.141l-2.156-1.687a9.449 9.449 0 01-1.422.594c-.109.953-.203 1.969-.453 2.906a.573.573 0 01-.562.438h-3.469c-.281 0-.531-.203-.562-.469l-.438-2.875a9.194 9.194 0 01-1.406-.578l-2.203 1.672c-.109.094-.25.141-.391.141s-.281-.063-.391-.172c-.828-.75-1.922-1.719-2.578-2.625a.607.607 0 01.016-.718c.531-.719 1.109-1.406 1.641-2.141a8.324 8.324 0 01-.641-1.547l-2.859-.422A.57.57 0 010 15.705v-3.469c0-.234.187-.516.422-.562l2.906-.438c.156-.5.359-.969.609-1.437a37.64 37.64 0 00-1.672-2.156c-.094-.109-.156-.234-.156-.375s.063-.25.141-.359c.375-.516 2.484-2.797 3.016-2.797.141 0 .281.063.406.156L7.828 5.94a9.449 9.449 0 011.422-.594c.109-.953.203-1.969.453-2.906a.573.573 0 01.562-.438h3.469c.281 0 .531.203.562.469l.438 2.875c.484.156.953.344 1.406.578l2.219-1.672c.094-.094.234-.141.375-.141s.281.063.391.156c.828.766 1.922 1.734 2.578 2.656a.534.534 0 01.109.344c0 .141-.047.25-.125.359-.531.719-1.109 1.406-1.641 2.141.266.5.484 1.016.641 1.531l2.859.438a.57.57 0 01.453.562z'
            },
            width: 24,
            height: 28
        },
        arrowDown: {
            children: {
                path: 'M16.797 11.5a.54.54 0 01-.156.359L9.36 19.14c-.094.094-.234.156-.359.156s-.266-.063-.359-.156l-7.281-7.281c-.094-.094-.156-.234-.156-.359s.063-.266.156-.359l.781-.781a.508.508 0 01.359-.156.54.54 0 01.359.156l6.141 6.141 6.141-6.141c.094-.094.234-.156.359-.156s.266.063.359.156l.781.781a.536.536 0 01.156.359z'
            },
            width: 18,
            height: 28
        },
        darkMode: {
            children: {
                path: 'M12.018 1.982A12.018 12.018 0 000 14a12.018 12.018 0 0012.018 12.018A12.018 12.018 0 0024.036 14 12.018 12.018 0 0012.018 1.982zm0 3.293A8.725 8.725 0 0120.743 14a8.725 8.725 0 01-8.725 8.725z'
            },
            width: 24,
            height: 28
        }
    };
    const getIcon = key => {
        if (!icons[key]) {
            console.error(`Icon ${key} doesn't exist`);
            return false;
        }
        const icon = icons[key];
        const svg = el.svg({
            attributes: {
                ...{
                    viewBox: `0 0 ${icon.width} ${icon.height}`
                }
            },
            svg: true
        });
        for (const [type, d] of Object.entries(icon.children)) {
            svg.append(el[type]({
                attributes: {
                    d
                },
                svg: true
            }));
        }
        return svg;
    };

    class Widget {
        getState() {
            const stored = settings$1.get(`options.${this.key}`);
            return typeof stored !== 'undefined' ? stored : this.defaultState;
        }
        toggle(state) {
            if (!this.canChangeState) {
                return this;
            }
            settings$1.set(`options.${this.key}`, state);
            if (this.hasUi()) {
                this.ui.classList.toggle('inactive', !state);
            }
            return this;
        }
        enableTool(iconKey, textToActivate, textToDeactivate) {
            this.tool = el.div({
                events: {
                    click: () => {
                        this.toggle(!this.getState());
                        this.tool.title = this.getState() ? textToDeactivate : textToActivate;
                    }
                },
                attributes: {
                    title: this.getState() ? textToDeactivate : textToActivate
                },
                data: {
                    tool: this.key
                }
            });
            this.tool.append(getIcon(iconKey));
            return this;
        }
        hasUi() {
            return this.ui instanceof HTMLElement;
        }
        on(type, action) {
            this.ui.addEventListener(type, action);
            return this;
        }
        trigger(type, data) {
            this.ui.dispatchEvent(data ? new CustomEvent(type, {
                detail: data
            }) : new Event(type));
            return this;
        }
        constructor(title, {
            key,
            canChangeState,
            defaultState
        } = {}) {
            if (!title) {
                throw new TypeError(`Missing 'title' from ${this.constructor.name}`);
            }
            this.title = title;
            this.key = key || camel(title);
            this.canChangeState = typeof canChangeState !== 'undefined' ? canChangeState : false;
            this.defaultState = typeof defaultState !== 'undefined' ? defaultState : true;
            this.ui;
        }
    }

    class App extends Widget {
        dataAreEqual(oldData, newData) {
            return oldData.length === newData.length && oldData.every((value, i) => value === newData[i]);
        }
        getFoundTerms() {
            const resultList = el.$('.lb-word-list', this.form);
            if (!resultList) {
                return [];
            }
            return Array.from(resultList.children).map(node => node.textContent.trim());
        }
        registerPlugins(plugins) {
            for (const [key, plugin] of Object.entries(plugins)) {
                this.registry.set(key, new plugin(this));
            }
            this.trigger(prefix$1('pluginsReady'), this.registry);
            return this.registerTools();
        }
        registerTools() {
            this.registry.forEach(plugin => {
                if (plugin.tool) {
                    this.toolButtons.set(plugin.key, plugin.tool);
                }
            });
            this.enableTool('arrowDown', 'Maximize assistant', 'Minimize assistant');
            this.tool.classList.add('minimizer');
            this.toolButtons.set(this.key, this.tool);
            return this.trigger(prefix$1('toolsReady'), this.toolButtons);
        }
        constructor(game) {
            super(settings$1.get('label'), {
                canChangeState: true,
                key: prefix$1('app'),
            });
            this.game = game;
            const oldInstance = el.$(`[data-id="${this.key}"]`);
            if (oldInstance) {
                oldInstance.dispatchEvent(new Event(prefix$1('destroy')));
            }
            this.registry = new Map();
            this.toolButtons = new Map();
            this.parent = el.div({
                classNames: [prefix$1('container')]
            });
            this.form = el.$('.lb-word-container', game);
            const events = {};
            events[prefix$1('destroy')] = () => {
                this.observer.disconnect();
                this.parent.remove();
            };
            this.isDraggable = document.body.classList.contains('pz-desktop');
            this.ui = el.div({
                attributes: {
                    draggable: this.isDraggable
                },
                data: {
                    id: this.key,
                    version: settings$1.get('version')
                },
                classNames: [settings$1.get('prefix')],
                events: events
            });
            this.dragHandle = this.ui;
            this.dragArea = this.game;
            this.dragOffset = 12;
            let oldData = [];
            this.observer = (() => {
                const observer = new MutationObserver(() => {
                    const newData = this.getFoundTerms();
                    if (!this.dataAreEqual(oldData, newData)) {
                        oldData = newData;
                        this.trigger(prefix$1('resultChange'), newData);
                    }
                });
                observer.observe(this.form, {
                    childList: true,
                    subtree: true
                });
                return observer;
            })();
            const maxWords = Number(el.$('.lb-par', game).textContent.match(/\d/).shift());
            data$1.init(this, this.getFoundTerms(), maxWords);
            this.toggle(this.getState());
            this.parent.append(this.ui);
            game.before(this.parent);
        }
    }

    var css = "[data-lba-theme=light]{--text-color:#000;--body-bg-color:#fff;--modal-bg-color:rgba(255,255,255,.85);--border-color:#dcdcdc;--area-bg-color:#e6e6e6;--invalid-color:#dcdcdc;}[data-lba-theme=dark]{--text-color:#e7eae1;--body-bg-color:#111;--modal-bg-color:rgba(17,17,17,.85);--border-color:#333;--area-bg-color:#393939;--invalid-color:#666;}html{--highlight-color: rgb(248, 205, 5);}.pz-game-field{background:inherit;color:inherit}.lb-wordlist-items .lb-pangram{border-bottom:2px var(--highlight-color) solid}.lb-wordlist-items .lb-anagram a{color:var(--invalid-color)}.lb-modal-scrim{z-index:6}[data-lba-theme=dark]{background:var(--body-bg-color);color:var(--text-color)}[data-lba-theme=dark] .pz-nav__hamburger-inner,[data-lba-theme=dark] .pz-nav__hamburger-inner::before,[data-lba-theme=dark] .pz-nav__hamburger-inner::after{background-color:var(--text-color)}[data-lba-theme=dark] .pz-nav{width:100%;background:var(--body-bg-color)}[data-lba-theme=dark] .pz-nav__logo{filter:invert(1)}[data-lba-theme=dark] .lb-modal-scrim{background:var(--modal-bg-color);color:var(--text-color)}[data-lba-theme=dark] .pz-modal__title{color:var(--text-color)}[data-lba-theme=dark] .lb-modal-frame,[data-lba-theme=dark] .pz-modal__button.white{background:var(--body-bg-color);color:var(--text-color)}[data-lba-theme=dark] .pz-modal__button.white:hover{background:var(--area-bg-color)}[data-lba-theme=dark] .lb-message{background:var(--area-bg-color)}[data-lba-theme=dark] .lb-input-invalid{color:var(--invalid-color)}[data-lba-theme=dark] .lb-toggle-expand{box-shadow:none}[data-lba-theme=dark] .lb-progress-marker .lb-progress-value,[data-lba-theme=dark] .hive-cell.center .cell-fill{background:var(--highlight-color);fill:var(--highlight-color);color:var(--body-bg-color)}[data-lba-theme=dark] .lb-input-bright{color:var(--highlight-color)}[data-lba-theme=dark] .hive-cell.outer .cell-fill{fill:var(--area-bg-color)}[data-lba-theme=dark] .cell-fill{stroke:var(--body-bg-color)}[data-lba-theme=dark] .cell-letter{fill:var(--text-color)}[data-lba-theme=dark] .hive-cell.center .cell-letter{fill:var(--body-bg-color)}[data-lba-theme=dark] .hive-action:not(.hive-action__shuffle){background:var(--body-bg-color);color:var(--text-color)}[data-lba-theme=dark] .hive-action__shuffle{filter:invert(100%)}[data-lba-theme=dark] *:not(.hive-action__shuffle):not(.lb-pangram):not(.lba-current){border-color:var(--border-color) !important}.lba{position:absolute;z-index:3;width:160px;box-sizing:border-box;padding:0 10px 5px;background:var(--body-bg-color);border-width:1px;border-color:var(--border-color);border-radius:6px;border-style:solid}.lba *,.lba *:before,.lba *:after{box-sizing:border-box}.lba *:focus{outline:0}.lba [data-ui=header]{display:flex;gap:8px}.lba [data-ui=header] .toolbar{display:flex;align-items:stretch;gap:1px}.lba [data-ui=header] .toolbar div{padding:10px 3px 2px 3px}.lba [data-ui=header] .toolbar div:last-of-type{padding-top:8px}.lba [data-ui=header] svg{width:11px;cursor:pointer;fill:currentColor}.lba .header{font-weight:bold;line-height:32px;flex-grow:2}.lba .minimizer{transform:rotate(180deg);transform-origin:center;position:relative;top:2px}.lba.inactive details,.lba.inactive [data-ui=footer]{display:none}.lba.inactive [data-tool=setUp]{position:relative;pointer-events:none}.lba.inactive [data-tool=setUp]:before{content:\"\";width:100%;height:100%;background-color:var(--modal-bg-color);cursor:default;display:block;position:absolute;top:0;left:0}.lba.inactive .minimizer{transform:rotate(0deg);top:0}.lba details{font-size:90%;max-height:800px;transition:max-height .25s ease-in;margin-bottom:1px}.lba details[open] summary:before{transform:rotate(-90deg);left:10px;top:1px}.lba details.inactive{height:0;max-height:0;transition:max-height .25s ease-out;overflow:hidden;margin:0}.lba summary{font-size:13px;line-height:22px;padding:1px 15px 0 21px;background:var(--area-bg-color);color:var(--text-color);cursor:pointer;list-style:none;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lba summary::-webkit-details-marker{display:none}.lba summary:before{content:\"❯\";font-size:9px;position:absolute;display:inline-block;transform:rotate(90deg);transform-origin:center;left:7px;top:0}.lba .pane{border:1px solid var(--border-color);border-top:none;width:100%;font-size:85%;margin-bottom:2px}.lba table{border-collapse:collapse;table-layout:fixed}.lba tr.lba-current{font-weight:bold;border-bottom:2px solid var(--highlight-color) !important}.lba td{border:1px solid var(--border-color);border-top:none;white-space:nowrap;text-align:center;padding:4px 0;width:26px}.lba td:first-of-type{text-align:left;width:auto;overflow:hidden;text-overflow:ellipsis;padding:4px 3px}.lba [data-ui=scoreSoFar] tbody tr:first-child td,.lba [data-ui=spoilers] tbody tr:first-child td{font-weight:bold}.lba [data-ui=footer]{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:8px}.lba [data-ui=footer]:hover{opacity:.8;text-decoration:underline}.lba .spill-title{padding:10px 6px 0;text-align:center}.lba .spill{text-align:center;padding:17px 0;font-size:280%}.lba ul.pane{padding:5px}.lba [data-ui=surrender] .pane{padding:10px 5px}.lba [data-ui=surrender] button{margin:0 auto;display:block;font-size:100%;white-space:nowrap;padding:12px 10px}.lba label{cursor:pointer;position:relative;line-height:19px}.lba label input{position:relative;top:2px;margin:0 10px 0 0}@media(min-width: 768px){.lbaContainer{width:100%;max-width:1080px;margin:0 auto;height:0;overflow-y:visible;position:relative;z-index:5}.lba{left:100%;top:64px}}@media(max-width: 1444px){.lbaContainer{max-width:none}.lba{top:16px;left:12px}}@media(max-width: 767.98px){.lba{top:167px}.pz-mobile .lba{top:auto;bottom:-7px}}";

    class Plugin extends Widget {
        attach() {
            this.toggle(this.getState());
            if (!this.hasUi()) {
                return this;
            }
            this.ui.dataset.ui = this.key;
            (this.target || this.app.ui).append(this.ui);
            return this;
        }
        add() {
            if (this.canChangeState) {
                settings$1.set(`options.${this.key}`, this.getState());
            }
            return this.attach();
        }
        constructor(app, title, {
            key,
            canChangeState,
            defaultState
        } = {}) {
            super(title, {
                key,
                canChangeState,
                defaultState
            });
            this.target;
            this.app= app;
        }
    }

    class Styles extends Plugin {
        constructor(app) {
            super(app, 'Styles');
            this.target = el.$('head');
            this.ui = el.style({
                text: css
            });
            app.on(prefix$1('destroy'), () => this.ui.remove());
            this.add();
        }
    }

    class DarkMode extends Plugin {
        toggle(state) {
            super.toggle(state);
            document.body.dataset[prefix$1('theme')] = state ? 'dark' : 'light';
            return this;
        }
        constructor(app) {
            super(app, 'Dark Mode', {
                canChangeState: true,
                defaultState: false
            });
            this.enableTool('darkMode', 'Dark mode on', 'Dark mode off');
            app.on(prefix$1('destroy'), () => {
                delete document.body.dataset[prefix$1('theme')];
            });
            this.add();
        }
    }

    class Header extends Plugin {
        constructor(app) {
            super(app, settings$1.get('title'), {
                key: 'header'
            });
            this.ui = el.div();
            app.dragHandle = el.div({
                text: this.title,
                classNames: ['header']
            });
            this.ui.append(app.dragHandle);
            app.on(prefix$1('toolsReady'), evt => {
                const toolbar = el.div({
                    classNames: ['toolbar']
                });
                evt.detail.forEach(tool => {
                    toolbar.append(tool);
                });
                this.ui.append(toolbar);
                return this;
            });
            this.add();
        }
    }

    class SetUp extends Plugin {
    	toggle(state) {
    		super.toggle(state);
    		this.ui.open = this.getState();
    		return this;
    	}
    	constructor(app) {
    		super(app, 'Set-up', {
    			canChangeState: true,
    			defaultState: false
    		});
    		const pane = el.ul({
    			classNames: ['pane']
    		});
    		this.ui = el.details({
    			events: {
    				click: evt => {
    					if (evt.target.tagName === 'INPUT') {
    						app.registry.get(evt.target.name).toggle(evt.target.checked);
    					}
    				},
    				toggle: evt => {
    					if (!evt.target.open) {
    						this.toggle(false);
    					}
    				}
    			}
    		});
    		this.enableTool('options', 'Show set-up', 'Hide set-up');
    		app.on(prefix$1('pluginsReady'), evt => {
    			evt.detail.forEach((plugin, key) => {
    				if (!plugin.canChangeState || plugin.tool) {
    					return false;
    				}
    				const li = el.li();
    				const label = el.label({
    					text: plugin.title
    				});
    				const check = el.input({
    					attributes: {
    						type: 'checkbox',
    						name: key,
    						checked: !!plugin.getState()
    					}
    				});
    				label.prepend(check);
    				li.append(label);
    				pane.append(li);
    			});
    		});
    		this.ui.append(el.summary({
    			text: this.title
    		}), pane);
    		this.toggle(false);
    		this.add();
    	}
    }

    const refresh$1 = (data, table) => {
        table.innerHTML = '';
        const tbody = el.tbody();
        data.forEach((rowData) => {
            const tr = el.tr();
            rowData.forEach((cellData) => {
                tr.append(el.td({
                    text: cellData
                }));
            });
            tbody.append(tr);
        });
        table.append(tbody);
    };
    const build = data => {
        const table = el.table({
            classNames: ['pane']
        });
        refresh$1(data, table);
        return table;
    };
    var tbl = {
        build,
        refresh: refresh$1
    };

    class ScoreSoFar extends Plugin {
        getData() {
            const foundWordsLength = data$1.getSize('foundTerms');
            const maxWords = data$1.getData('maxWords');
            return [
                ['', '✓', '?', '∑'],
                [
                    'Letters',
                    data$1.getSize('foundLetters'),
                    data$1.getSize('remainingLetters'),
                    data$1.getSize('allLetters')
                ],
                [
                    'Words',
                    foundWordsLength,
                    maxWords - foundWordsLength,
                    maxWords
                ]
            ];
        }
        constructor(app) {
            super(app, 'Score so far', {
                canChangeState: true
            });
            this.ui = el.details({
                attributes: {
                    open: true
                }
            });
            const pane = tbl.build(this.getData());
            this.ui.append(el.summary({
                text: this.title
            }), pane);
            app.on(prefix$1('wordsUpdated'), () => {
                tbl.refresh(this.getData(), pane);
            });
            this.add();
        }
    }

    class SpillTheBeans extends Plugin {
        react(value) {
            if (!value) {
                return '😐';
            }
            if (!Array.from(data$1.getData('remainingTerms')).filter(term => term.startsWith(value)).length) {
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

    class Spoilers extends Plugin {
    	getMinSteps() {
    		let lastLetter = data$1.getData('lastLetter');
    		if(!lastLetter) {
    			return true;
    		}
    		let foundLetters = data$1.getData('foundLetters');
    		let block = data$1.getBlock(lastLetter);
    		let maxWords = data$1.getData('maxWords');
    		return false
    	}
    	getData() {
            return [
                [
                    'Shortest solution',
                    `${data$1.getSize('solution')} words`
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
    		const pane = tbl.build(this.getData());
    		this.ui.append(el.summary({
    			text: this.title
    		}), pane);
    		app.on(prefix$1('wordsUpdated'), () => {
    			tbl.refresh(this.getData(), pane);
    		});
    		this.add();
    	}
    }

    class Footer extends Plugin {
        constructor(app) {
            super(app, `${settings$1.get('label')}`, {
                key: 'footer'
            });
            this.ui = el.a({
                text: this.title,
                attributes: {
                    href: settings$1.get('url'),
                    target: '_blank'
                }
            });
            this.add();
        }
    }

    class Positioning extends Plugin {
        getOffset(offset) {
            return !isNaN(offset) ? {
                top: offset,
                right: offset,
                bottom: offset,
                left: offset
            } : {
                ...{
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                ...offset
            }
        }
        getBoundaries() {
            const areaRect = this.app.dragArea.getBoundingClientRect();
            const parentRect = this.app.ui.parentNode.getBoundingClientRect();
            const appRect = this.app.ui.getBoundingClientRect();
            return {
                minTop: this.offset.top,
                maxTop: areaRect.height - appRect.height - this.offset.bottom,
                minLeft: this.offset.left - parentRect.left,
                maxLeft: areaRect.width - parentRect.left - appRect.width - this.offset.right
            }
        }
        getMouse(evt) {
            return {
                left: evt.screenX,
                top: evt.screenY
            }
        }
        getPosition(evt) {
            if (evt) {
                const mouse = this.getMouse(evt);
                return {
                    left: this.position.left + mouse.left - this.mouse.left,
                    top: this.position.top += mouse.top - this.mouse.top
                }
            } else {
                const style = getComputedStyle(this.app.ui);
                return {
                    top: parseInt(style.top),
                    left: parseInt(style.left)
                }
            }
        }
        reposition() {
            this.boundaries = this.getBoundaries();
            this.position.left = Math.min(this.boundaries.maxLeft, Math.max(this.boundaries.minLeft, this.position.left));
            this.position.top = Math.min(this.boundaries.maxTop, Math.max(this.boundaries.minTop, this.position.top));
            Object.assign(this.app.ui.style, {
                left: this.position.left + 'px',
                top: this.position.top + 'px'
            });
            this.toggle(this.getState() ? this.position : false);
            return this;
        }
        enableDrag() {
            this.app.dragHandle.style.cursor = 'move';
            this.app.on('pointerdown', evt => {
                    this.isLastTarget = evt.target.isSameNode(this.app.dragHandle);
                }).on('pointerup', () => {
                    this.isLastTarget = false;
                }).on('dragend', evt => {
                    this.position = this.getPosition(evt);
                    this.reposition();
                    evt.target.style.opacity = '1';
                }).on('dragstart', evt => {
                    if (!this.isLastTarget) {
                        evt.preventDefault();
                        return false;
                    }
                    evt.target.style.opacity = '.2';
                    this.position = this.getPosition();
                    this.mouse = this.getMouse(evt);
                })
                .on('dragover', evt => evt.preventDefault());
            this.app.dragArea.addEventListener('dragover', evt => evt.preventDefault());
            return this;
        }
        toggle(state) {
            return super.toggle(state ? this.position : state);
        }
        constructor(app) {
            super(app, 'Memorize position', {
                key: 'positioning',
                canChangeState: true
            });
            this.boundaries;
            this.mouse;
            this.isLastTarget = false;
            if (!this.app.isDraggable) {
                return this;
            }
            this.position = this.getPosition();
            this.offset = this.getOffset(app.dragOffset || 0);
            const stored = this.getState();
            if (stored && Object.prototype.toString.call(stored) === '[object Object]') {
                this.position = stored;
                this.reposition();
            }
            this.enableDrag();
            this.add();
            window.addEventListener('orientationchange', () => this.reposition());
        }
    }

    var plugins = {
         Styles,
         DarkMode,
         Header,
         SetUp,
         ScoreSoFar,
         Spoilers,
         SpillTheBeans,
         Footer,
         Positioning
    };

    (new App(el.$('#pz-game-root'))).registerPlugins(plugins);

}());
