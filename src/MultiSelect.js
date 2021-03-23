import * as React from 'react';
import AutosizeInput from 'react-input-autosize';
import {
  CloseCircleOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  EllipsisOutlined,
  
} from '@ant-design/icons';
import './MultiSelect.css';
export class MultiSelectOption extends React.Component{
	render(){
		const classes=["multi-select-option-component"];
		if(this.props.className)
			classes.push(this.props.className);
		return <div className={classes.join(" ")} style={this.props.style}>
				{this.props.children}
			</div>
	}
}
export class MultiSelect extends React.Component{
	//References
	multiselectoptioncontainer = null;
	multiselectinput = null;
	multiselectinputarea = null;
	multiselectmenucontainer = null;
	multiselectmenu = null;
	multiselectmenuarea = null;
	multiselectinputcontainer = null;
	
	//Defaults
	defaultOptionContainerHeight = 180;
	defaultOptionMenuHeight = 30;
	overflow = false;

	_cache = {};
	defaultCache = {};
	constructor(props){
		super(props);
		this._cache = props.cache === this.defaultCache ? {} : props.cache;

		this.state ={
			inputValue: '',
			isopen: false,
			selectedItems: 0,
			options: props.children,
			focusedIndex: -1,
			disabled: [],
			id:[],
			values: []
		}
	}
	
	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
		document.addEventListener('mousedown', this.handleClickInside);
		this.checkDisabled();
		this.checkDefaultSelected();
		if(this.props.defaultAllSelected)
			this.selectAllItems();
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickInside);
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

	componentDidUpdate(prevProps, prevState) {
		this.scrollToBottom();
		if(prevProps.loading && this.props.loading === false){
			this.setState({options:this.props.children})
		}
		if(this.props.onChange){
			if (!(this.state.values.length === prevState.values.length && this.state.values.every((v,i)=> v === prevState.values[i]))) //If values changed call props onChange function
			{
				this.props.onChange({value:this.state.values,id:this.state.id});
			}
		}
	  }

	scrollToBottom = () => {
		if(this.multiselectinputarea)
			this.multiselectinputarea.scrollTop = this.multiselectinputarea.scrollHeight;
	}
	checkDisabled = () => {
		const disabled = [];
		if(this.props.children)
		(this.props.children).forEach(element => {
			if(element.props.disabled)
			{
				disabled.push(element.props.value);
			}
		});
		this.setState({disabled})
	}
	checkDefaultSelected = () => {
		const values = [];
		const id = [];
		let selectedItems = 0;
		if(this.props.children)
		(this.props.children).forEach(element => {
			if(element.props.defaultSelected)
			{
				values.push(element.props.value);
				id.push(element.props.id);
				selectedItems++;
			}
				
		});
		this.setState(prevState => ({values,id,selectedItems}))
	}
	All = () => {
		if(this.state.selectedItems === ((this.props.children).length-this.state.disabled.length))
			this.clearItems();
		else
			this.selectAllItems();
	}
	handleChange = (id, value, disabled) => {
		if(disabled)
			return;
		const index = this.state.values.findIndex(x => x === value);
		this.focusInput();
		if(index !== -1)
			this.removeItem(index);
		else
			this.addItem(id,value);
	}
	handleKeyDown = event => {
		if(event.keyCode === 8 && this.state.inputValue === "")	//Backspace
			this.popItem();
		if(event.keyCode === 13)	//Enter key
			this.toggleSelection();
		if(event.keyCode === 38)	//Up arrow key
			this.focusPrevious();
		if(event.keyCode === 40)	//Down arrow key
			this.focusNext();
	}
	toggleSelection = () => {		//Select-Unselect options
		const optionsVal = [];
		const optionsID = [];
		this.state.options.forEach(element => {
			optionsVal.push(element.props.value);
			optionsID.push(element.props.id);
		});
		const focusedItemVal = optionsVal[this.state.focusedIndex];
		const focusedItemID = optionsID[this.state.focusedIndex];
		if(this.state.disabled.findIndex(x => x === focusedItemVal) !== -1)
			return;
		const index = this.state.values.findIndex(x => x === focusedItemVal);
		if(index !== -1)
			this.removeItem(index);
		else
			this.addItem(focusedItemVal,focusedItemID);
	}
	removeItem = (index) => {	
		this.focusInput();
		this.setState({
			values: this.state.values.filter((_, i) => i !== index),
			id: this.state.id.filter((_, i) => i !== index),
			selectedItems:this.state.selectedItems-1
		});
	}
	addItem = (id,value) => {
		this.setState({
			values:[...this.state.values,value],
			id:[...this.state.id,id],
			selectedItems:this.state.selectedItems+1
		});
	}
	selectAllItems = () => {
		let optionsVal = [];
		let optionsID = [];
		if(this.props.children)
			(this.props.children).forEach(element => {
				if(!element.props.disabled)
				{
					optionsVal.push(element.props.value);
					optionsID.push(element.props.id);
				}
			});
		this.setState({
			values:optionsVal, 
			id:optionsID, 
			selectedItems:optionsVal.length
		});
	}
	clearItems = () => {
		this.setState({
			values:[], 
			id:[], 
			selectedItems:0
			});
	}
	popItem = () => {
		const tmpVal = this.state.values;
		const tmpID = this.state.id;
		tmpVal.pop();
		this.setState({
			values: tmpVal,
			id: tmpID,
			selectedItems:tmpVal.length
			},()=> this.props.onChange({value:this.state.values,id:this.state.id}));
	}
	isSelected = value => {
		const index = this.state.values.findIndex(x => x === value);
		if(index !== -1)
			return true;
		else
			return false;
	}
	toggleMenu = () => {
		if(this.props.disabled)
			return;
		if(this.state.isopen)
			this.closeMenu();
		else
			this.openMenu();
	}
	openMenu = () => {
		if(this.props.disabled)
			return;
		this.checkDisabled();
		if(!this.state.isopen)
			this.setState({isopen:true, options:this.props.children})	//Hack to update the options to check if any of its props were updated
		this.focusInput();
	}
	closeMenu = () => {
		if(this.props.onMenuClosed)
			this.props.onMenuClosed({value:this.state.values,id:this.state.id});
		this.setState({isopen:false, inputValue:""});
	}

	focusInput = () => {
		if(this.state.isopen)
		{
			this.multiselectinput.focus();
		}
	}
	updateInputValue = event => {
		const newState = event.target.value;
		let newOptions;
		if(this.props.onSearch)
		{
			newOptions = this.props.onSearch(newState)
			this.setState({
				inputValue: newState,
			});
		}
		else{
			newOptions = this.search(this.props.children,newState);
			let focusedIndex = -1;
			if(newState !== "" && newOptions.length > 0)
				focusedIndex = 0;
			this.setState({
				inputValue: newState, 
				options: newOptions, 
				focusedIndex
			});
		}
	}
	search = (list, text) => 
	{	
		return list.filter(i => i.props.value.toLowerCase().includes(text.toLowerCase()) );
	}

	focusPrevious = () => {
		let focusedIndex = this.state.focusedIndex;
		if(focusedIndex > 0)
			focusedIndex--;
		this.setState({focusedIndex});
	}
	focusNext = () => {
		let focusedIndex = this.state.focusedIndex;
		if(focusedIndex < (this.state.options.length - 1))
			focusedIndex++;
		this.setState({focusedIndex});
		
	}
	optionHover = (index) => {
		this.setState({focusedIndex:index});
	}
	clearFocused = () => {
		this.setState({focusedIndex:-1});
	}
	handleClickInside = event => {
		if (this.state.isopen && this.multiselectinputcontainer.contains(event.target)) { 
			this.focusInput();
		}
	}
	handleClickOutside = event => {
        if (this.state.isopen && !(this.multiselectoptioncontainer.contains(event.target)||this.multiselectinputcontainer.contains(event.target))) { 
			this.closeMenu();
		}
    }
	
	renderLabel = () => {
		return <div className="multi-select-label" >
					{this.props.label?typeof this.props.label === "function" ?
						this.props.label(this.state.values):
						this.props.label
					:null}
					{/* {this.props.tooltip?
						<Tooltip title={this.props.tooltip}><InfoCircleOutlined style={{marginLeft: '0.5rem'}} />
						</Tooltip>
					:null} */}
				</div>
	}

	renderMenu = () => {
		let classes = ["multi-select-menu"];
		
		let overFlowIcon = null;
		if(this.multiselectmenuarea !== null)
		{
			const inputareawidth = this.multiselectmenuarea.getBoundingClientRect().width;
			let overflowWidth = this.props.width-50;	//50 is the offset of existing icons
			if(this.overflow)	//Caters for when overflow icon is already present
				overflowWidth -= 20;
			if(this.props.showItemsOnMenuClosed && (inputareawidth>overflowWidth))
			{
				this.overflow = true;
				overFlowIcon = <EllipsisOutlined style={{marginLeft:5, fontSize:16, color: "#999"}}  />
			}
			else
				this.overflow = false
		}
		
		if (this.props.borderless)
			classes.push("multi-select-borderless");
		if (this.props.disabled)
			classes.push("multi-select-disabled");
		const menuStyle = this.props.style?{...this.props.style, width:this.props.width||this.props.style.width||"auto"}:{width:this.props.width};
		const renderedMenu = (<div ref={element => this.multiselectmenu = element} className={classes.join(" ")} onClick={this.openMenu} style={menuStyle}>
				{this.renderMenuClosed()}
				<div className="multi-select-icons">
					{overFlowIcon}
					{(this.state.values.length > 0 && this.props.disabled === false)? <CloseCircleOutlined className="multi-select-clear" onClick={this.clearItems} type="close-circle-o" />:null}
					<CaretDownOutlined className="multi-select-arrow" type="down" onClick={this.toggleMenu}/>
				</div>
			</div>)
		return renderedMenu;
	}
	renderInput = () => {
		const menuWidth = this.multiselectmenu.getBoundingClientRect().width;
		const renderedInput = (<div ref={element => this.multiselectinputcontainer = element} style={{position:"absolute",  zIndex:10000}}>
			<div className="multi-select-input" style={{width:this.props.optionMenuWidth||menuWidth}}>
				<div className="multi-select-input-area" style={{height:this.props.optionMenuHeight||this.defaultOptionMenuHeight}} ref={(input) => { this.multiselectinputarea = input; }}>
					{this.renderValue()}
					<AutosizeInput className="multi-select-auto-input" autoFocus value={this.state.inputValue} onKeyDown={this.handleKeyDown} onChange={this.updateInputValue} inputRef={(input) => { return this.multiselectinput = input; }}   />
				</div>
				<div className="multi-select-icons">
					{this.state.values.length > 0 ? <CloseCircleOutlined className="multi-select-clear" onClick={this.clearItems} type="close-circle-o" />:null}
					<CaretUpOutlined className="multi-select-arrow" type="up" onClick={this.toggleMenu}/>
				</div>
			</div>
			{this.renderOptions()}
		</div>)
		
		return renderedInput;
	}
	renderMenuClosed = () => {
		return <div className="multi-select-menu-closed">
				{
					this.props.showItemsOnMenuClosed?
					<div className="multi-select-input-area-closed" ref={(input) => {this.multiselectmenuarea = input; }}>
						{this.state.selectedItems === 0 ?
						<input className="multi-select-placeholder" disabled={this.props.disabled} placeholder={this.props.placeholder||"Select..."}></input>
						:null}
						{this.renderValue()}
					</div>
					:this.state.selectedItems === 0 ? 
						<input className="multi-select-placeholder" disabled={this.props.disabled} placeholder={this.props.placeholder||"Select..."}></input>:
						((this.state.selectedItems === ((this.props.children).length- this.state.disabled.length))&&this.props.allSelectedText) ? 
							<span>
								{this.props.allSelectedText?typeof this.props.allSelectedText === "function" ?
									this.props.allSelectedText(this.state.values.length):
									this.props.allSelectedText
								:null}
							</span>:
							<span>{this.state.selectedItems} {this.props.customSelectedText||"items selected"}</span>	
				}
			</div>
	}

	renderOptions = () => {
		const allSelected = this.state.selectedItems === ((this.props.children|| {}).length-this.state.disabled.length);
		const optionContainerWidth = this.props.matchWidth ? (this.props.optionMenuWidth||this.multiselectmenu.getBoundingClientRect().width) : "auto";
		const allButtonClasses=["multi-select-all-btn"];
		const menuClass=[];
		if(allSelected)
			allButtonClasses.push("multi-select-all-btn-selected")
		if(this.props.openUp)
			menuClass.push("multi-select-up")

		return <div className={menuClass.join(" ")}>
				<div className="multi-select-option-container" style={{width:optionContainerWidth, minWidth:this.multiselectmenu.getBoundingClientRect().width}}  ref={element => this.multiselectoptioncontainer = element}>
					{this.props.onSearch?
						<div className="multi-select-info-container"><span className="multi-select-info" style={{marginLeft:"3px"}}>Selected {this.state.selectedItems} items</span></div>
						:<div className="multi-select-info-container"><div className={allButtonClasses.join(" ")} onClick = {this.All}><input type="checkbox" checked={allSelected} /><span>All</span></div>
						<span className="multi-select-info">Selected {this.state.selectedItems} items out of {(this.props.children|| {}).length - this.state.disabled.length}</span></div>
					}
					<div role="listbox" className="multi-select-options-container" style={{maxHeight:this.props.menuHeight||this.defaultOptionContainerHeight}}>
						{this.state.options.map(this.renderOption)}
					</div>
				</div>
			</div>
	}
	renderOption = (option, index) => {
		const classes = ["multi-select-option"];
		const disabled = option.props.disabled;
		if(index === this.state.focusedIndex)
		{
			classes.push("multi-select-option-focused")
		}
		if(disabled)
		{
			classes.push("multi-select-disabled")
		}
		if(this.props.hideSelected &&  this.isSelected(option.props.value))
			return;
		return <div key={option.props.value} onClick={() => this.handleChange(option.props.id, option.props.value, disabled)} onMouseOver={()=> this.optionHover(index)} onMouseOut = {() => this.clearFocused()} className={classes.join(" ")}>
			{this.props.hideSelected?null:<input type="checkbox" className="multi-select-checkbox" disabled={disabled} checked={this.isSelected(option.props.value)} />}
			<span>{option}</span>
		</div>
	}
	renderValue = () => {
		let valueArray = this.state.values;
		return valueArray.map((item, i) => {
			return (
				<div key={i} className="select-value">
					<span className={"Select-value-label"} role="option" aria-selected="true" id={this.props.id}>
						{this.props.tags?this.props.tags({value:item,id:this.state.id[i]}):item}
					</span>
					<span className="Select-value-icon"
						aria-hidden="true"
						onClick={() => this.removeItem(i)}>
						&times;
					</span>
				</div>
			);
		});
	}
	render() {
		const classes=["multi-select-container"];
			  if(this.props.className)
				  classes.push(this.props.className);
			  return <div className={classes.join(" ")}>
					  {(this.props.label||this.props.tooltip)?this.renderLabel():null}
					  <div className="multi-select-body">
						  {this.state.isopen?this.renderInput():null}
						  {this.renderMenu()}
					  </div>
				  </div>
	  }
}

export default MultiSelect;