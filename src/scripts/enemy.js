/*
 * enemy
 */
var game = game || {};

(function(){
    
    game.destroyAnimation = function(elm){
        elm.update = function(){};
        elm.tweener
            .clear()
            .to({scaleX: 8.0, scaleY: 0.0}, 250)
            .call(function(){ if(this.parent) this.remove(); }.bind(elm));
    };
    
    
    
    game.Enemy = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);

            attr = attr.$safe(game.param.ENEMY_DEFAULT_ATTR);
            this.fromJSON(attr);
/*
            this.width = attr.width;
            this.height = attr.height;
            this.areaWidth = (this.width > this.height) ? this.width : this.height;
            this.hp = this.maxHp = attr.hp;
//            this.sides = attr.sides;
            this.danmaku = attr.danmaku;
//            this.danmakuList = attr.danmakuList;
            this.fieldOutCheck = attr.fieldOutCheck;
            this.type = attr.type;
//            this.target = attr.target;
            this.isSyncRotation = attr.isSyncRotation;
            this.addedAnimation = attr.addedAnimation;
*/
            this._isHitTestEnable = true;
            this.type = attr.type;
            this.maxHp = this.hp;
            this.preHitTestArea = (this.width > this.height) ? this.width : this.height;
            this.scene = "";

            var image = tm.display.Sprite(this.image, this.width, this.height);
            image.setFrameIndex(this.frameIndex).addChildTo(this);
            if(this.type === "boss") this.hpGauge = game.EnemyHpGauge(0, 0, this.maxHp);

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
                var explode = game.EnemyExplosion(this.x, this.y, Math.min(9, ~~((this.radius + this.maxHp) / 12)));
                explode.addChildTo(this.scene.enemyLayer);
            }
            this.remove();
        },

        onadded: function(){
            this.visible = true;
            this.scene = this.getRoot().app.currentScene;
            if(this.type === "boss") this.hpGauge.addChildTo(this.scene);
            if(this.danmaku !== "") game.setDanmaku(this, this.scene.player, this.scene);
            if(this._isHitTestEnable) this.scene.enemies.push(this);
            if(this.addedAnimation !== ""){
                switch(this.addedAnimation){
                    case "zoom":
                        this.setScale(2.5);
                        game.TweenAnimation(this, "in", 200, {});
                    break;
                    default:
                    break;
                };
            }
        },

        onremoved: function(){
            if(this.type === "boss") this.hpGauge.remove();
            this.scene.enemies.erase(this);
        },

        update: function(e){
            this.runner.update();
            if(this.isSyncRotation){
                var vec = tm.geom.Vector2(this.runner.x - this.x, this.runner.y - this.y).toAngle();
                this.rotation = Math.radToDeg(vec);
            }
            this.setPosition(this.runner.x, this.runner.y);

            if(this.fieldOutCheck && game.gameFieldOut(this) && this.parent){
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
        preHitTest: function(player){
            if((this.width === this.heigth) || this.rotation === 0 || this.rotation === 180){
                return this.isHitElemntRect(player);
            }
//            var length = (this.width > this.height) ? this.width : this.height;
            var rect = tm.geom.Rect(
                this.x - this.preHitTestArea * 0.5,
                this.y - this.preHitTestArea * 0.5,
                this.preHitTestArea,
                this.preHitTestArea);
            return tm.collision.testRectRect(rect, player.getBoundingRect());
        },
        isHitPlayer: function(player){
            if(!this.preHitTest(player)) return false;
            if(this.boundingType === "circle") return this.isHitPointCircle(player.x, player.y);
            if((this.width === this.height) && (this.rotation === 0 || this.rotation === 180)){
                return this.isHitPointRect(player.x, player.y);
            }
            return this.HitPointRectHierarchy(player.x, player.y);
        }

    });

    game.InvisibleEnemy = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);
            
            this.fieldOutCheck = attr.fieldOutCheck;
            
        },
        
        onadded: function(){
            this.scene = this.getRoot();
        },

        update: function(){
            this.runner.update();
            this.setPosition(this.runner.x, this.runner.y);
            
            if(this.fieldOutCheck && this.parent){
                if(this.x < GAME_FIELD_LEFT ||
                   this.x > GAME_FIELD_RIGHT ||
                   this.y < GAME_FIELD_TOP ||
                   this.y > GAME_FIELD_BOTTOM){
                    this.remove();
                    return;
                }
            }

            var player = this.scene.player;
            if(player.mode === "refrection" && this.parent){
                var r = 1600; // refrectionField.radius ^ 2
                if(tm.geom.Vector2(this.x, this.y).distanceSquared(player) < r) this.remove();
            }
        },
    });

    game.EnemyBullet = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);
            
            attr = {}.$extend(game.param.BULLET_DEFAULT_ATTR, attr);
            
            this.width = attr.width;
            this.height = attr.height;
//            this.radius = this.width / 2;
            this.fieldOutCheck = true;
            this.isSyncRotation = attr.isSyncRotation;
/*
            var width = (this.width === 64) ? 32 : this.width;
            var height = (this.height === 64) ? 32 : this.height;
*/
            var graphic = tm.display.Sprite("circle", this.width, this.height);
//            graphic.setFrameIndex(game.colorStyle.getColorIndex(attr.color) + (width !== 24) ? 11 : 0);
            graphic.setFrameIndex(attr.frameIndex).setAlpha(0.9);
//            graphic.setScale((this.width === 64) ? 2 : 1);
            graphic.addChildTo(this);

        },
        
        onadded: function(){
            this.scene = this.getRoot();
        },
        
        update: function(){
            this.runner.update();
            if(this.isSyncRotation){
                var vec = tm.geom.Vector2(this.runner.x - this.x, this.runner.y - this.y).toAngle();
                this.rotation = Math.radToDeg(vec);
            }
            this.setPosition(this.runner.x, this.runner.y);

            if(this.fieldOutCheck && game.gameFieldOut(this)){
                this.remove();
                return;
            }

            var field = this.scene.gameField;
            var player = this.scene.player;
            var scoreLabel = this.scene.scoreLabel;
            if(player.getParent() === field && player.hitFlag && this.parent){
                switch (player.mode) {
                    case "shot": 
                        if(this.preHitTest(player)){
                            player.power++;
                            scoreLabel.score += scoreLabel.v;
                            if(this.isHitPlayer(player)){
                                player.fire(tm.event.Event("destroy"));
                                return;
                            }
                        }
                    break;
                    case "refrection":
                        var bounding = tm.geom.Circle(player.x, player.y, 40);

                        if(tm.collision.testCircleCircle(this.getBoundingCircle(), bounding)){
                        //反射
                            var vec = tm.geom.Vector2(this.x - bounding.x, this.y - bounding.y);
                            var len = vec.length();
                            vec.normalize();
                            var distance = (this.radius + bounding.radius) - len;
                            var bulletPoint = tm.geom.Vector2.mul(vec, distance);

                            vec.mul(bounding.radius - this.radius);
                            var bullet = game.RefrectionBullet(this.x + bulletPoint.x, this.y + bulletPoint.y, vec.x, vec.y, this);
                            bullet.addChildTo(field);
                            this.remove();
//                            player.power += (this.radius - 7);
//                            player.power--;
                            scoreLabel.score += (scoreLabel.v * this.radius);
                            return;
                        }
                    break;
                    default:
                    break;
                }
            }
           
        },
        preHitTest: function(player){
            if(this.width === this.height) return this.isHitElementRect(player);
            var length = 0.5 * ((this.width > this.height) ? this.width : this.height);
            var rect = tm.geom.Rect(this.x - length, this.y - length, length * 2, length * 2);
            return tm.collision.testRectRect(rect, player.getBoundingRect());
        },
        isHitPlayer: function(player){
            if(this.width === this.height) return this.isHitPointCircle(player.x, player.y);
            if(this.rotation === 0 || this.rotation === 180) return this.isHitPointRect(player.x, player.y);
            var vec = tm.geom.Vector2(player.x - this.x, player.y - this.y);
            var p = tm.geom.Vector2().setRadian(vec.toAngle() - Math.degToRad(this.rotation), vec.length());
            var hW = this.width * 0.5;
            var hH = this.height * 0.5;
            if((p.x > -hW) && (p.x < hW) && (p.y > -hH) && (p.y < hH)) return true;
            return false;
        },
        
    });
    
    game.EnemyExplosion = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(x, y, rank){
            this.superInit();
            
            this.setPosition(x, y);
            this.rank = rank;
        },
        danmaku: "explode",
        onadded: function(){
            var scene = this.getRoot().app.currentScene;
            
            game.setDanmaku(this, scene.player, scene, {rank: this.rank});
        }
    });


})();
