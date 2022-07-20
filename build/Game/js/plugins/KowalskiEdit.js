/*:
 * @target MZ
 * @plugindesc (v1.0) Configuracoes Basicas
 * @author Leon Kowalski
 * 
 * */

Sprite_Damage.prototype.createMiss = function() {
    const h = this.fontSize();
    const w = Math.floor(h * 8.0);
    const sprite = this.createChildSprite(w, h);
    sprite.bitmap.drawText("Desviou", 0, 0, w, h, "center");
    sprite.dy = 0;
};

Sprite_Damage.prototype.fontSize = function() {
    return 28;
};

Sprite_Damage.prototype.outlineWidth = function() {
    return 8;
};

SpriteSkillName.prototype.getNameData = function() {
	this._nameData = [0,0,0,0];
	this._nameData[0] = this._layoutImg.width;
	this._nameData[1] = Math.floor(this._layoutImg.height / 3);
	this._name.bitmap = new Bitmap(200,32);
	this._name.bitmap.fontSize = Moghunter.skillName_FontSize;
	this._name.y = Moghunter.skillName_name_y;
	this._icon.x = Moghunter.skillName_icon_x;
	this._icon.y = Moghunter.skillName_icon_y;
};

SpriteSkillName.prototype.fontFace = function() {
    return $gameSystem.numberFontFace();
};

SpriteSkillName.prototype.refreshSkillName = function() {
	$gameTemp._skillNameData[0] = false;
	this._name.bitmap.clear();
	this._layout.opacity = 0;
	if (!this.item()) {return};
	var text = this.item().name;
	var textsize = ((text.length * 7) + this._nameData[0]);
	var wsize = (Math.min(Math.max(textsize,48),200));
    var wposX = ((wsize / 2) + Math.floor(this._nameData[0] / 2));	
    for (var i = 0; i < this._layout.length; i++) {
		 this._layout[i].x = 1;
		 this._layout[i].y = 1;		
	     if (i === 0) {
		     this._layout[i].setFrame(0,0,this._nameData[0],this._nameData[1]);
		     this._layout[i].x -= wposX;			 
		 } else if (i === 1) {
		     this._layout[i].setFrame(0,this._nameData[1],this._nameData[0],this._nameData[1]);
		     this._layout[i].x += wposX;	
		 } else {
		     this._layout[i].setFrame(0,this._nameData[1] * 2,this._nameData[0],this._nameData[1]);
			 this._layout[i].scale.x = wsize / this._nameData[0];
		 };
	};
    this._name.bitmap.fontFace = this.fontFace();		
	this._name.bitmap.drawText(this.item().name,0,0,200,32,"center")	
	this._name.x = Moghunter.skillName_name_x;
	this._wait = 4;
	var w = ImageManager.iconWidth;
	var h = ImageManager.iconHeight;
	var sx = this.item().iconIndex % 16 * w;
	var sy = Math.floor(this.item().iconIndex / 16) * h;
    this._icon.setFrame(sx,sy,w,h);
};

ColorManager.gaugeBackColor = function() {
    return this.textColor(19);
};

ColorManager.hpGaugeColor1 = function() {
    return '#ff434b';
};

ColorManager.hpGaugeColor2 = function() {
    return '#ec252d';
};

ColorManager.mpGaugeColor1 = function() {
    return '#4382ff';
};

ColorManager.mpGaugeColor2 = function() {
    return '#2a63d4';
};

ATB_Gauge.prototype.createIcons = function() {
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
		 if (this._skillIcon) {this.createSkillIcon(i,this._icons[i])};
	};	
};