
/*:
 * @target MZ
 * @plugindesc (v1.0) Configuracoes Basicas de menu
 * @author Leon Kowalski
 * 
 * */

Window_MenuCommand.prototype.makeCommandList = function () {
    this.addMainCommands();
    this.addFormationCommand();
    this.addOriginalCommands();
    //this.addOptionsCommand();
    this.addSaveCommand();
    this.addGameEndCommand();
};

Window_MenuCommand.prototype.numVisibleRows = function () {
    return 2;
};

Window_MenuCommand.prototype.maxCols = function () {
    return 2;
};

Window_MenuStatus.prototype.numVisibleRows = function () {
    return 2;
};

Window_MenuStatus.prototype.maxCols = function () {
    return 2;
};

Window_MenuStatus.prototype.drawItem = function (index) {
    this.drawPendingItemBackground(index);
    this.drawItemStatus(index);
};

Window_MenuStatus.prototype.drawItemStatus = function (index) {
    const actor = this.actor(index);
    const rect = this.itemRect(index);
    const x = rect.x;
    const y = rect.y;
    this.drawActorStatus(actor, x, y);
};

Window_MenuStatus.prototype.drawActorStatus = function (actor, x, y) {
    const lineHeight = this.lineHeight();
    x += 16;
    y += 16;
    const widthF = ImageManager.faceWidth;
    const heightF = ImageManager.faceHeight / 2;
    this.changePaintOpacity(actor.isBattleMember());
    this.drawActorFace(actor, x, y, widthF, heightF);
    this.changePaintOpacity(true);
    this.drawActorName(actor, x, y + 8 + lineHeight * 1);
    this.drawActorIcons(actor, x, y + lineHeight * 2);
    this.drawActorClass(actor, x, y + lineHeight * 3);
    this.actorGauges(actor, x, y + lineHeight * 4);
    this.drawAtrributes(actor, x, y + lineHeight * 5, lineHeight);
};

Window_StatusBase.prototype.actorGauges = function (actor, x, y) {
    this.placeGauge(actor, "hp", x, y - 8);
    this.placeGauge(actor, "mp", x, y + this.gaugeLineHeight());
    this.drawIcon(32, x, y);
    this.drawIcon(33, x, y + this.gaugeLineHeight() + 8);
};

Window_StatusBase.prototype.placeGauge = function (actor, type, x, y) {
    const key = "actor%1-gauge-%2".format(actor.actorId(), type);
    const sprite = this.createInnerSprite(key, Sprite_GaugeMenu);
    sprite.setup(actor, type);
    sprite.move(x, y);
    sprite.show();
};

Window_StatusBase.prototype.drawAtrributes = function (actor, x, y, lineHeight) {
    y += 36;
    var icon = 90;
    var iconSpacing = 40;
    var colspacing = 100;
    var x2 = x + colspacing
    this.drawIcon(icon, x, y);
    this.drawText(actor.atk, x + iconSpacing, y, colspacing, 'left');
    icon++;
    this.drawIcon(icon, x2, y);
    this.drawText(actor.atk, x2 + iconSpacing, y, colspacing, 'left');
    icon++;
    y += lineHeight;
    this.drawIcon(icon, x, y);
    this.drawText(actor.mat, x + iconSpacing, y, colspacing, 'left');
    icon++;
    this.drawIcon(icon, x2, y);
    this.drawText(actor.mdf, x2 + iconSpacing, y, colspacing, 'left');
    icon++;
    y += lineHeight;
    this.drawIcon(icon, x, y);
    this.drawText(actor.agi, x + iconSpacing, y, colspacing, 'left');
    icon++;
    this.drawIcon(icon, x2, y);
    this.drawText(actor.luk, x2 + iconSpacing, y, colspacing, 'left');
};

Window_ItemCategory.prototype.maxCols = function () {
    return 2;
};

Window_ItemCategory.prototype.maxCols = function () {
    return 2;
};

Window_ItemList.prototype.maxCols = function () {
    return 1;
};


Scene_Menu.prototype.statusWindowRect = function () {
    const ww = Graphics.boxWidth;
    const wy = 56 + this.calcWindowHeight(3, true) + 16;
    const wh = this.mainAreaHeight() - wy + this.calcWindowHeight(1, true) - 16;
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;

    return new Rectangle(wx, wy, ww, wh);
};

Scene_Menu.prototype.goldWindowRect = function () {
    const ww = Graphics.boxWidth
    const wh = this.calcWindowHeight(1, true);
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = 56;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Menu.prototype.commandWindowRect = function () {
    const ww = Graphics.boxWidth
    const wh = this.calcWindowHeight(2, true);
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = 56 + this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Item.prototype.categoryWindowRect = function () {
    const wx = 0;
    const wy = 56;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(2, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Item.prototype.createCategoryWindow = function () {
    const rect = this.categoryWindowRect();
    this._helpWindow.y = this.calcWindowHeight(3, true);
    this._categoryWindow = new Window_ItemCategory(rect);
    this._categoryWindow.setHelpWindow(this._helpWindow);
    this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._categoryWindow);
};

Scene_Item.prototype.itemWindowRect = function () {
    const wx = 0;
    const wy = this._categoryWindow.y + this._categoryWindow.height + this.calcWindowHeight(1, true) + 12;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(5, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Item.prototype.statusWindowRect = function () {
    const wx = 0;
    const wy = 500;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(9, true)+16;
    return new Rectangle(wx, wy, ww, wh);
};

function Sprite_GaugeMenu() {
    this.initialize(...arguments);
}

Sprite_GaugeMenu.prototype = Object.create(Sprite_Gauge.prototype);
Sprite_GaugeMenu.prototype.constructor = Sprite_GaugeMenu;

Sprite_GaugeMenu.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this.createBitmap();
};

Sprite_GaugeMenu.prototype.bitmapWidth = function () {
    return 200;
};

Sprite_GaugeMenu.prototype.bitmapWidth = function () {
    return 200;
};

Sprite_Gauge.prototype.valueFontSize = function () {
    return $gameSystem.mainFontSize();
};

Sprite_Gauge.prototype.bitmapHeight = function () {
    return 36;
};

Sprite_GaugeMenu.prototype.redraw = function () {
    this.bitmap.clear();
    const currentValue = this.currentValue();
    if (!isNaN(currentValue)) {
        this.drawGauge();
        if (this._statusType !== "time") {
            //this.drawLabel();
            if (this.isValid()) {
                this.drawValue();
            }
        }
    }
};

Scene_Skill.prototype.itemWindowRect = function () {
    const wx = 0;
    const wy = this._statusWindow.y + this._statusWindow.height;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(5, true)
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Skill.prototype.shopStatusWindowRect = function () {
    const wx = 0;
    const wy = this._statusWindow.y + this._statusWindow.height+ this.calcWindowHeight(5, true);
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(8, true)
    return new Rectangle(wx, wy, ww, wh);
};

//  var aliasShopSkillMenu =  Scene_Skill.prototype.createShopStatusWindow
//  Scene_Skill.prototype.createShopStatusWindow = function(){
//      aliasShopSkillMenu.call(this)
//      this._shopStatusWindow.x = 0;
//      this._shopStatusWindow.y = 548;
//      this._shopStatusWindow.innerRect = new Rectangle(0, 548, Graphics.boxWidth, this.calcWindowHeight(8, true))
//      this._shopStatusWindow._resetRect = new Rectangle(0, 548, Graphics.boxWidth, this.calcWindowHeight(8, true))
//      this._shopStatusWindow.width = Graphics.boxWidth;
//      this._shopStatusWindow.height = this.calcWindowHeight(8, true)
//      this._shopStatusWindow.innerWidth = Graphics.boxWidth;
//      this._shopStatusWindow.innerHeight = this.calcWindowHeight(8, true)
//  }