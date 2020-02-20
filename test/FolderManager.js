
// Folder manager
export default class FolderManager {
    constructor(_GUI, _typeSort) {
        this.GUI = _GUI;
        this.typeSort = _typeSort;
        this.config = this.initConfig();
        this.property = this.initProperty();
        this.basic = this.initBasic();
        this.custom = this.initCustom();
    }
    create(_scene) {
        this.createProperty(_scene);
        this.createBasic();
        this.createCustom();
    }
    update(_time, _delta) {
        this.updateFPS(_delta);
    }
    initConfig() { // config
        let tmpC = {};
        tmpC.openBasicDefault = true;
        tmpC.openCustomDefault = false;
        return tmpC;
    }
    initProperty() { // always check Phaser FPS
        let tmpP = {};
        tmpP.self = [];
        tmpP.FPS = 0;
        return tmpP;
    }
    initBasic() { // basic folder
        let tmpB = {};
        tmpB.folder = undefined;
        tmpB.list = [];
        tmpB.tmpStorage = {
            Obj: {
                over: {
                    guiIdx: 0,
                    guiAlpha: 0,
                    guiTint: undefined
                },
                focus: {
                    guiIdx: 0,
                    guiAlpha: 0,
                    guiTint: undefined
                }
            }
        };
        return tmpB;
    }
    initCustom() { // custom folder
        let tmpC = {};
        tmpC.folder = undefined;
        tmpC.list = [];
        return tmpC;
    }
    createProperty(_scene) {
        this.property.self.push(this.GUI.add(this.property, 'FPS').listen());
    }
    createBasic() {
        this.basic.folder = this.GUI.addFolder('BASIC');
    }
    createCustom() {
        this.custom.folder = this.GUI.addFolder('CUSTOM');
    }
    updateFPS(_delta) { // update temp FPS
        this.property.FPS = (1000/_delta).toFixed(3);
    }
    push2FolderList(_folder, _isBasic) {
        if (_isBasic === 'basic') {
            this.basic.list.push(_folder);
        }
        else if (_isBasic === 'custom') {
            this.custom.list.push(_folder);
        }
        else if (!_isBasic) {
            this.custom.list.push(_folder);
            console.warn('this is not proper way of adding folder, change to string');
        }
        else {
            this.basic.list.push(_folder);
            console.warn('this is not proper way of adding folder, change to string');
        }
    }
    add2CustomFolder(_idx) {
        let tmpFolder = this.custom.folder.addFolder(_idx);
        return tmpFolder;
    }
    // check init open or close
    chckOpenAllList() {
        this.chckOpenBasicList();
        this.chckOpenCustomList();
    }
    chckOpenBasicList() {
        if (this.config.openBasicDefault) {
            let tmpLength = this.basic.list.length;
            this.openFolder(this.basic.folder);
            for (var i=0; i<tmpLength; i++) {
                this.openFolder(this.basic.list[i]);
            }
        }
    }
    chckOpenCustomList() {
        if (this.config.openCustomDefault) {
            let tmpLength = this.custom.list.length;
            this.openFolder(this.custom.folder);
            for (var i=0; i<tmpLength; i++) {
                this.openFolder(this.custom.list[i]);
            }
        }
    }
    // open folder
    openFolder(_folder) {
        _folder.open();
    }
    closeFolder(_folder) {
        _folder.close();
    }

    // EXTERNAL
    setBasicOverFolder(_gameObj) {
        if (_gameObj) {
            let tmpTexture = this.typeSort.setTextureProperty(_gameObj);
            this.basic.list[1].__controllers[0].setValue(_gameObj.guiIdx);
            this.basic.list[1].__controllers[1].setValue(_gameObj.name);
            this.basic.list[1].__controllers[2].setValue(_gameObj.type);
            this.basic.list[1].__controllers[3].setValue(tmpTexture);
        }
        else { // change to all 'NONE'
            let tmpLength = this.basic.list[1].__controllers.length;
            for (var i=0; i<tmpLength; i++) {
                this.basic.list[1].__controllers[i].setValue('NONE');
            }
        }
    }
    setBasicFocusFolder(_gameObj) {
        let tmpFocus = this.basic.list[1].__folders.Focus;
        if (_gameObj) {
            let tmpTexture = this.typeSort.setTextureProperty(_gameObj);
            this.openFolder(tmpFocus);
            tmpFocus.__controllers[0].setValue(_gameObj.guiIdx);
            tmpFocus.__controllers[1].setValue(_gameObj.name);
            tmpFocus.__controllers[2].setValue(_gameObj.type);
            tmpFocus.__controllers[3].setValue(tmpTexture);
        }
        else { // change to all 'NONE'
            this.openFolder(this.basic.folder);
            this.closeFolder(tmpFocus);
            this.closeFolder(this.custom.folder);
            let tmpLength = 3;
            for (var i=0; i<tmpLength; i++) {
                tmpFocus.__controllers[i].setValue('NONE');
            }
        }
    }
    cross2FocusObj(_gameObj, _objList) { // actually cross 2 custom_folder/focus_folder(config)
        if (_gameObj) {
            let tmpObjFolder = this.custom.folder.__folders;
            this.closeFolder(this.basic.folder);
            this.openFolder(this.custom.folder);
            this.openFolder(tmpObjFolder[_gameObj.guiIdx]);
        }
        else {
            console.warn('_inspector SYSTEM_: NONE Focus');
        }
    }
    back2Basic(_idx) {
        let tmpObjFolder = this.custom.folder.__folders;
        this.closeFolder(tmpObjFolder[_idx]);
        this.closeFolder(this.custom.folder);
        this.openFolder(this.basic.folder);
    }
    // get func
    getFolder() {
        let tmpFolder = {};
        tmpFolder.basic = this.basic.folder;
        tmpFolder.custom = this.custom.folder;
        return tmpFolder;
    }
    getList() {
        let tmpList = {};
        tmpList.basic = this.basic.list;
        tmpList.custom = this.custom.list;
        return tmpList;
    }
}