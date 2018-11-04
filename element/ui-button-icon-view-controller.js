'use strict'

const uiButtonIconDoc = document._currentScript || document.currentScript;
const uiButtonIconTemplate = uiButtonIconDoc.ownerDocument.querySelector('#ui-button-icon-view');

class UIButtonIcon extends HTMLElement {

    static get observedAttributes(){
        return ['value', 'type', 'icon', 'size', 'url', 'disabled'];
    }

    constructor(){
        super();

        const view = document.importNode(uiButtonIconTemplate.content, true);
        this.shadowRoot = this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(view);
        this.connected = false;

        this.constant = {};
        this.constant.feedbackDuration = 1500;
        this.constant.initial = "initial";
        this.constant.loading = "loading";
        this.constant.success = "success";
        this.constant.hover = "hover";
        this.constant.error = "error";

        this.model = {}
        this.event = {};
        this.state = {};
        this.state.isLoading = false;
        this.state.isSuccess = false;
        this.state.isDisabled = false;

        //Defaults
        this.icon = "";
        this.type = "solid";
        this.size = 1;
    }

    get type(){
        return this.model.type;
    }

    set type(value){
        switch(value){
            case "brand":
            case "solid":
            case "light":
            case "regular":
                this.model.type = value;
                break;

            default:
                console.log(`ui-button-icon: type '${value}' is not implemented`)
        }
    }

    get icon(){ return this.model.icon; }
    set icon(value){ this.model.icon = value; }

    ///STANDARD
    connectedCallback() {
        //Wire views here
        this.$container = this.shadowRoot.querySelector('.container');
        this.$icon = this.shadowRoot.querySelector('#icon');

        this.event.click = this._onClick.bind(this);
        this.event.mouseenter = this._onMouseEnter.bind(this);
        this.event.mouseleave = this._onMouseLeave.bind(this);

        //Bind context to event, so we can access self
        this.addEventListener('click', this.event.click)
        this.addEventListener('mouseenter', this.event.mouseenter)
        this.addEventListener('mouseleave', this.event.mouseleave)

        this.connected = true;
        this._setInitialState();
        this._updateRendering();
    }

    _onClick(){
        this.loading();
    }

    _isAlternateState(){
        return this.state.isLoading || this.state.isSuccess || this.state.isError || this.state.isDisabled;
    }

    _onMouseEnter(){
        this.hover();
    }

    _onMouseLeave(){
        if(this._isAlternateState()) return;
        this.init();
    }

    //Should only be called once, when first connected
    _setInitialState(){
        if(this.state.initial) return;
        const computedStyles = getComputedStyle(this);
        this.state.initial = {};
        this.state.initial.type = this.type;
        this.state.initial.icon = this.icon;
        this.state.initial.color = this.style.color;
        this.state.initial.hoverColor = computedStyles.getPropertyValue("--hover-color");
        this.state.initial.backgroundColor = computedStyles.getPropertyValue("--background-color");
        this.state.initial.hoverBackgroundColor = computedStyles.getPropertyValue("--hover-background-color");
    }

    init(){
        if(!this.connected) return;
        this.type = this.state.initial.type;
        this.icon = this.state.initial.icon;

        this.style.setProperty("--color", this.state.initial.color);
        this.style.setProperty("--hover-color", this.state.initial.hoverColor);
        this.style.setProperty("--background-color", this.state.initial.backgroundColor);
        this.style.setProperty("--hover-background-color", this.state.initial.hoverBackgroundColor);

        this.addEventListener('mouseenter', this.event.mouseenter)
        this.addEventListener('mouseleave', this.event.mouseleave)
        this.addEventListener('click', this.event.click)

        this.$container.style.cursor = "pointer";
        this.$container.style.color = "var(--color)"
        this.$container.style.backgroundColor = "var(--background-color)"
        this.$container.style.boxShadow = "inset 0px 0px 0px 2px var(--background-color)";
        this.$container.style.cursor = "pointer";
        this.state.isSuccess = false;
        this.state.isLoading = false;
        this.state.isError = false;
        this.state.spin = false;
        this._updateRendering();
    }

    hover(){
        if(!this.connected || this._isAlternateState()) return;
        this.$container.style.boxShadow = "inset 0px 0px 0px 2px var(--hover-background-color)";
        this.$container.style.backgroundColor = "var(--hover-background-color)";
        this.$icon.style.color = "var(--color)";
    }

    disable(){
        if(!this.connected) return;
        this.type = this.state.initial.type;
        this.icon = this.state.initial.icon;
        this.state.spin = false;
        this._renderIcon();

        this.$container.style.cursor = "not-allowed";
        this.removeEventListener('click', this.event.click)
        this.removeEventListener('mouseenter', this.event.mouseenter)
        this.removeEventListener('mouseleave', this.event.mouseleave)
        this.$container.style.boxShadow = "inset 0px 0px 0px 2px var(--disabled-color)";
        this.$container.style.backgroundColor = "var(--disabled-color)"
        this.$icon.style.color = "#fff"
    }

    enable(){
        if(!this.connected) return;
        this.$container.style.cursor = "pointer";
        this.addEventListener('mouseenter', this.event.mouseenter);
        this.addEventListener('mouseleave', this.event.mouseleave);
        this.addEventListener('click', this.event.click)
        this.$container.style.color = "var(--color)"
        this.$container.style.backgroundColor = "var(--background-color)"
        this.$container.style.boxShadow = "inset 0px 0px 0px 2px var(--background-color)";
    }

    success(){
        if(!this.connected || this.disabled) return;
        this.isSuccess = true;
        this.removeEventListener('click', this.event.click)
        this.type = "solid";
        this.icon = "check";
        this.state.spin = false;
        this._updateRendering();

        this.$container.style.boxShadow = "inset 0px 0px 0px 2px var(--success-color)";
        this.$container.style.backgroundColor = "var(--success-color)"
        this.$icon.style.color = "#fff"

        let feedbackTimer = window.setTimeout(e => {
            this.addEventListener('click', this.event.click)
            this.isSuccess = false;
            this.init();
            window.clearTimeout(feedbackTimer);
        }, this.constant.feedbackDuration)

    }

    error(){
        if(!this.connected || this.disabled) return;
        this.removeEventListener('click', this.event.click)
        this.state.isError = true;
        this.type = "solid";
        this.icon = "times";
        this.state.spin = false;
        this._updateRendering();

        this.$container.style.boxShadow = "inset 0px 0px 0px 2px var(--error-color)";
        this.$container.style.backgroundColor = "var(--error-color)"
        this.$icon.style.color = "#fff"

        let feedbackTimer = window.setTimeout(e => {
            this.addEventListener('click', this.event.click)
            this.state.isError = false;
            this.init();
            window.clearTimeout(feedbackTimer);
        }, this.constant.feedbackDuration)
    }

    loading(){
        if(!this.connected || this.disabled) return;
        this.$container.style.cursor = "wait";
        this.state.isLoading = true;
        this.removeEventListener("click", this.event.click)
        this.style.setProperty("--background-color", this.state.initial.hoverBackgroundColor);
        this.style.setProperty("--color", this.state.initial.hoverColor);
        this.icon = "circle-notch";
        this.type = "solid";
        this.state.spin = true;
        this._updateRendering();
    }

    adoptedCallback(){
        //console.log('adoptedCallback');
    }

    disconnectedCallback() {
        this.connected = false;
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        switch(attrName){
            case "disabled":
                this.disabled = newVal || newVal === ""? true : false;
                this.disabled ? this.disable() : this.init();
                break;
            default:
                this[attrName] = newVal;
        }
    }

    get shadowRoot(){return this._shadowRoot;}
    set shadowRoot(value){ this._shadowRoot = value}

    get value(){ return this.model.value; }
    set value(value){
        this.model.value = value;
        this._updateRendering();
        this._updateEvent()
    }

    get size(){ return this.model.size}
    set size(value){
        //Size can only be between 1-5
        let number = Number(value);
        number = number < 1? 1: number;
        number = number > 5? 5: number;
        this.model.size = number;
    }

    _updateEvent(){
        this.dispatchEvent(new CustomEvent(this.defaultEventName, {detail: this.model }));
    }

    _getFontClassType(){
        switch(this.type){
            case "brand":
                return "fab";
            case "light":
                return "fal";
            case "regular":
                return "far";
            default:
                return "fas";
        }
    }

    _renderIcon(){
        this.$icon.className = `${this._getFontClassType()} fa-${this.icon} ${this.state.spin? "fa-spin": ""}`;
        this.$icon.style.fontSize = `${this.size}em`;
        this.$container.style.width = `${this.size * 2}em`
        this.$container.style.height = `${this.size * 2}em`
        this.$container.style.borderRadius = `${this.size}em`
    }

    _updateRendering() {
        if(!this.model.type || !this.model.icon || !this.$container) return;
        this._renderIcon();
        this.disabled? this.disable() : this.enable();
    }
}

window.customElements.define('ui-button-icon', UIButtonIcon);
