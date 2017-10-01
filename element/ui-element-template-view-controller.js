'use strict'

const uiElementTemplateDoc = document._currentScript || document.currentScript;
const uiElementTemplate = uiElementTemplateDoc.ownerDocument.querySelector('#ui-element-template-view');

class ElementTemplate extends HTMLElement {

  static get observedAttributes(){
    return ['value', 'type', 'size'];
  }

  constructor(){
    super();
    const view = document.importNode(uiElementTemplate.content, true);
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

	clicked(){
		let original = this.class;
		let temp = 'fa fa-check'

		this.class = temp;
		this.$container.style.boxShadow = "inset 0px 0px 0px 2px #70c1b3";
		this.$container.style.backgroundColor = "#70c1b3"
		this.$icon.style.color = "#fff"

		this._updateRendering();

		let feedbackTimer = window.setTimeout(e => {
			window.clearTimeout(feedbackTimer);
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
			default:
				console.warn(`Attribute ${attrName} is not handled, you should probably do that`);
		}
  }

  get shadowRoot(){return this._shadowRoot;}
  set shadowRoot(value){ this._shadowRoot = value}

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

window.customElements.define('ui-element-template', ElementTemplate);
