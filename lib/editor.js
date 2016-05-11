'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var ReactDOM = require('react-dom');

var _require = require('./constants/EditorConstants');

var EditorIconTypes = _require.EditorIconTypes;

var EditorHistory = require('./utils/EditorHistory');
var EditorSelection = require('./utils/EditorSelection');

var ColorDropdown = require('./components/ColorDropdown.react');

/**
* @icon: 图标名称 string
* @disabled: 是否禁用 bool
* @onClick: 暴露点击事件 function
* @title: 提示 string
* @active: 是否选中 bool
* @showHtml: 是否当前是显示html属性
* @color: 前景色和背景色
**/
var EditorIcon = React.createClass({
	displayName: 'EditorIcon',

	componentDidMount: function componentDidMount() {
		this.updateStyle();
	},
	componentDidUpdate: function componentDidUpdate() {
		this.updateStyle();
	},
	updateStyle: function updateStyle() {
		var root = ReactDOM.findDOMNode(this.refs.root);
		var icon = this.props.icon;
		switch (this.props.icon) {
			case "forecolor":
			case "backcolor":
				var color = this.props.color ? this.props.color : "transparent";
				root.id = icon + "_" + new Date().valueOf();
				var style = root.childElementCount > 0 ? root.children[0] : document.createElement('style');
				style.innerHTML = ".icon-" + icon + "#" + root.id + ":before{content:'';border-bottom:3px solid " + color + ";}";
				if (root.childElementCount == 0) root.appendChild(style);
				break;
		}
	},
	handleClick: function handleClick(e) {
		var _props = this.props;
		var onClick = _props.onClick;

		var props = _objectWithoutProperties(_props, ['onClick']);

		if (this.props.onClick) {
			this.props.onClick(e, _extends({}, props));
		}
	},
	render: function render() {
		var _props2 = this.props;
		var icon = _props2.icon;
		var active = _props2.active;
		var disabled = _props2.disabled;
		var showHtml = _props2.showHtml;
		var onClick = _props2.onClick;

		var props = _objectWithoutProperties(_props2, ['icon', 'active', 'disabled', 'showHtml', 'onClick']);

		var _disabled = showHtml && icon != "source" && icon != "separator";
		return React.createElement('span', _extends({ ref: 'root', className: "editor-icon icon-" + icon + (active ? " active" : "") + (disabled || _disabled ? " disabled" : ""), onClick: this.handleClick }, props));
	}
});

var EditorToolbar = React.createClass({
	displayName: 'EditorToolbar',

	getInitialState: function getInitialState() {
		// paragraph fontfamily fontsize image formula emotion video map print preview drafts link unlink
		return {
			icons: ["source | undo redo | bold italic underline strikethrough | superscript subscript | ", "forecolor backcolor | removeformat | insertorderedlist insertunorderedlist | selectall | ", "cleardoc  | justifyleft justifycenter justifyright | horizontal"],
			selection: null
		};
	},
	handleIconClick: function handleIconClick(e, state) {
		if (this.props.onIconClick) {
			this.props.onIconClick(e, state);
		}
	},
	getIcons: function getIcons() {
		var editorState = this.props.editorState;
		editorState.icons["undo"] = { disabled: !EditorHistory.canUndo() };
		editorState.icons["redo"] = { disabled: !EditorHistory.canRedo() };

		var icons = this.state.icons;
		var _icons = icons.join(" ").replace(/\|/gm, "separator").split(" ");
		_icons = _icons.filter(function (ico) {
			return ico != "";
		});
		var returnArray = [];
		for (var i = 0; i < _icons.length; i++) {
			returnArray[i] = EditorIconTypes[_icons[i]];
			returnArray[i].onClick = this.handleIconClick;
			returnArray[i].icon = _icons[i];
			if (editorState.icons[_icons[i]]) {
				returnArray[i].disabled = !!editorState.icons[_icons[i]].disabled;
				returnArray[i].active = !!editorState.icons[_icons[i]].active;
				returnArray[i].color = editorState.icons[_icons[i]].color;
			}
			returnArray[i].showHtml = !!editorState.showHtml;
		}
		return returnArray;
	},
	render: function render() {
		var icons = this.getIcons();
		return React.createElement(
			'div',
			{ className: 'editor-toolbar' },
			icons.map(function (icon) {
				var props = icon;
				return React.createElement(EditorIcon, props);
			})
		);
	}
});

var EditorTextArea = React.createClass({
	displayName: 'EditorTextArea',

	getInitialState: function getInitialState() {
		return {
			content: ""
		};
	},
	getContent: function getContent() {
		var target = ReactDOM.findDOMNode(this.refs.root);
		return target.value;
	},
	setContent: function setContent(content) {
		this.setState({
			content: content
		});
	},
	getName: function getName() {
		return "textarea";
	},
	handleChange: function handleChange() {
		var target = ReactDOM.findDOMNode(this.refs.root);
		this.setState({
			content: target.value
		});
	},
	render: function render() {
		return React.createElement('textarea', { ref: 'root', className: 'editor-textarea', value: this.state.content, onChange: this.handleChange });
	}
});

var EditorContentEditableDiv = React.createClass({
	displayName: 'EditorContentEditableDiv',

	getInitialState: function getInitialState() {
		return {
			content: ""
		};
	},
	componentDidMount: function componentDidMount(e) {
		window.addEventListener("mousedown", this.handleWindowMouseDown);
	},
	componentWillUpdate: function componentWillUpdate(e) {
		EditorSelection.addRange();
	},
	componentDidUpdate: function componentDidUpdate(e) {
		EditorSelection.addRange();
	},
	getContent: function getContent() {
		var target = ReactDOM.findDOMNode(this.refs.root);
		return target.innerHTML;
	},
	setContent: function setContent(content) {
		this.setState({
			content: content
		});
	},
	getName: function getName() {
		return "div";
	},
	handleWindowMouseDown: function handleWindowMouseDown(e) {
		EditorSelection.clearRange();
	},
	handleMouseDown: function handleMouseDown(e) {
		EditorSelection.clearRange();
		window.addEventListener("mouseup", this.handleMouseUp);
	},
	handleMouseUp: function handleMouseUp(e) {
		EditorSelection.createRange();
		if (this.props.onRangeChange) this.props.onRangeChange(e);
		window.removeEventListener("mouseup", this.handleMouseUp);
	},
	render: function render() {
		return React.createElement('div', { ref: 'root', className: 'editor-contenteditable-div',
			onMouseUp: this.handleMouseUp,
			onMouseDown: this.handleMouseDown,
			contentEditable: true, dangerouslySetInnerHTML: { __html: this.state.content } });
	}
});

var saveSceneTimer = null;
var maxInputCount = 20;
var lastKeyCode = null;
var keycont = 0;

var Editor = React.createClass({
	displayName: 'Editor',

	getInitialState: function getInitialState() {
		return {
			editorState: {
				showHtml: false,
				icons: {}
			}
		};
	},
	componentDidMount: function componentDidMount() {
		EditorHistory.clear();
		this.refs.editarea.setContent(this.props.defaultContent ? this.props.defaultContent : "<p>This is an Editor</p>");
		var editarea = ReactDOM.findDOMNode(this.refs.editarea);
		var isCollapsed = true;
		editarea.addEventListener('keydown', this.handleKeyDown);
		editarea.addEventListener('keyup', this.handleKeyUp);
	},
	autoSave: function autoSave() {
		EditorHistory.execCommand('autosave', false, null);
		this.handleRangeChange();
	},
	handleKeyDown: function handleKeyDown(evt) {
		var keyCode = evt.keyCode || evt.which;
		var autoSave = this.autoSave;
		if (!evt.ctrlKey && !evt.metaKey && !evt.shiftKey && !evt.altKey) {
			if (EditorHistory.getCommandStack().length == 0) {
				autoSave();
				keycont = 0;
			}
			clearTimeout(saveSceneTimer);
			saveSceneTimer = setTimeout(function () {
				var interalTimer = setInterval(function () {
					autoSave();
					keycont = 0;
					clearInterval(interalTimer);
				}, 300);
			}, 200);
			lastKeyCode = keyCode;
			keycont++;
			if (keycont >= maxInputCount) {
				autoSave();
				keycont = 0;
			}
		}
	},
	handleKeyUp: function handleKeyUp(evt) {
		var keyCode = evt.keyCode || evt.which;
		if (!evt.ctrlKey && !evt.metaKey && !evt.shiftKey && !evt.altKey) {
			// some handle
		}
	},
	componentDidUpdate: function componentDidUpdate() {
		var editorState = this.state.editorState;
		switch (editorState.icon) {
			case "source":
				this.refs.editarea.setContent(editorState.content);
				break;
			case "cleardoc":
				this.refs.editarea.setContent(editorState.content);
				break;
		}
	},
	genEditArea: function genEditArea() {
		var showHtml = this.state.editorState.showHtml;
		if (showHtml) {
			return React.createElement(EditorTextArea, { ref: 'editarea' });
		} else {
			return React.createElement(EditorContentEditableDiv, { ref: 'editarea', onRangeChange: this.handleRangeChange });
		}
	},
	exchangeRangeState: function exchangeRangeState(editorState) {
		var rangeState = EditorSelection.getRangeState();
		for (var icon in rangeState) {
			if (!editorState.icons[icon]) editorState.icons[icon] = rangeState[icon];else {
				switch (icon) {
					case "forecolor":
					case "backcolor":
						editorState.icons[icon].color = rangeState[icon].color;
						break;
				}
				editorState.icons[icon].active = rangeState[icon].active;
			}
		}
		return editorState;
	},
	handleRangeChange: function handleRangeChange() {
		var editorState = this.state.editorState;
		editorState = this.exchangeRangeState(editorState);
		this.setState({
			editorState: editorState
		});
	},
	getOffsetRootParentPosition: function getOffsetRootParentPosition(target) {
		var position = { x: 0, y: 0, w: 0, h: 0 };
		var root = ReactDOM.findDOMNode(this.refs.root);
		position.w = target.offsetWidth;
		position.h = target.offsetHeight;
		position.x = target.offsetLeft;
		position.y = target.offsetTop;
		var offsetParent = target.offsetParent;
		while (offsetParent != root) {
			position.x += offsetParent.offsetLeft;
			position.y += offsetParent.offsetTop;
			offsetParent = offsetParent.offsetParent;
		}
		return position;
	},
	handleToolbarIconClick: function handleToolbarIconClick(e, state) {
		e = e || event;
		var target = e.target || e.srcElement;
		var offsetPosition = this.getOffsetRootParentPosition(target);

		var handleRangeChange = this.handleRangeChange;

		var editorState = this.state.editorState;
		EditorSelection.addRange();
		switch (state.icon) {
			case "source":
				editorState.showHtml = !editorState.showHtml;
				state.active = editorState.showHtml;
				editorState.content = this.refs.editarea.getContent();
				break;
			case "undo":
				EditorHistory.undo();
				break;
			case "redo":
				EditorHistory.redo();
				break;
			case "bold":
			case "italic":
			case "underline":
			case "strikethrough":
			case "subscript":
			case "superscript":
			case "removeformat":
			case "insertorderedlist":
			case "insertunorderedlist":
			case "selectall":
			case "justifyleft":
			case "justifyright":
			case "justifycenter":
				EditorHistory.execCommand(state.icon, false, null);
				break;
			case "forecolor":
				offsetPosition.y += offsetPosition.h + 5;
				this.refs.color.open(offsetPosition, function (e, color) {
					EditorHistory.execCommand('forecolor', false, color);
					handleRangeChange();
				});
				break;
			case "backcolor":
				offsetPosition.y += offsetPosition.h + 5;
				this.refs.color.open(offsetPosition, function (e, color) {
					EditorHistory.execCommand('backcolor', false, color);
					handleRangeChange();
				});
				break;
			case "cleardoc":
				editorState.content = "<p><br/></p>";
				break;
			case "horizontal":
				EditorHistory.execCommand('inserthtml', false, "<hr/><p><br/></p>");
				break;

		}
		// setState
		editorState.icons[state.icon] = state;
		editorState.icon = state.icon;
		EditorSelection.createRange();
		// range state
		editorState = this.exchangeRangeState(editorState);
		this.setState({
			editorState: editorState
		});

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	},
	render: function render() {
		var editArea = this.genEditArea();
		return React.createElement(
			'div',
			{ ref: 'root', className: 'editor-container editor-default', onBlur: this.handleRangeChange },
			React.createElement(EditorToolbar, { editorState: this.state.editorState, onIconClick: this.handleToolbarIconClick }),
			editArea,
			React.createElement(ColorDropdown, { ref: 'color' })
		);
	}
});

module.exports = Editor;