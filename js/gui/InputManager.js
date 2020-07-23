
import { DebugGetThisConsole } from '../utils/DebugConsoleFunc.js';

export default class InputManager {
    constructor() {
        this.scene;
        // game size width, height
        this.size = { w: 0, h: 0 };
        this.cursorKey;
        // pointer mode for MOVE, SCALE, ROTATE
        this.isPointerMode = false;
        this.pointerModeList = ['NONE', 'MOVE', 'SCALE', 'ANGLE'];
        this.pointerMode = 'NONE';
        this.pointerModeObjs = {
            target: undefined, // targeted focus GameObj
            targetX: 0,
            targetY: 0,
            // targetScaleX: 0,
            // targetScaleY: 0,
            isDown: false, // chck pointer is down?
            move: { x: 0, y: 0 }, // rate 1:1
            scale: { x: 0, y: 0 }, // rate 5px:0.1
            angle: 0 // x coordinate rate 1:1
        };
    }
    create(_scene, _debugBox, _folder, _camera) {
        this.scene = _scene;
        this.createDisableRightClick();
        this.createSize(_scene);
        this.createCursorKey(_scene);
        this.createConsoleCmd(_scene, _debugBox);
        this.createOverEvent(_scene, _debugBox, _folder);
        this.createFocusEvent(_scene, _debugBox, _folder, _camera);
        this.createDetailEvent(_scene, _debugBox, _folder);
        this.createVisibleEvent(_scene, _debugBox);
        // MOVE, SCALE, ROTATE MODE input
        this.createModeCmdEvent(_scene);
        this.createModeEvent(_scene, _debugBox, _folder, _camera);
    }
    update() {
        this.updatePointerMode();
    }
    
    createDisableRightClick() {
        // disable right click pop up
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    createSize(_scene) {
        this.size.w = _scene.game.config.width;
        this.size.h = _scene.game.config.height;
    }
    getSize() {
        return this.size;
    }
    createMainCamera(_scene) {
        this.mainCamera = _scene.cameras.main;
    }
    createCursorKey(_scene) {
        this.cursorKey = _scene.input.keyboard.createCursorKeys(); // cursor key
    }
    getCursorKey() {
        return this.cursorKey;
    }

    createConsoleCmd(_scene, _debugBox) {
        // when press command SHIFT + C
        _scene.input.keyboard.on('keyup-C', () => {
            if (this.chckCmdShiftKeyDown()) { // if focus
                let tmpFocusGameObj = _debugBox.getFocusGameObj();
                if (tmpFocusGameObj) {
                    DebugGetThisConsole.call(tmpFocusGameObj);
                }
            }
        });
    }
    createOverEvent(_scene, _debugBox, _folder) {
        // just pointer over obj
        _scene.input.on('gameobjectover', (_pointer, _gameObj) => {
            if (!this.chckGameObjIsFocusOnGUI(_gameObj)) { // not focus
                _debugBox.setPointerOver(_gameObj);
                _debugBox.setOver(_gameObj);
                _debugBox.setOverGameObj(_gameObj);
                _folder.setBasicOverFolder(_gameObj);
            }
        });
        // when out from pointer over obj
        _scene.input.on('gameobjectout', (_pointer, _gameObj) => {
            if (!this.chckGameObjIsFocusOnGUI(_gameObj)) { // not focus
                _debugBox.clearPointerOver(_gameObj);
                _debugBox.clearOverGameObj();
                _debugBox.setOverGameObj(undefined);
                _folder.setBasicOverFolder();
            }
        });
    }
    createFocusEvent(_scene, _debugBox, _folder, _camera) {
        // when want to focus logic
        _scene.input.on('gameobjectup', (_pointer, _gameObj) => {
            // if middle button pressed
            if (this.chckCommandKeyReleased(_pointer)) {
                if (!this.isPointerMode) {
                    this.runFocusLogic(_scene, _gameObj, _debugBox, _folder, _camera);
                }
            }
        });
        // when press command SHIFT + F
        _scene.input.keyboard.on('keyup-F', () => {
            if (this.chckCmdShiftKeyDown()) {
                // set gameObj via which pointer over on
                let tmpGameObj = _debugBox.getOverGameObj();
                this.runFocusLogic(_scene, tmpGameObj, _debugBox, _folder, _camera);
            }
        });
    }
    // when focused, SHIFT + D deep into the focused obj in detailed property
    createDetailEvent(_scene, _debugBox, _folder) {
        _scene.input.keyboard.on('keyup-D', () => {
            let tmpFocusGameObj = _debugBox.getFocusGameObj();
            if ( // chck if focus valid & shift key down
                tmpFocusGameObj &&
                this.chckCmdShiftKeyDown()
                )
            {
                // chck isDetailedOpen boolean then go 2 detailed or basic
                if (_folder.getDetailedStatus()) {
                    _folder.back2Basic(tmpFocusGameObj.guiIdx);
                }
                else {
                    _folder.cross2FocusObj(_debugBox.getFocusGameObj());
                } 
            }
        });
    }
    createVisibleEvent(_scene, _debugBox) {
        // when press command SHIFT + V, visible on/off logic
        _scene.input.keyboard.on('keyup-V', (_pointer, _gameObj) => {
            let tmpFocusGameObj = _debugBox.getFocusGameObj();
            if ( // chck if focus valid & shift key down
                tmpFocusGameObj &&
                this.chckCmdShiftKeyDown()
                ) {
                tmpFocusGameObj.visible = !tmpFocusGameObj.visible;
            }
        });
    }
    createModeCmdEvent(_scene) {
        // when press command SHIFT + Q, W, E for mode & modeObjs boolean control
        _scene.input.keyboard.on('keyup-Q', this.setModeCmdFunc.bind(this, 1));
        _scene.input.keyboard.on('keyup-W', this.setModeCmdFunc.bind(this, 2));
        _scene.input.keyboard.on('keyup-E', this.setModeCmdFunc.bind(this, 3));
        _scene.input.keyboard.on('keyup-R', this.setModeCmdFunc.bind(this, 0));
    }
    setModeCmdFunc(_idx, _keyboardEvt) {
        if (this.chckCmdShiftKeyDown() && !this.pointerModeObjs.isDown) {
            console.log('_idx:', _idx);
            if (_idx === 0) {
                this.isPointerMode = false;
            }
            else {
                this.isPointerMode = true;
                if (this.pointerMode !== this.pointerModeList[_idx]) {
                    this.pointerMode = this.pointerModeList[_idx];
                }
            }
        }
    }
    createModeEvent(_scene, _debugBox, _folder, _camera) {
        // just pointer over obj
        _scene.input.on('pointerdown', (_pointer) => {
            if (this.chckCommandKeyDown(_pointer) && this.isPointerMode) {
                this.pointerModeObjs.target = _debugBox.getFocusGameObj();
                if (this.pointerModeObjs.target) {
                    this.pointerModeObjs.isDown = true;
                    this.sortPointerModeObjs({
                        move: this.setDragStartMoveMode.bind(this, _pointer),
                        scale: this.setDragStartScaleMode.bind(this, _pointer),
                        angle: this.setDragStartAngleMode.bind(this, _pointer)
                    });
                }
            }
        });
        _scene.input.on('pointerup', (_pointer) => {
            if (this.isPointerMode) {
                this.pointerModeObjs.target = undefined;
                this.pointerModeObjs.isDown = false;
                this.sortPointerModeObjs({ 
                    move: this.setDragEndMoveMode.bind(this),
                    scale: this.setDragEndScaleMode.bind(this),
                    angle: this.setDragEndAngleMode.bind(this)
                });
            }
        });
    }

    updatePointerMode() {
        if (this.isPointerMode && this.pointerModeObjs.isDown) {
            this.sortPointerModeObjs({
                move: this.setDraggingMoveMode.bind(this),
                scale: this.setDraggingScaleMode.bind(this),
                angle: this.setDraggingAngleMode.bind(this)
            });
        }
    }

    sortPointerModeObjs(_obj) {
        switch(this.pointerMode) {
            case this.pointerModeList[0]: break;
            case this.pointerModeList[1]: _obj.move(); break;
            case this.pointerModeList[2]: _obj.scale(); break;
            case this.pointerModeList[3]: _obj.angle(); break;
            default:
                console.warn(this.pointerMode, '<= this is not on the options');
            break;
        }
    }

    // MOVE MODE
    setDragStartMoveMode(_pointer) {
        this.setDragStart(_pointer);
    }
    setDraggingMoveMode() {
        let tmpGap = this.setDragging();
        this.pointerModeObjs.target.x = tmpGap.x;
        this.pointerModeObjs.target.y = tmpGap.y;
    }
    setDragEndMoveMode() {
        this.setDragEnd();
    }

    // SCALE MODE
    setDragStartScaleMode(_pointer) {
        this.setDragStart(_pointer);
        this.pointerModeObjs.targetScaleX = this.pointerModeObjs.target.scaleX;
        this.pointerModeObjs.targetScaleY = this.pointerModeObjs.target.scaleY;
    }
    setDraggingScaleMode() {
        let tmpGap = this.setDragging();
        let tmpX = this.pointerModeObjs.targetScaleX + (tmpGap.x - this.pointerModeObjs.target.x)/10;
        let tmpY = this.pointerModeObjs.targetScaleY + (tmpGap.y - this.pointerModeObjs.target.y)/10;
        this.pointerModeObjs.target.scaleX = tmpX.toFixed(1);
        this.pointerModeObjs.target.scaleY = tmpY.toFixed(1);
    }
    setDragEndScaleMode() {
        this.setDragEnd();
        this.pointerModeObjs.targetScaleX = 0;
        this.pointerModeObjs.targetScaleY = 0;
    }

    // ANGLE MODE
    setDragStartAngleMode(_pointer) {
        this.setDragStart(_pointer);
        this.pointerModeObjs.angle = this.pointerModeObjs.target.angle;
    }
    setDraggingAngleMode() {
        let tmpMO = this.pointerModeObjs;
        let tmpGap = this.setDragging();
        let tmpAngle = tmpMO.angle - ((tmpMO.targetY - tmpGap.y) / 5);
        tmpMO.target.angle = tmpAngle.toFixed(0);
    }
    setDragEndAngleMode() {
        this.setDragEnd();
        this.pointerModeObjs.angle = 0;
    }

    // GAP logic
    setDragStart(_pointer) {
        let tmpMO = this.pointerModeObjs;
        tmpMO.targetX = tmpMO.target.x;
        tmpMO.targetY = tmpMO.target.y;
        tmpMO.move.x = _pointer.x;
        tmpMO.move.y = _pointer.y;
    }
    setDragging() {
        let tmpMO = this.pointerModeObjs;
        let tmpGapX = tmpMO.targetX - tmpMO.move.x + this.scene.input.x;
        let tmpGapY = tmpMO.targetY - tmpMO.move.y + this.scene.input.y;
        return { x: tmpGapX, y: tmpGapY };
    }
    setDragEnd() {
        let tmpMO = this.pointerModeObjs;
        tmpMO.targetX = 0;
        tmpMO.targetY = 0;
        tmpMO.move.x = 0;
        tmpMO.move.y = 0;
        console.log('init drag end');
    }

    // chck focus then, focus ON game object or OFF
    runFocusLogic(_scene, _gameObj, _debugBox, _folder, _camera) {
        // isFocusOnGUI boolean is true
        // (if u run focusCommand on the focus game object)
        if (this.chckGameObjIsFocusOnGUI(_gameObj)) {
            // clear the focus object
            this.runFocusLogic_focus_clear(_gameObj, _debugBox, _folder, _camera);
        }
        // isFocusOnGUI boolean is false
        // (if u run focusCommand on the not focus game object)
        else {
            let tmpFocusGameObj = _debugBox.getFocusGameObj();
            if (tmpFocusGameObj) {
                // clear the focus during object focusing
                // init focus check
                this.runFocusLogic_focus_clear(tmpFocusGameObj, _debugBox, _folder, _camera);
            }
            else {
                // pure game object focus
                // set to this game object
                this.runFocusLogic_focus_pure(_scene, _gameObj, _debugBox, _folder);
            }
        }
    }
    runFocusLogic_focus_clear(_gameObj, _debugBox, _folder, _camera) {
        _camera.setFollowStop();
        _debugBox.clearFocus(_gameObj);
        _debugBox.setFocusGameObj(undefined);
        _debugBox.clearFocusGameObj();
        _folder.setBasicFocusFolder();
        _folder.back2Basic(_gameObj.guiIdx);
    }
    runFocusLogic_focus_pure(_scene, _gameObj, _debugBox, _folder) {
        if (_gameObj) {
            _debugBox.setFocusGameObj(_gameObj);
            _debugBox.setFocus(_gameObj);
            _debugBox.setFocusPerformance(_gameObj, _folder);
            _folder.setBasicFocusFolder(_gameObj);
        }
    }
    chckCommandKeyReleased(_pointer) {
        let tmpBool;
        if ((this.getCursorKey().shift.isDown && _pointer.leftButtonReleased()) || // shift + mouse left click or
            (!_pointer.rightButtonReleased() && !_pointer.leftButtonReleased())) { // mouse middle button
            tmpBool = true;
        }
        else { tmpBool = false; }
        return tmpBool;
    }
    chckCommandKeyDown(_pointer) {
        let tmpBool;
        if ((this.getCursorKey().shift.isDown && _pointer.leftButtonDown()) || // shift + mouse left click or
            (!_pointer.rightButtonDown() && !_pointer.leftButtonDown())) { // mouse middle button
            tmpBool = true;
        }
        else { tmpBool = false; }
        return tmpBool;
    }
    chckCmdShiftKeyDown() {
        let tmpBool = (this.getCursorKey().shift.isDown) ? true : false; // is shift down?
        return tmpBool;
    }
    chckGameObjIsFocusOnGUI(_gameObj) {
        let tmpGameObjBoolean = (_gameObj) ? _gameObj.isFocusOnGUI : null;
        return tmpGameObjBoolean;
    }
}