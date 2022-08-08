/*:
 * @target MZ
 * @plugindesc (v1.0) Configuracoes Basicas
 * @author Leon Kowalski
 * 
 * */

Sprite_Damage.prototype.createMiss = function () {
    const h = this.fontSize();
    const w = Math.floor(h * 8.0);
    const sprite = this.createChildSprite(w, h);
    sprite.bitmap.drawText("Desviou", 0, 0, w, h, "center");
    sprite.dy = 0;
};

Sprite_Damage.prototype.fontSize = function () {
    return 28;
};

Sprite_Damage.prototype.outlineWidth = function () {
    return 8;
};

SpriteSkillName.prototype.getNameData = function () {
    this._nameData = [0, 0, 0, 0];
    this._nameData[0] = this._layoutImg.width;
    this._nameData[1] = Math.floor(this._layoutImg.height / 3);
    this._name.bitmap = new Bitmap(200, 32);
    this._name.bitmap.fontSize = Moghunter.skillName_FontSize;
    this._name.y = Moghunter.skillName_name_y;
    this._icon.x = Moghunter.skillName_icon_x;
    this._icon.y = Moghunter.skillName_icon_y;
};

SpriteSkillName.prototype.fontFace = function () {
    return $gameSystem.numberFontFace();
};

SpriteSkillName.prototype.refreshSkillName = function () {
    $gameTemp._skillNameData[0] = false;
    this._name.bitmap.clear();
    this._layout.opacity = 0;
    if (!this.item()) { return };
    var text = this.item().name;
    var textsize = ((text.length * 7) + this._nameData[0]);
    var wsize = (Math.min(Math.max(textsize, 48), 200));
    var wposX = ((wsize / 2) + Math.floor(this._nameData[0] / 2));
    for (var i = 0; i < this._layout.length; i++) {
        this._layout[i].x = 1;
        this._layout[i].y = 1;
        if (i === 0) {
            this._layout[i].setFrame(0, 0, this._nameData[0], this._nameData[1]);
            this._layout[i].x -= wposX;
        } else if (i === 1) {
            this._layout[i].setFrame(0, this._nameData[1], this._nameData[0], this._nameData[1]);
            this._layout[i].x += wposX;
        } else {
            this._layout[i].setFrame(0, this._nameData[1] * 2, this._nameData[0], this._nameData[1]);
            this._layout[i].scale.x = wsize / this._nameData[0];
        };
    };
    this._name.bitmap.fontFace = this.fontFace();
    this._name.bitmap.drawText(this.item().name, 0, 0, 200, 32, "center")
    this._name.x = Moghunter.skillName_name_x;
    this._wait = 4;
    var w = ImageManager.iconWidth;
    var h = ImageManager.iconHeight;
    var sx = this.item().iconIndex % 16 * w;
    var sy = Math.floor(this.item().iconIndex / 16) * h;
    this._icon.setFrame(sx, sy, w, h);
};

ColorManager.gaugeBackColor = function () {
    return this.textColor(19);
};

ColorManager.hpGaugeColor1 = function () {
    return '#ff434b';
};

ColorManager.hpGaugeColor2 = function () {
    return '#ec252d';
};

ColorManager.mpGaugeColor1 = function () {
    return '#4382ff';
};

ColorManager.mpGaugeColor2 = function () {
    return '#2a63d4';
};

ATB_Gauge.prototype.createIcons = function () {
    this._iconField = new Sprite();
    this.addChild(this._iconField);
    this._icons = [];
    this._skillIcons = [];
    for (var i = 0; i < this.battlers().length; i++) {
        var battler = this.battlers()[i];
        if (battler.isActor()) {
            var name = "Actor_" + String(battler._actorId);
        } else {
            var name = "Enemy_" + 1;
        };
        this._icons[i] = new Sprite(ImageManager.loadATBIcon(name));
        this._icons[i].battler = battler;
        this._icons[i].anchor.x = 0.5;
        this._icons[i].anchor.y = 0.5;
        this._icons[i].opacity = 0
        this._icons[i].nx = 0;
        this._icons[i].ny = 0;
        this._icons[i].rotation = -this._angle
        this._iconField.addChild(this._icons[i]);
        if (this._skillIcon) { this.createSkillIcon(i, this._icons[i]) };
    };
};

Scene_Shop.prototype.createCommandWindow = function () {
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_ShopCommand(rect);
    this._commandWindow.setPurchaseOnly(this._purchaseOnly);
    this._commandWindow.y = 56;
    this._commandWindow.setHandler("buy", this.commandBuy.bind(this));
    this._commandWindow.setHandler("sell", this.commandSell.bind(this));
    this._commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Shop.prototype.commandWindowRect = function () {
    const wx = 0;
    const wy = 56;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Shop.prototype.createGoldWindow = function () {
    const rect = new Rectangle(0, 56 + this.calcWindowHeight(1, true), Graphics.boxWidth, this.calcWindowHeight(1, true));
    this._goldWindow = new Window_Gold(rect);
    this.addWindow(this._goldWindow);
};


Scene_Shop.prototype.createHelpWindow = function () {
    const rect = new Rectangle(0, 56 + this.calcWindowHeight(2, true) + 12, Graphics.boxWidth, this.calcWindowHeight(2, true));
    this._helpWindow = new Window_Help(rect);
    this.addWindow(this._helpWindow);
};

Scene_Shop.prototype.createDummyWindow = function () {
    const rect = new Rectangle(0, 56 + this.calcWindowHeight(4, true) + 12, Graphics.boxWidth, this.calcWindowHeight(5, true));
    this._dummyWindow = new Window_Base(rect);
    this.addWindow(this._dummyWindow);
};

Scene_Shop.prototype.createStatusWindow = function () {
    const rect = new Rectangle(0, 56 + this.calcWindowHeight(10, true), Graphics.boxWidth, this.calcWindowHeight(9, true) + 12);
    this._statusWindow = new Window_ShopStatus(rect);
    this._statusWindow.hide();
    this.addWindow(this._statusWindow);
};

Scene_Shop.prototype.createBuyWindow = function () {
    const rect = new Rectangle(0, 56 + this.calcWindowHeight(4, true) + 12, Graphics.boxWidth, this.calcWindowHeight(5, true));
    this._buyWindow = new Window_ShopBuy(rect);
    this._buyWindow.setupGoods(this._goods);
    this._buyWindow.setHelpWindow(this._helpWindow);
    this._buyWindow.setStatusWindow(this._statusWindow);
    this._buyWindow.hide();
    this._buyWindow.setHandler("ok", this.onBuyOk.bind(this));
    this._buyWindow.setHandler("cancel", this.onBuyCancel.bind(this));
    this.addWindow(this._buyWindow);
};

Scene_Shop.prototype.createCategoryWindow = function () {
    const rect = new Rectangle(0, 56 + this.calcWindowHeight(5, true) - 8, Graphics.boxWidth, this.calcWindowHeight(2, true));
    this._categoryWindow = new Window_ItemCategory(rect);
    this._categoryWindow.setHelpWindow(this._helpWindow);
    this._categoryWindow.hide();
    this._categoryWindow.deactivate();
    this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler("cancel", this.onCategoryCancel.bind(this));
    this.addWindow(this._categoryWindow);
};

Scene_Shop.prototype.createSellWindow = function () {
    const rect = new Rectangle(0, 56 + this.calcWindowHeight(7, true) + 20, Graphics.boxWidth, this.calcWindowHeight(10, true));
    this._sellWindow = new Window_ShopSell(rect);
    this._sellWindow.setHelpWindow(this._helpWindow);
    this._sellWindow.hide();
    this._sellWindow.setHandler("ok", this.onSellOk.bind(this));
    this._sellWindow.setHandler("cancel", this.onSellCancel.bind(this));
    this._categoryWindow.setItemWindow(this._sellWindow);
    this.addWindow(this._sellWindow);
    if (!this._categoryWindow.needsSelection()) {
        this._sellWindow.y -= this._categoryWindow.height;
        this._sellWindow.height += this._categoryWindow.height;
    }
};

Scene_Equip.prototype.statusWindowRect = function () {
    const wx = 0;
    const wy = 36 + this.calcWindowHeight(2, true);
    const ww = Graphics.boxWidth;
    const wh = 460;
    return new Rectangle(wx, wy, ww, wh);
};


Scene_Equip.prototype.commandWindowRect = function () {
    const wx = 0;
    const wy = 500;
    const ww = Graphics.boxWidth;
    const wh = 0;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Equip.prototype.slotWindowRect = function () {
    const commandWindowRect = this.commandWindowRect();
    const wx = 0;
    const wy = commandWindowRect.y + commandWindowRect.height + this.calcWindowHeight(2, true) - 3;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(7, true);
    return new Rectangle(wx, wy, ww, wh);
};

Game_Actor.prototype.changeEquip = function (slotId, item) {
    console.log(slotId, item)
    this.checkSkills(slotId, item)
    if (
        this.tradeItemWithParty(item, this.equips()[slotId]) &&
        (!item || this.equipSlots()[slotId] === item.etypeId)
    ) {
        this._equips[slotId].setObject(item);
        this.refresh();
    }
};

Game_Actor.prototype.checkSkills = function (slotId, item) {

    if (item === null) {
        var tmp = $dataArmors[this._equips[slotId]._itemId];
        console.log(tmp)
        var id = Number(tmp.meta.AprendeSkill);
        if (this.hasSkill(id)) {
            this.forgetSkill(id)
            console.log('esqueceu ' + id)
        }
    } else {
        if (item.meta.AprendeSkill) {
            var id = Number(item.meta.AprendeSkill);
            this.learnSkill(id)
            console.log('aprendeu ' + id)
        }
    }

};