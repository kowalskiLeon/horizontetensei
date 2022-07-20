/*:
 * @target MZ
 * @plugindesc (v1.0) Apresenta uma janela com nome da ação.
 * @author Leon Kowalski
 * 
 * @param Dano Nulo
 * @desc Dano x0 ou Efeito x2
 * @type number
 * @min 0.1 
 * @default 0.9
 * 
 * @param Dano Normal
 * @desc Dano x1 ou Efeito x1
 * @type number
 * @min 0.1 
 * @default 0.8
 * 
 * @param Dano Forte
 * @desc Dano x1.5 ou Efeito x0.75
 * @type number
 * @min 0.1 
 * @default 0.6
 * 
 * @param Dano Extra
 * @desc Dano x2 ou Efeito x0.5
 * @type number
 * @min 0.1 
 * @default 0.4
 * 
 * @param Icone
 * @desc Icone que fica passando
 * @type number
 * @default 74
 * 
 * @param Velocidade
 * @desc Velocidade do Icone
 * @type number
 * @default 10
 * 
 * @param Texto Nulo
 * @desc Texto amostrado com nulo/perfeito
 * @type string
 * @default Perfeito!
 * 
 * @param Texto Normal
 * @desc Texto amostrado com normal
 * @type string
 * @default Bom!
 * 
 * @param Texto Forte
 * @desc Texto amostrado com forte
 * @type string
 * @default Muito Lento.
 * 
 * 
 * @param Texto Extra
 * @desc Texto amostrado com forte
 * @type string
 * @default Falha Crítica!
 * 
 * @param Texto Aperte
 * @desc Texto amostrado com forte
 * @type string
 * @default Aperte qualquer botão
 * 
 * 
 * @param Checagem Aliada
 * @desc Usar checagem quando o lado aliado usar uma técnica?
 * @type boolean
 * @default false
 * 
 * @param Dano Base
 * @desc Dano que será causado (sem zeros)
 * @type number
 * @default 3
 * 
 * @param Times
 * @desc Vezes que será chamado antes de finalizar com dano crítico
 * @type number
 * @default 5
 * 
 *  
 * */


var AMBS = AMBS || {};
AMBS.parameters = PluginManager.parameters('ActionMultiplierBattleSystem');

AMBS.danoNulo = Number(AMBS.parameters['Dano Nulo']) || 0.9;
AMBS.danoNormal = Number(AMBS.parameters['Dano Normal']) || 0.8;
AMBS.danoForte = Number(AMBS.parameters['Dano Forte']) || 0.6;
AMBS.danoExtra = Number(AMBS.parameters['Dano Extra']) || 0.4;
AMBS.icone = Number(AMBS.parameters['Icone']) || 74;
AMBS.velocidade = Number(AMBS.parameters['Velocidade']) || 10;
AMBS.textoNulo = String(AMBS.parameters['Texto Nulo']) || 'Perfeito!';
AMBS.textoNormal = String(AMBS.parameters['Texto Normal']) || 'Bom!';
AMBS.textoForte = String(AMBS.parameters['Texto Forte']) || 'Muito Lento.';
AMBS.textoExtra = String(AMBS.parameters['Texto Extra']) || 'Falha Crítica!';
AMBS.textoAperte = String(AMBS.parameters['Texto Aperte']) || 'Aperte qualquer botão!';
AMBS.checagemAliada = Boolean(AMBS.parameters['Checagem Aliada'] == 'true') || false;
AMBS.danoBase = Number(AMBS.parameters['Dano Base'] || 3);
AMBS.times = Number(AMBS.parameters['Dano Base'] || 5);
const listaNomesIndefinidos = ['Fulane', 'Ciclane', 'Beltrane'];

Window_ActorCommand.prototype.makeCommandList = function () {
    if (this._actor) {
        //this.addAttackCommand();
        this.addSkillCommands();
        //this.addGuardCommand();
        this.addItemCommand();
    }
};

Sprite_Actor.prototype.setActorHome = function (index) {
    const partySize = $gameParty._actors.length;
    const largura = Graphics.boxWidth;
    var x = largura / (partySize + 1) + ((index) * (largura / (partySize + 1)));
    var y = 720
    this.setHome(x, y);
};

Sprite_Actor.prototype.stepForward = function () {
    this.startMove(0, -48, 12);
};

Sprite_Actor.prototype.stepBack = function () {
    this.startMove(0, 0, 12);
};

Sprite_Actor.prototype.moveToStartPosition = function () {
    this.startMove(0, 300, 0);
};

Game_System.prototype.messageRows = function () {
    var rows = 2;
    return Math.max(1, Number(rows));
};


BattleManager.displayStartMessages = function () {
    $gameMessage.setPositionType(1)
    $gameMessage.add("--Conflito!--")
    $gameMessage.add('\\TA[1]' + $dataTroops[$gameTroop._troopId].name);
    if (this._preemptive) {
        $gameMessage.add(TextManager.preemptive.format($gameParty.name()));
    } else if (this._surprise) {
        $gameMessage.add(TextManager.surprise.format($gameParty.name()));
    }
};

BattleManager.startAction = function () {
    this.setMultiplier(-1);
    this.inputingTime = true;
    const subject = this._subject;
    const action = subject.currentAction();
    const targets = action.makeTargets();
    this._phase = "action";
    this._action = action;
    this._action2 = action;
    this._targets = targets;
    console.log(this._action)
    console.log(AMBS)
    var itemSkill = this._action._item._dataClass === 'skill'?true:false;
    var aItem = itemSkill? $dataSkills[this._action._item._itemId]:$dataItems[this._action._item._itemId];
    console.log(aItem.meta.Unblockable)
    if (this._action._subjectEnemyIndex >= 0 && !aItem.meta.Unblockable) {
        console.log('enemy')
        this.ambsWindow = new Window_ActionMultiplier(this);
        SceneManager._scene.addChild(this.ambsWindow);
    } else if (this._action._subjectActorId >= 0 && AMBS.checagemAliada) {
        console.log('hero')
        this.ambsWindow = new Window_ActionMultiplier(this);
        SceneManager._scene.addChild(this.ambsWindow);
    } else {
        console.log('dont care')
        this.continueAfterEnd();
        this.setMultiplier(1);
    }

};

BattleManager.updateTurn = function (timeActive) {
    $gameParty.requestMotionRefresh();
    if (this.isTpb() && timeActive && !this.inputingTime) {
        this.updateTpb();
    }
    if (!this._subject) {
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    } else if (!this.isTpb()) {
        this.endTurn();
    }
};

BattleManager.continueAfterEnd = function () {
    const subject = this._subject;
    subject.cancelMotionRefresh();
    subject.useItem(this._action2.item());
    this._action.applyGlobal();
    this._logWindow.startAction(subject, this._action2, this._targets);
};


BattleManager.updatePhase = function (timeActive) {
    switch (this._phase) {
        case "start":
            this.updateStart();
            break;
        case "turn":
            this.updateTurn(timeActive);
            break;
        case "action":
            this.callAction();
            break;
        case "turnEnd":
            this.updateTurnEnd();
            break;
        case "battleEnd":
            this.updateBattleEnd();
            break;
    }
};


BattleManager.callAction = function () {

    if (this.multiplier != -1) {
        SceneManager._scene.removeChild(this.ambsWindow);
        this.ambsWindow = undefined;
        this.updateAction();
    }

};

BattleManager.setMultiplier = function (value) {
    this.multiplier = value;
}


BattleManager.invokeNormalAction = function (subject, target) {
    const realTarget = this.applySubstitute(target);
    this._action.apply(realTarget);
    this._logWindow.displayActionResults(subject, realTarget);
    this.inputingTime = false;
};

Game_Action.prototype.apply = function (target) {

    const result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = BattleManager.multiplier != 0 && result.used && Math.random() >= this.itemHit(target);
    result.evaded = BattleManager.multiplier === 0 || (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
        console.log(this.item().damage)
        if (this.item().damage.type > 0) {
            result.critical = Math.random() < this.itemCri(target);
            const value = Math.round(this.makeDamageValue(target, result.critical) * BattleManager.multiplier);
            if (value < AMBS.danoBase && !this.item().damage.type===3) {
                this.executeDamage(target, AMBS.danoBase);
            } else
                this.executeDamage(target, value);
        }
        for (const effect of this.item().effects) {
            this.applyItemEffect(target, effect);
        }
        this.applyItemUserEffect(target);
    }
    this.updateLastTarget(target);
};


function Window_ActionMultiplier() {
    this.initialize.apply(this, arguments);
}


Window_ActionMultiplier.prototype = Object.create(Window_Base.prototype)
Window_ActionMultiplier.prototype.constructor = Window_ActionMultiplier;

Window_ActionMultiplier.prototype.initialize = function (bm) {
    this.endValue = 1;
    var y = 480;
    var w = Graphics.boxWidth;
    var x = (Graphics.boxWidth - w) / 2;
    var h = 144;
    var rect = new Rectangle(x, y, w, h)
    this.bm = bm;
    this.isAllied = bm._action._subjectActorId > 0;
    this.item = bm._action._item._dataClass === "item" ? $dataItems[bm._action._item._itemId] : $dataSkills[bm._action._item._itemId];
    this.nulo = this.item.meta.Null ? Number(this.item.meta.Null) : AMBS.danoNulo;
    this.normal = this.item.meta.Normal ? Number(this.item.meta.Normal) : AMBS.danoNormal;
    this.strong = this.item.meta.Strong ? Number(this.item.meta.Strong) : AMBS.danoForte;
    this.extra = this.item.meta.Extra ? Number(this.item.meta.Extra) : AMBS.danoExtra;
    this.velocidade = this.item.meta.Speed ? Number(this.item.meta.Speed) : AMBS.velocidade;
    this.times = this.item.meta.Times ? Number(this.item.meta.Times) : AMBS.times;
    this.iconx = w / 2 - 32;
    this.icony = h / 2 - 32;
    this.strength = 0;
    this.left = true;
    Window_Base.prototype.initialize.call(this, rect);
    this.opacity = 0;

}

Window_ActionMultiplier.prototype.updatePadding = function () {
    this.padding = 0;
};

Window_ActionMultiplier.prototype.itemRectWithPadding = function (index) {
    const rect = this.itemRect(index);
    const padding = 0;
    rect.x += padding;
    rect.width -= padding * 2;
    return rect;
};

Window_ActionMultiplier.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    this.contents.clear();
    this.backgroundFilling();
    if (!this.pressed) this.moveIcon();
    else {
        this.drawPositionIcon();
    }
    if (!this.pressed && (Input.isPressed('ok') || TouchInput.isPressed())) {
        this.pressed = true;
        setTimeout(() => {
            this.callToAction();
        }, 400);
    }

    if (!this.pressed && this.times == 0) {
        this.pressed = true;
        this.endValue = this.isAllied ? 0.5 : 2;
        setTimeout(() => {
            this.callToAction();
        }, 400);
    }
}

Window_ActionMultiplier.prototype.moveIcon = function () {
    if (this.left) {
        if (this.iconx - this.velocidade < 0) { this.left = false; this.times-- }
        else this.iconx -= this.velocidade;
    } else {
        if (this.iconx + this.velocidade > this.innerWidth) { this.left = true; this.times-- }
        else this.iconx += this.velocidade;
    }
    this.drawPositionIcon();

}

Window_ActionMultiplier.prototype.drawPositionIcon = function () {
    this.drawIcon(AMBS.icone, this.iconx - 16, this.icony);
    this.strength = 1 - Math.abs(this.iconx - this.innerWidth / 2) / (this.innerWidth / 2);
    let valor = this.returnText();
    this.drawText(!this.pressed ? AMBS.textoAperte : valor, 0, 0, this.innerWidth, 'center');
    if (this.times > -1) {
        this.drawText('Voltas Restante: ' + this.times + '', 0, 86, this.innerWidth, 'center');
    }
}

Window_ActionMultiplier.prototype.callToAction = function () {
    BattleManager.continueAfterEnd();
    BattleManager.setMultiplier(this.endValue);
    this.close();
}

Window_ActionMultiplier.prototype.returnText = function () {
    var valor = '';
    if (this.strength >= this.nulo) {
        valor = AMBS.textoNulo;
        this.endValue = this.isAllied ? 1.5 : 0;
    } else if (this.strength < this.nulo && this.strength >= this.normal) {
        valor = AMBS.textoNormal;
        this.endValue = 1;
    } else if (this.strength < this.normal && this.strength >= this.strong) {
        valor = AMBS.textoForte;
        this.endValue = this.isAllied ? 0.75 : 1.5;
    } else {
        valor = AMBS.textoExtra;
        this.endValue = this.isAllied ? 0.5 : 2;
    }
    return valor;
}

Window_ActionMultiplier.prototype.backgroundFilling = function () {
    var largura = this.innerWidth - 12
    var nullArea = (largura / 2 - (largura * (1 - this.nulo) / 2))
    var normalArea = (largura / 2 - (largura * (1 - this.normal) / 2))
    var strongArea = (largura / 2 - (largura * (1 - this.strong) / 2))
    var areaY = this.icony + 8;
    var areaH = 16;
    this.contents.fillRect(2, areaY - 4, this.innerWidth + 8, areaH + 8, 'black') //extra
    this.contents.fillRect(8, areaY, largura, areaH, '#5b2d2d') //extra
    this.contents.fillRect(strongArea, areaY, largura * (1 - this.strong), areaH, '#653764') //strong
    this.contents.fillRect(normalArea, areaY, largura * (1 - this.normal), areaH, '#3a5c81') //normal
    this.contents.fillRect(nullArea, areaY, largura * (1 - this.nulo), areaH, '#529366') //null
}


Scene_Battle.prototype.isTimeActive = function () {
    if (BattleManager.isActiveTpb()) {
        return !BattleManager.ambsWindow && !this._skillWindow.active && !this._itemWindow.active;
    } else {
        return !this.isAnyInputWindowActive();
    }
};