'use strict'

const uiShareButtonDoc = document._currentScript || document.currentScript;
const uiShareButtonTemplate = uiShareButtonDoc.ownerDocument.querySelector('#ui-share-button-view');

class UIShareButton extends HTMLElement {

  static get observedAttributes(){
    return ['value', 'type', 'size', 'url'];
  }

  constructor(){
    super();
    const view = document.importNode(uiShareButtonTemplate.content, true);
    this.shadowRoot = this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(view);
		this.connected = false;

		this.validTypes = ['share', 'link', 'email', 'facebook', 'linkedin'];
		this.class = 'fa-share';
		this.size=1;
  }

	///STANDARD
	connectedCallback() {
		//Wire views here
    this.$container = this.shadowRoot.querySelector('.container');
    this.$icon = this.shadowRoot.querySelector('#icon');

		//Bind context to event, so we can access self
		this.$container.addEventListener('click', this.clicked.bind(this))
    this._updateRendering();
	}

	clicked(e){

		switch(this.type){
			case 'email':
				window.location.href = `mailto:?body=${this.url}`;
				break;
				case 'link':
				this.copyTextToClipboard(this.url);
				break;
			default:

		}

		console.log('clicked', this.type)
		this.$container.removeEventListener('click', this.clicked)
		let original = this.class;
		let temp = 'fa fa-check'

		this.class = temp;
		this.$container.style.boxShadow = "inset 0px 0px 0px 2px #70c1b3";
		this.$container.style.backgroundColor = "#70c1b3"
		this.$icon.style.color = "#fff"

		this._updateRendering();

		let feedbackTimer = window.setTimeout(e => {
			window.clearTimeout(feedbackTimer);
			this.$container.addEventListener('click', this.clicked.bind(this))

			this.$container.style.backgroundColor = "gray"
			this.$container.style.boxShadow = "inset 0px 0px 0px 2px gray";
			this.$icon.style.color = "#fff"
			this.class = original;
			this._updateRendering();
			this._updateEvent()
		}, 1000)
	}


	adoptedCallback(){
    //console.log('adoptedCallback');
	}

	disconnectedCallback() {
		this.connected = false;
		console.log('disconnected');
	}

	attributeChangedCallback(attrName, oldVal, newVal) {
		switch(attrName){
			case 'value':
				this.value = newVal;
				console.log('VALUE: ', newVal)
				break;
			case 'type':
				//If type is invalid, default to 'share'
				if(this.validTypes.includes(newVal)){ this.type = newVal; }
				else { this.type = 'share'; }
				console.log('TYPE: ', newVal)
				break;
			case 'size':
				this.size = newVal;
				console.log('SIZE: ', newVal)
				break;
			case 'url':
				this.url = newVal;
				console.log('URL: ', newVal)
				break;
			default:
				console.warn(`Attribute ${attrName} is not handled, you should probably do that`);
		}
  }

  get shadowRoot(){return this._shadowRoot;}
  set shadowRoot(value){ this._shadowRoot = value}

	copyTextToClipboard(text) {
		var textArea = document.createElement("textarea");

		//
		// *** This styling is an extra step which is likely not required. ***
		//
		// Why is it here? To ensure:
		// 1. the element is able to have focus and selection.
		// 2. if element was to flash render it has minimal visual impact.
		// 3. less flakyness with selection and copying which **might** occur if
		//    the textarea element is not visible.
		// The likelihood is the element won't even render, not even a flash,
		// so some of these are just precautions. However in IE the element
		// is visible whilst the popup box asking the user for permission for
		// the web page to copy to the clipboard.
		//

		// Place in top-left corner of screen regardless of scroll position.
		textArea.style.position = 'fixed';
		textArea.style.top = 0;
		textArea.style.left = 0;

		// Ensure it has a small width and height. Setting to 1px / 1em
		// doesn't work as this gives a negative w/h on some browsers.
		textArea.style.width = '2em';
		textArea.style.height = '2em';

		// We don't need padding, reducing the size if it does flash render.
		textArea.style.padding = 0;

		// Clean up any borders.
		textArea.style.border = 'none';
		textArea.style.outline = 'none';
		textArea.style.boxShadow = 'none';

		// Avoid flash of white box if rendered for any reason.
		textArea.style.background = 'transparent';


		textArea.value = text;

		document.body.appendChild(textArea);

		textArea.select();

		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log('Copying text command was ' + msg);
		} catch (err) {
			console.log('Oops, unable to copy');
		}

		document.body.removeChild(textArea);
	}

	get value(){ return this._value; }
	set value(value){
		this._value = value;
		this._updateRendering();
		this._updateEvent()
	}

	get size(){ return this._size}
	set size(value){
		//Size can only be between 1-5
		let number = Number(value);
		number = number < 1? 1: number;
		number = number > 5? 5: number;
		this._size = number;
	}

	get type(){ return this._type; }
	set type(attr){

		this.validTypes = ['linkedin'];
		switch(attr){
			case 'share':
				this.class = `fa fa-share`
				break;
			case 'email':
				this.class = `fa fa-envelope`
				break;
			case 'link':
				this.class = `fa fa-link`
				break;
			case 'facebook':
				this.class = `fa fa-facebook`
				break;
			case 'linkedin':
				this.class = `fa fa-linkedin`
				break;
			default:

		}

		this._type = attr;
		this._updateRendering();
		this._updateEvent()
	}



	_updateEvent(){
		this.dispatchEvent(new CustomEvent(this.defaultEventName, {detail: 'TODO'}));
	}

  _updateRendering() {

		if(this.$icon && this.$container){

			this.$icon.className = `fa ${this.class}`;
			this.$icon.style.fontSize = `${this.size}em`;
			this.$icon.style.paddingTop = `0.5em`;
			this.$icon.style.paddingLeft = `0.5em`;

			this.$container.style.width = `${this.size * 2}em`
			this.$container.style.height = `${this.size * 2}em`
			this.$container.style.borderRadius = `${this.size}em`
		}



  }
}

window.customElements.define('ui-share-button', UIShareButton);
