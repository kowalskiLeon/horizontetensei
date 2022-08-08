
/*:
* @target MZ
* @plugindesc (v1.0) Configuracoes Basicas
* @author Leon Kowalski
* 
* 
* 
*
*/



Scene_Map.prototype.callSkillMenu = function (method) {
    SceneManager.push(Scene_LevelUpgrade);
};

function Scene_LevelUpgrade() {
    this.initialize(...arguments);
}

Scene_LevelUpgrade.prototype = Object.create(Scene_MenuBase.prototype);
Scene_LevelUpgrade.prototype.constructor = Scene_LevelUpgrade;

Scene_LevelUpgrade.prototype.start = function () {
    Scene_MenuBase.prototype.start.call(this);
    this._cancelButton.setClickHandler(this.popScene.bind(this));
    var janela_titulo = new Janela_Titulo(new Rectangle(0, 56, Graphics.boxWidth, this.calcWindowHeight(1, true)));
    this.addWindow(janela_titulo);
    var y = (this.calcWindowHeight(1, true)) + 72
    $gameActors._data.forEach((ator, index) => {
        var janela_nomeouro = new Janela_NomeOuro(new Rectangle(0, y, Graphics.boxWidth, this.calcWindowHeight(1, true)), ator);
        this.addWindow(janela_nomeouro);
        var janela_levelUp = new Janela_LevelUp(new Rectangle(0, y + 70, Graphics.boxWidth, this.calcWindowHeight(2, true)), ator);
        this.addWindow(janela_levelUp);
        y += this.calcWindowHeight(3, true) + 36;
    });
};


function Janela_Titulo() {
    this.initialize.apply(this, arguments);
}

Janela_Titulo.prototype = Object.create(Window_Base.prototype)
Janela_Titulo.prototype.constructor = Janela_Titulo;

Janela_Titulo.prototype.initialize = function (x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
}

Janela_Titulo.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    this.contents.clear()
    this.drawText('Melhorar Atributos - A.I.:' + $gameParty._gold, 0, 0, Graphics.boxWidth, 'left')
}

function Janela_NomeOuro() {
    this.initialize.apply(this, arguments);
}

Janela_NomeOuro.prototype = Object.create(Window_Base.prototype)
Janela_NomeOuro.prototype.constructor = Janela_NomeOuro;

Janela_NomeOuro.prototype.initialize = function (rect, ator) {
    this.ator = ator;
    Window_Base.prototype.initialize.call(this, rect);
}

Janela_NomeOuro.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    this.contents.clear()
    this.drawText(this.ator._name + ' - Custo: ' + this.getCusto(this.ator), 0, 0, Graphics.boxWidth, 'left')
}

Janela_NomeOuro.prototype.getCusto = function (actor) {
    return (actor.level * actor.level) + actor.level * 6;
};


function Janela_LevelUp() {
    this.initialize.apply(this, arguments);
}

Janela_LevelUp.prototype = Object.create(Window_Command.prototype)
Janela_LevelUp.prototype.constructor = Janela_LevelUp;

Janela_LevelUp.prototype.initialize = function (rect, ator) {
    this.ator = ator;
    Window_Command.prototype.initialize.call(this, rect);

};

Janela_LevelUp.prototype.getCusto = function (actor) {
    if (!actor) {
        actor = this.ator
    }
    return (actor.level * actor.level) + actor.level * 6;
};

Janela_LevelUp.prototype.liberado = function (actor) {
    return this.getCusto(actor) <= $gameParty._gold;
};

Janela_LevelUp.prototype.makeCommandList = function () {
    this.addCommand({ 'atr': this.ator.mhp, 'icon': 32, 'nome': 'Armadura' }, { 'id': this.ator._actorId, 'atr': this.ator.mhp, 'name': 'arm' }, this.liberado(this.ator));
    this.addCommand({ 'atr': this.ator.mmp, 'icon': 33, 'nome': 'Mana' }, { 'id': this.ator._actorId, 'atr': this.ator.mmp, 'name': 'man' }, this.liberado(this.ator));
    this.addCommand({ 'atr': this.ator.atk, 'icon': 90, 'nome': 'F. Física' }, { 'id': this.ator._actorId, 'atr': this.ator.atk, 'name': 'atk' }, this.liberado(this.ator));
    this.addCommand({ 'atr': this.ator.def, 'icon': 91, 'nome': 'Durabilidade' }, { 'id': this.ator._actorId, 'atr': this.ator.def, 'name': 'def' }, this.liberado(this.ator));
    this.addCommand({ 'atr': this.ator.mat, 'icon': 92, 'nome': 'P.E.S.' }, { 'id': this.ator._actorId, 'atr': this.ator.mat, 'name': 'mat' }, this.liberado(this.ator));
    this.addCommand({ 'atr': this.ator.mdf, 'icon': 93, 'nome': 'Resistência' }, { 'id': this.ator._actorId, 'atr': this.ator.mdf, 'name': 'mdf' }, this.liberado(this.ator));
    this.addCommand({ 'atr': this.ator.agi, 'icon': 94, 'nome': 'Agilidade' }, { 'id': this.ator._actorId, 'atr': this.ator.agi, 'name': 'agi' }, this.liberado(this.ator));
    this.addCommand({ 'atr': this.ator.luk, 'icon': 95, 'nome': 'Reflexos' }, { 'id': this.ator._actorId, 'atr': this.ator.luk, 'name': 'luk' }, this.liberado(this.ator));

};

Janela_LevelUp.prototype.selectSkill = function (index) {
    var rect = this.itemLineRect(index);
    const align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index).name, rect.x, rect.y, rect.width, align);
};

Janela_LevelUp.prototype.processOk = function () {
    $gameVariables.setValue(2, this.currentSymbol());
};

Janela_LevelUp.prototype.drawItem = function (index) {
    var rect = this.itemLineRect(index);
    const align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawIcon(this.commandName(index).icon, rect.x, rect.y+2)
    //this.drawText(this.commandName(index).nome, rect.x, rect.y + 16, rect.width, 'left');
    this.drawText(this.commandName(index).atr, rect.x, rect.y, rect.width, 'right');
};

Janela_LevelUp.prototype.itemLineRect = function (index) {
    const rect = this.itemRectWithPadding(index);
    const padding = (rect.height - this.lineHeight()) / 2;
    rect.y += padding;
    rect.height -= padding * 2;
    rect.height *= 2;
    return rect;
};

Janela_LevelUp.prototype.itemRect = function (index) {
    const maxCols = this.maxCols();
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight()/2;
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
    const y = (row * itemHeight + rowSpacing / 2 - this.scrollBaseY()) * 2;
    const width = itemWidth - colSpacing;
    const height = (itemHeight - rowSpacing) * 2;
    return new Rectangle(x, y, width, height);
};

Janela_LevelUp.prototype.numVisibleRows = function () {
    return 2;
};

Janela_LevelUp.prototype.maxCols = function () {
    return 4;
};

Janela_LevelUp.prototype.processOk = function () {
    if (this.liberado()) {
        var simbolo = this.currentSymbol();
        var name = simbolo.name;
        var actorId = simbolo.id;
        var battler = $gameActors._data[actorId]
        switch (name) {
            case 'arm':
                var value = 5;
                var paramId = 0;
                battler.addParam(paramId, value);
                break;
            case 'man':
                var value = 2;
                var paramId = 1;
                battler.addParam(paramId, value);
                break;
            case 'atk':
                var value = 1;
                var paramId = 2;
                battler.addParam(paramId, value);
                break;
            case 'def':
                var value = 1;
                var paramId = 3;
                battler.addParam(paramId, value);
                break;
            case 'mat':
                var value = 1;
                var paramId = 4;
                battler.addParam(paramId, value);
                break;
            case 'mdf':
                var value = 1;
                var paramId = 5;
                battler.addParam(paramId, value);
                break;
            case 'agi':
                var value = 1;
                var paramId = 6;
                battler.addParam(paramId, value);
                break;
            case 'luk':
                var value = 1;
                var paramId = 7;
                battler.addParam(paramId, value);
                break;
            default:
                break;
        }
        $gameParty.loseGold(this.getCusto());
        battler.changeLevel(battler.level + 1, false);
        this.refresh();
    }
};
