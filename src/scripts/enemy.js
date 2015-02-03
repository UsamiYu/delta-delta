/*
 * enemy
 */
var myClass = myClass || {};

(function(){
    
    myClass.destroyAnimation = function(elm){
        elm.update = function(){};
        elm.tweener
            .clear()
            .to({scaleX: 8.0, scaleY: 0.0}, 250)
            .call(function(){ if(this.parent) this.remove(); }.bind(elm));
    };
    
    
    
    myClass.EnemyCore = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);

            attr = {}.$extend(myClass.param.ENEMY_DEFAULT_ATTR, attr);
            
            this.x = attr.x;
            this.y = attr.y;
            this.width = attr.width;
            this.height = attr.height;
            this.hp = this.maxHp = attr.hp;
            this.sides = attr.sides;
            this.danmaku = attr.danmaku;
//            this.danmakuList = attr.danmakuList;
            this.fieldOutCheck = attr.fieldOutCheck;
            this.type = attr.type;
//            this.target = attr.target;
            this.isSyncRotation = attr.isSyncRotation;
            this._isHitTestEnable = true;
            
            this.scene = "";

            var graphics;
            var style = myClass.colorStyle.getColorStyle(attr.color);
            
            switch (this.sides){
                case 3:
                    graphics = tm.display.TriangleShape({
                        width      : this.width,
                        height     : this.height,
                        fillStyle  : style.fillStyle,
                        strokeStyle: style.strokeStyle,
                        lineWidth  : Math.max(this.width, this.height) * 0.2 }).addChildTo(this);
                break;
                case 5:
                case 6:
                    graphics = tm.display.PolygonShape({
                        width      : this.width,
                        height     : this.height,
                        sides      : this.sides,
                        fillStyle  : style.fillStyle,
                        strokeStyle: style.strokeStyle,
                        lineWidth  : Math.max(this.width, this.height) * 0.2 }).addChildTo(this);
                break;
                default:
                    graphics = tm.display.RectangleShape({
                        width      : this.width,
                        height     : this.height,
                        fillStyle  : style.fillStyle,
                        strokeStyle: style.strokeStyle,
                        lineWidth  : Math.max(this.width, this. height) * 0.2 }).addChildTo(this);                    
                break;
            }

            if(this.type === "boss") this.hpGauge = myClass.EnemyHpGauge(0, 0, this.maxHp);

        },
        ondestroy: function(){
            if(!this.parent) return;
            this.scene.scoreLabel.score += this.maxHp * 10;
            var player = this.scene.player;
            this.stopDanmaku();
            if(this.type === "boss"){
                this.scene.fire(tm.event.Event("clearstage"));
                return;
            }
            var dist = tm.geom.Vector2(this.x, this.y).distanceSquared(player);
            if(dist > 10000){  //距離100px ^ 2
                var explode = myClass.EnemyExplosion(this.x, this.y, ~~(this.radius / 16 * (this.sides - 1)));
                explode.addChildTo(this.scene.enemyLayer);
            }
            this.remove();
        },

        onadded: function(){
            this.visible = true;
            this.scene = this.getRoot().app.currentScene;
            if(this.type === "boss") this.hpGauge.addChildTo(this.scene);
            if(this.danmaku !== "") myClass.setDanmaku(this, this.scene.player, this.scene);
            if(this._isHitTestEnable) this.scene.enemies.push(this);
        },

        onremoved: function(){
            if(this.type === "boss") this.hpGauge.remove();
            this.scene.enemies.erase(this);
        },

        update: function(e){
            this.runner.update();
            if(this.isSyncRotation){
                var vec = tm.geom.Vector2(this.runner.x - this.x, this.runner.y - this.y).toAngle();
                this.rotation = Math.radToDeg(vec) + 90;
            }
            this.setPosition(this.runner.x, this.runner.y);

            if(this.fieldOutCheck && myClass.gameFieldOut(this)){
                this.remove();
                return;
            }

            if(this.type === "boss") this.hpGauge.setHp(this.hp);

            if(this._isHitTestEnable){
                if(this.hp < 1){
                    this._isHitTestEnable = false;
                    this.fire(tm.event.Event("destroy"));
                    return;
                }
                var player = this.scene.player;
                if(player.hitFlag){
                    if(this.isHitPointRectHierarchy(player.x, player.y)){
                        player.dispatchEvent(tm.event.Event("destroy"));
                        return;
                    }
                }
            }
        },

    });
    
    myClass.EnemyBullet = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);
            
            attr = {}.$extend(myClass.param.BULLET_DEFAULT_ATTR, attr);
            
            this.width = attr.width;
            this.height = attr.height;
            this.radius = this.width / 2;
            this.fieldOutCheck = true;

            var width = (this.width === 64) ? 32 : this.width;
            var height = (this.height === 64) ? 32 : this.height;

            var graphic = tm.display.Sprite("bullet", width, height);
            graphic.setFrameIndex(myClass.colorStyle.getColorIndex(attr.color) + (width !== 24) ? 11 : 0);

            graphic.alpha = 0.9;
            graphic.setScale((this.width === 64) ? 2 : 1);
            graphic.addChildTo(this);

        },
        
        onadded: function(){
            this.scene = this.getRoot();
        },
        
        update: function(e){
            this.runner.update();
            this.setPosition(this.runner.x, this.runner.y);

            if(this.fieldOutCheck && myClass.gameFieldOut(this)){
                this.remove();
                return;
            }

            var field = this.scene.gameField;
            var player = this.scene.player;
            var scoreLabel = this.scene.scoreLabel;
            if(player.getParent() === field && player.hitFlag && this.parent){
                switch (player.mode) {
                    case "shot": 
                        if(this.isHitElementRect(player)){
                            player.power++;
                            scoreLabel.score += scoreLabel.v;
                            if(this.isHitPointCircle(player.x, player.y)){
                                player.fire(tm.event.Event("destroy"));
                                return;
                            }
                        }
                    break;
                    case "refrection":
                        var bounding = tm.geom.Circle(player.x, player.y, player.refrectionField.radius);

                        if(tm.collision.testCircleCircle(this.getBoundingCircle(), bounding)){
                        //反射
                            var vec = tm.geom.Vector2(this.x - bounding.x, this.y - bounding.y);
                            var len = vec.length();
                            vec.normalize();
                            var distance = (this.radius + bounding.radius) - len;
                            var bulletPoint = tm.geom.Vector2.mul(vec, distance);

                            vec.mul(bounding.radius - this.radius);
                            var bullet = myClass.RefrectionBullet(this.x + bulletPoint.x, this.y + bulletPoint.y, this.radius * 2, vec.x, vec.y);
                            bullet.addChildTo(field);
                            this.remove();
//                            player.power += (this.radius - 7);
                            player.power--;
                            scoreLabel.score += (scoreLabel.v * this.radius);
                            return;
                        }
                    break;
                    default:
                    break;
                }
            }
           
        },
        
    });
    
    myClass.EnemyExplosion = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(x, y, rank){
            this.superInit();
            
            this.setPosition(x, y);
            this.danmaku = "explode";
            this.rank = rank;
        },
        onadded: function(){
            var scene = this.getRoot().app.currentScene;
            
            myClass.setDanmaku(this, scene.player, scene, {rank: this.rank});
        }
    });


})();
