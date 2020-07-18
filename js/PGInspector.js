
// FINFAL WORK: ADD TO WINDOW OBJECT
window.PhaserGUIAction = PhaserGUIAction; // lib act function
window.PhaserGUI = undefined; // GUI self class

// Main Phaser3 GUI function **
function PhaserGUIAction(_scene, _configObj) {
    let tmpGUIInstance; // GUI instance

    // check GUI object is already exist
    ChckGUIObj();

    // chck (scene, css Opacity object / phaser scenes)
    let tmpConfigObj = ChckConfigObj(_scene, _configObj);

    // pure declare for callback or plan
    let tmpGUIClass;
    let tmpStatusReturn;
    
    // setting value
    tmpGUIClass = InitGUIClassSetting();
    tmpStatusReturn = ChckStatusManager(tmpConfigObj.status);
    tmpGUIInstance = SetCreateUpdateInstance( tmpConfigObj, tmpStatusReturn, tmpGUIClass );

    StoreGUI(tmpGUIInstance);

    // return just phaser scene
    return tmpGUIInstance;
}

// detailed functions
function ChckGUIObj() {
    // if exist, destory GUI
    if (window.PhaserGUI) {
        window.PhaserGUI.destroyGUI();
        window.PhaserGUI = undefined;
    } else {}
}
function ChckConfigObj(_scene, _configObj) {
    // init config structure
    let tmpReturn = {
        css: {
            alpha: undefined,
            right: undefined,
            top: undefined
        },
        status: undefined,
        scene: undefined
    };
    // check is init config
    TryCatchObj(tmpReturn, 'scene', _scene);
    if (typeof _configObj === 'object') {
        TryCatchObj(tmpReturn.css, 'alpha', _configObj.alpha);
        TryCatchObj(tmpReturn.css, 'right', _configObj.right);
        TryCatchObj(tmpReturn.css, 'top', _configObj.top);
        // ++ TryCatchObj(tmpReturn, 'ignoreList', _configObj.ignoreList);
        TryCatchObj(tmpReturn, 'status', _configObj.status);
    } else {}
    return tmpReturn;
}
function TryCatchObj(_obj, _objPropertyName, _obj2) {
    try {
        _obj[_objPropertyName] = _obj2;
    }
    catch(e) {
        console.log('_PGI System_ : INIT CONFIG PROPERTY', _obj2, 'NOT FOUND');
    }
}
function InitGUIClassSetting() {
    let tmpClass;
    try {
        tmpClass = require('./gui/GUIClass.js').GUIClass; // parcel way
    }
    catch {}
    return tmpClass;
}
function SetCreateUpdateInstance(_tmpConfigObj, _tmpStatusReturn, _tmpGUIClass) {
    let GUIClass = new _tmpGUIClass(_tmpConfigObj);
    GUIClass.create(_tmpConfigObj.scene);
    SetRenewalUpdate(_tmpConfigObj, GUIClass);
    return GUIClass;
}
// setting custom update
function SetRenewalUpdate(_tmpConfigObj, GUIClass) {
    let tmpUpdate = undefined;
    let tmpSceneUpdate = _tmpConfigObj.scene.update.bind(_tmpConfigObj.scene);
    tmpUpdate = function (_time, _delta) {
        tmpSceneUpdate(_time, _delta);
        GUIClass.update(_time, _delta);
    }
    return _tmpConfigObj.scene.update = tmpUpdate;
}
function ChckStatusManager(_tmpStatus) {
    let tmpSM;
    if (_tmpStatus) {} // status manager exist
    else {} // status manager not exist
    return tmpSM;
}
function StoreGUI(_GUI) {
    window.PhaserGUI = _GUI;
}

// trying for npm exports
module.exports = PhaserGUIAction;