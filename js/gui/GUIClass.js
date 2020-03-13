/*
    * Origin ref from under URL
    https://github.com/dataarts/dat.gui/blob/master/API.md
    
    * DAT.GUI
    particle
    https://labs.phaser.io/edit.html?src=src/game%20objects\particle%20emitter\particle%20editor.js
    physics sprite
    https://labs.phaser.io/edit.html?src=src/physics\arcade\body%20controls.js
    matter
    audio
    https://labs.phaser.io/edit.html?src=src/audio\HTML5%20Audio\Loop%20Delay.js
    https://labs.phaser.io/view.html?src=src/audio\Web%20Audio\Seek.js
    world view
    https://labs.phaser.io/edit.html?src=src/camera\move%20camera%20with%20keys.js

    * DAT.GUI Control
    press 'H' to toggle the GUI visibility

    * Another Ref
    https://github.com/koreezgames/phaser3-particle-editor
*/
/*
    END GOAL:
        you can get name when you over the objects,
        and if you click it, you can get its properties in custom GUI list.
        (my wish is load, save json from phaser scene, then flexible implement,
        for each gameobjects, but this is gonna be hard so i just drawback for next version)
*/

"use strict";

// import * as dat from './lib/DatGUILib.js'; // import GUI lib
// import GUIcss from './lib/DatGUIcss'; // import GUI CSS

// lib
import LibClass from './lib/index.js'; // import whole GUI
// debug console utils
import {DebugConsole, DebugConsoleLogOut} from '../utils/DebugConsoleFunc.js';
// root
import TypeSortManager from './TypeSortManager.js';
import FolderManager from './FolderManager.js';
import SaveManager from './SaveManager.js';
import DebugBoxClass from './DebugBoxClass.js';


export class GUIClass {
    constructor(_tmpHandOverObj) {
        this.libs = new LibClass(_tmpHandOverObj.css);
        this.scene = undefined;
        this.objList = undefined; // all game object list
        this.conAlert = '_PGI System_ :';
        this.URLPath = this.initConsole(this.libs.getGUIcssObj(), DebugConsole);
        // this.statusManager = this.initChckStatusManager(this.status);
        this.overConfig = this.initOverConfig();
        this.focusConfig = this.initFocusConfig();
        this.typeSort = new TypeSortManager(_tmpHandOverObj.scene);
        this.folder = new FolderManager(this.libs.getGUILib(), this.typeSort);
        this.save = new SaveManager();
        this.debugBox = new DebugBoxClass();
    }
    create(_scene) {
        this.createETCClass(_scene);
        this.createBasicFolder(_scene, this.libs, this.folder, this.folder.getBasicFolder(), this.debugBox);
        this.createFocusFolder(_scene, this.debugBox, this.folder, this.typeSort);
        this.folder.chckOpenAllList();
    }
    createETCClass(_scene) {
        this.folder.create(_scene);
        this.save.create(_scene);
        this.debugBox.create(_scene);
    }
    update(_time, _delta) {
        this.debugBox.update(_time, _delta, this.objList);
    }


    initConsole(_cssObj, _debugConsole) {
        let tmpName = 'PGInspector.js';
        let tmpVersion = '1.1.0';
        let tmpURL = 'https://github.com/SilverTree7622/Phaser3_GUI_inspector';
        _debugConsole({
            name: tmpName,
            version: tmpVersion,
            initConfig: _cssObj,
            url: tmpURL
        });
    }
    initChckStatusManager(_statusManager) {
        let tmpSM;
        if (_statusManager) {
            tmpSM = _statusManager;
            console.log(this.conAlert, 'USING STATUS MANAGER');
        }
        else {
            tmpSM = undefined;
            console.log(this.conAlert, 'NOT USING STATUS MANAGER');
        }
        return tmpSM;
    }
    initOverConfig() {
        let tmpOC = {};
        tmpOC.status = false;
        tmpOC.gameObj = undefined;
        return tmpOC;
    }
    initFocusConfig() {
        let tmpFC = {};
        tmpFC.status = false;
        tmpFC.gameObj = undefined;
        return tmpFC;
    }
    createFocusFolder(_scene, _debugBox, _folder, _typeSort) {
        let tmpDisplayList = undefined;
        tmpDisplayList = _scene.children;
        this.objList = tmpDisplayList.list;
        _typeSort.createFocusFolder(this.objList, _folder, DebugConsoleLogOut);
        this.createFocusFolderOverEvent(_scene, _debugBox);
        this.createFocusFolderFocusEvent(_scene, _debugBox, _folder);
    }

    createFocusFolderOverEvent(_scene, _debugBox) {
        // just pointer over obj
        _scene.input.on('gameobjectover', (_pointer, _gameObj) => {
            if (!this.chckGameObjIsFocusOnGUI(_gameObj)) {
                this.setPointerOver(_gameObj);
                _debugBox.setOver(_gameObj);
                this.setGameObjOver(_gameObj);
            } else {}
        });
        // when out from pointer over obj
        _scene.input.on('gameobjectout', (_pointer, _gameObj) => {
            if (!this.chckGameObjIsFocusOnGUI(_gameObj)) { // not focus
                this.clearPointerOver(_gameObj);
                _debugBox.clearOverGameObj();
                this.setGameObjOver();
            } else {}
        });
    }
    createFocusFolderFocusEvent(_scene, _debugBox, _folder) {
        // when want to focus logic
        let tmpKey = _scene.input.keyboard.createCursorKeys(); // cursor key 
        _scene.input.on('gameobjectdown', (_pointer, _gameObj) => {
            // if middle button pressed
            if (this.chckCommandKey(tmpKey, _pointer)) {
                this.runFocusLogic(_scene, _gameObj, _debugBox, _folder);
            } else {}
        });
        // when press command SHIFT + F
        _scene.input.keyboard.on('keydown-F', () => {
            if (this.chckCommandKey_F(tmpKey)) {
                // set gameObj via which pointer over on
                let tmpGameObj = this.getGameObjOver();
                this.runFocusLogic(_scene, tmpGameObj, _debugBox, _folder);
            } else {}
        });
    }
    runFocusLogic(_scene, _gameObj, _debugBox, _folder) {
        // isFocusOnGUI boolean is true
        // (if u run focusCommand on the focus game object)
        if (this.chckGameObjIsFocusOnGUI(_gameObj)) {
            // clear the focus object
            this.runFocusLogic_focus_clear(_gameObj, _debugBox, _folder);
        }
        // isFocusOnGUI boolean is false
        // (if u run focusCommand on the not focus game object)
        else {
            if (this.getGameObjFocus()) {
                // clear the focus during object focusing
                // init focus check
                this.runFocusLogic_focus_clear(this.focusConfig.gameObj, _debugBox, _folder);
            }
            else {
                // pure game object focus
                // set to this game object
                this.runFocusLogic_focus_pure(_scene, _gameObj, _debugBox, _folder);
            }
        }
    }
    runFocusLogic_focus_clear(_gameObj, _debugBox, _folder) {
        // console.log('focus clear');
        this.clearFocus(_gameObj);
        this.setFocusConfig(false);
        _debugBox.clearFocusGameObj();
        _folder.setBasicFocusFolder();
        _folder.back2Basic(_gameObj.guiIdx);
    }
    runFocusLogic_focus_pure(_scene, _gameObj, _debugBox, _folder) {
        // console.log('focus pure');
        if (_gameObj) {
            this.setFocusConfig(true, _gameObj);
            this.setFocus(_scene, _gameObj);
            _debugBox.setFocus(_gameObj);
            _folder.setBasicFocusFolder(_gameObj);
        }
        else {
            // nothing is on the pointer so basically nothing happen
        }
    }
    chckCommandKey(_tmpKey, _pointer) {
        let tmpBool = undefined;
        if ((_tmpKey.shift.isDown && _pointer.leftButtonDown())  // shift + mouse left click
            ||
            (!_pointer.rightButtonDown() && !_pointer.leftButtonDown()) // mouse middle button
            ) {
            tmpBool = true;
        }
        else { tmpBool = false; }
        return tmpBool;
    }
    chckCommandKey_F(_tmpKey) {
        let tmpBool = (_tmpKey.shift.isDown) ? true : false; // is shift down?
        return tmpBool;
    }
    setGameObjOver(_gameObj) {
        this.overConfig.gameObj = _gameObj;
    }
    setGameObjFocus(_gameObj) {
        this.focusConfig.gameObj = _gameObj;
    }
    setOverConfig(_status, _gameObj) {
        this.overConfig.status = _status;
        this.overConfig.gameObj = _gameObj;
    }
    setFocusConfig(_status, _gameObj) {
        this.focusConfig.status = _status;
        this.focusConfig.gameObj = _gameObj;
    }
    getGameObjOver() {
        return this.overConfig.gameObj;
    }
    getGameObjFocus() {
        return this.focusConfig.gameObj;
    }
    chckGameObjIsFocusOnGUI(_gameObj) {
        let tmpGameObjBoolean = (_gameObj) ? _gameObj.isFocusOnGUI : null;
        return tmpGameObjBoolean;
    }
    createBasicFolder(_scene, _lib, _folder, _basic, _debugBox) { // create basic pointer
        let tmpPointer = undefined;
        let tmpObj = undefined;
        let tmpFocus = undefined;
        let tmpObjProperties = {
            GUIIdx: 'NONE',
            name: 'NONE',
            type: 'NONE',
            texture: 'NONE'
        };
        // focus off function
        let tmpFocusFunc = () => {
            this.clearFocus();
            _folder.setBasicFocusFolder();
            _debugBox.clearFocusGameObj();
        }
        // cross2FocusObj
        let tmpGo2ThisFunc = () => {
            _folder.cross2FocusObj(this.focusConfig.gameObj, this.objList);
        };
        let tmpFocusProperties = {
            GUIIdx: 'NONE',
            name: 'NONE',
            type: 'NONE',
            texture: 'NONE',
            GUI_FOCUS_OFF: tmpFocusFunc,
            GUI_GO_2_DETAIL: tmpGo2ThisFunc
        };

        // setting folder hierarchy list
        _lib.addFolderInBasic(_basic);
        tmpPointer = _basic.addFolder('Pointer');
        tmpPointer.add(_scene.input, 'x').listen();
        tmpPointer.add(_scene.input, 'y').listen();
        tmpObj = _basic.addFolder('Obj');
        tmpObj.add(tmpObjProperties, 'GUIIdx').listen();
        tmpObj.add(tmpObjProperties, 'name').listen();
        tmpObj.add(tmpObjProperties, 'type').listen();
        tmpObj.add(tmpObjProperties, 'texture').listen();
        tmpFocus= tmpObj.addFolder('Focus'); // add to Parent Obj folder
        tmpFocus.add(tmpFocusProperties, 'GUIIdx').listen();
        tmpFocus.add(tmpFocusProperties, 'name');
        tmpFocus.add(tmpFocusProperties, 'type');
        tmpFocus.add(tmpFocusProperties, 'texture');
        tmpFocus.add(tmpFocusProperties, 'GUI_FOCUS_OFF'); // function
        tmpFocus.add(tmpFocusProperties, 'GUI_GO_2_DETAIL'); // function

        _folder.push2FolderList(tmpPointer, 'basic');
        _folder.push2FolderList(tmpObj, 'basic');
    }
    // create each custom folder from Phaser.scene.displayList
    createCustom(_scene, _custom, _typeSort) {
        let tmpLength = this.objList.length;
        for (var i=0; i<tmpLength; i++) {
            let tmpFolderInCustom = this.folder.add2CustomFolder(i);
            _typeSort.chckObjType(_custom, i, tmpFolderInCustom, this.objList);
        }
    }
    setFocus(_scene, _gameObj) {
        _gameObj.isFocusOnGUI = true;
        this.setFocusPerformance(_scene, _gameObj);
    }
    setFocusPerformance(_scene, _gameObj) { // flickering tween performance
        _gameObj.focusTw = _scene.tweens.addCounter({
            from: 255, to: 120,
            duration: 350, ease: 'Linear', repeat: -1, yoyo: true,
            onStart: () => {
                this.setStoreConfig('BASIC', _gameObj);
            },
            onUpdate: () => {
                if (_gameObj.isFocusOnGUI) {
                    let tmpValue = ~~(_gameObj.focusTw.getValue());
                    _gameObj.setTint(Phaser.Display.Color.GetColor(tmpValue, tmpValue, tmpValue));
                }
                else {
                    _gameObj.clearTint();
                    _gameObj.focusTw.remove();
                }
            }
        });
    }
    clearFocus(_gameObj) {
        let tmpObj = undefined;
        (_gameObj) ? (tmpObj = _gameObj) : (tmpObj = this.focusConfig.gameObj);
        // (tmpObj.focusTw) ? this.tryCatchFlow(tmpObj.focusTw.remove) : null;
        tmpObj.setAlpha(1); // temp (should be set alpha to saved alpha value)
        // tmpObj.clearTint();
        tmpObj.isFocusOnGUI = false;
    }
    setPointerOver(_gameObj) {
        _gameObj.setAlpha(0.7);
        this.folder.setBasicOverFolder(_gameObj);
    }
    clearPointerOver(_gameObj) {
        (_gameObj.isTinted) ? _gameObj.clearTint() : null;
        _gameObj.setAlpha(1); // temp (should be set alpha to saved alpha value)
        this.folder.setBasicOverFolder();
    }
    setStoreConfig(_folderType, _gameObj) {
        let tmpFolder = undefined;
        let tmpFocus = undefined;
        if (_folderType === 'BASIC') {
            tmpFolder = this.folder.basic;
            tmpFocus = tmpFolder.tmpStorage.Obj.over;
        }
        else if (_folderType === 'CUSTOM') {
            tmpFolder = this.folder.custom;
            tmpFocus = tmpFolder.tmpStorage.Obj.focus;
        }
        else {}
        tmpFocus.guiIdx = _gameObj.guiIdx;
        try {
            tmpFocus.guiAlpha = _gameObj.alpha;
        } catch (e) {}
        try {
            tmpFocus.guiTint = _gameObj.tint;
        } catch (e) {}
    }
    clearStoreConfig(_folderType) {
        if (_folderType === 'BASIC') {

        }
        else if (_folderType === 'CUSTOM') {

        }
        else {

        }
    }

    // destroy GUI when restart Phaser.Scene
    destroyGUI() {
        this.libs.destroyGUI();
    }

    // WARNING THIS IS TRIAL: config
    saveConfig() {

    }
    loadConfig() {

    }

    tryCatchFlow(_function) {
        try {
            _function();
        }
        catch(e) {}
    }
}
