/*:
 * @target MZ
 * @plugindesc (v1.0) Apresenta uma janela com nome da ação.
 * @author Leon Kowalski
 * */

mapAlias = Scene_Map.prototype.start
Scene_Map.prototype.start = function () {
    mapAlias.call(this);
    if (!$dataMap.meta.SemHUD) {
        this.janela_MapInfo = new Janela_MapInfo(new Rectangle(-4, -4, Graphics.boxWidth+ 8, 86));
        this.addWindow(this.janela_MapInfo);
    }

};

function Janela_MapInfo() {
    this.initialize.apply(this, arguments);
}

Janela_MapInfo.prototype = Object.create(Window_Base.prototype)
Janela_MapInfo.prototype.constructor = Janela_MapInfo;

Janela_MapInfo.prototype.initialize = function (x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.opacity = 0;
}



Janela_MapInfo.prototype.updatePadding = function () {
    this.padding = -0;
};

Janela_MapInfo.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    this.contents.clear();
    this.createLayout(0,0);
    var x = 8;
    var y = 8;
    var regiao = this.obterRegiao();
    var evento = this.obterEvento();
    this.drawIcon(17, x, y)
    this.drawText(regiao, x + 40, y, Graphics.boxWidth - 40, 'left');
    y += 36;
    if (evento != '') {
        this.drawIcon(18, x, y)
        this.drawText(evento, x + 40, y, Graphics.boxWidth - 40, 'left');
    }else{
        this.drawIcon(19, x, y)
    }
}

Janela_MapInfo.prototype.obterRegiao = function () {
    var retorno = 'Região Desconhecida';
    var x = $gamePlayer.x;
    var y = $gamePlayer.y;
    var regiao = $gameMap.regionId(x, y);
    if (regiao > 0 && $dataMap.meta[regiao]) {
        retorno = $dataMap.meta[regiao];
    }
    return retorno;
}

Janela_MapInfo.prototype.obterEvento = function () {
    var retorno = '';
    var x = $gamePlayer.x;
    var y = $gamePlayer.y;
    var evento = $dataMap.events.find(evento => evento?.x == x && evento?.y == y);
    if (evento) {
        var nomeTroop = evento.meta.t? $dataTroops[Number(evento.meta.t)].name:'';
        retorno = evento.meta.t? nomeTroop:evento.name;
    }
    return retorno;
}

Janela_MapInfo.prototype.createLayout = function(x, y) {
    const bitmap = ImageManager.loadPartyHud("top_bg");
    const pw = 528;
    const ph = 86;
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};


Sprite_Button.prototype.buttonData = function () {
    const buttonTable = {
        cancel: { x: 0, w: 2 },
        pageup: { x: 2, w: 1 },
        pagedown: { x: 3, w: 1 },
        down: { x: 4, w: 1 },
        up: { x: 5, w: 1 },
        down2: { x: 6, w: 1 },
        up2: { x: 7, w: 1 },
        ok: { x: 8, w: 2 },
        menu: { x: 10, w: 2 },
    };
    return buttonTable[this._buttonType];
};

Scene_Map.prototype.createMenuButton = function() {
    this._menuButton = new Sprite_Button("menu");
    this._menuButton.x = Graphics.boxWidth - this._menuButton.width;
    this._menuButton.y = this.buttonY()+88;
    this._menuButton.visible = false;
    this.addWindow(this._menuButton);
};

PartyHud.prototype.createHPNumber = function() {
    this._hpnumber = new Sprite(new Bitmap(200,32));
    this._hpnumber.x = this._layout.x + 72;
    this._hpnumber.y = this._layout.y + 12;
    this._hpnumber.org = [this._hpnumber.x,this._hpnumber.y];
    this._hpnumber.bitmap.fontSize = 30;
    this._hpnumber.bitmap.fontFace = $gameSystem.numberFontFace(); 
    this._hpnumber.bitmap.outlineWidth = 0;
    this._hpnumber.bitmap.textColor = '#1c1c1c';
    this.addChild(this._hpnumber);
};

PartyHud.prototype.createMPNumber = function() {
    this._mpnumber = new Sprite(new Bitmap(200,32));
    this._mpnumber.x = this._layout.x + 72;
    this._mpnumber.y = this._layout.y + 80;
    this._mpnumber.org = [this._mpnumber.x,this._mpnumber.y];
    this._mpnumber.bitmap.fontSize = Number(Moghunter.partyHud_NumberFontSize);
    this._mpnumber.bitmap.fontFace = $gameSystem.numberFontFace(); 
    this._mpnumber.bitmap.outlineWidth = 0;
    this._mpnumber.bitmap.textColor = '#d0cac2';
    this.addChild(this._mpnumber);
};

PartyHud.prototype.createName = function() {
    this._name = new Sprite(new Bitmap(200,64));
    this._name.x = this._layout.x + 12;
    this._name.y = this._layout.y + 34;
    this._name.org = [this._name.x,this._name.y];
    this._name.bitmap.fontSize = 24;
    this._name.bitmap.fontFace = $gameSystem.numberFontFace(); 
    this._name.bitmap.outlineWidth = 0;
    this._name.bitmap.textColor = '#1c1c1c';
    this.addChild(this._name);
};