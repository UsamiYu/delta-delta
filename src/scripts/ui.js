/*
 * ui.js
 */

var game = game || {};

(function(){

    game.ScoreLabel = tm.createClass({
         superClass: tm.display.Label,
         
         init: function(){
             this.superInit("SCORE:0000000000");
             this.setAlign("left");
             this.setFontSize(32);
//             this.setFontFamily();
             this.x = 24;
             this.y = 48;
             
             this.score = 0;
             this.v = 600 / GAME_FPS; //スコア係数
         },
         update: function(){
             this.text = "SCORE:" + ("0000000000" + ~~(this.score)).substr(-10);
         },
    });

    game.EnemyHpGauge = tm.createClass({
        superClass: tm.ui.Gauge,
        
        init: function(x, y, maxHp){
            this.superInit({
                width: 632,
                height: 24,
                x: x || 4,
                y: y || 4,
                bgColor: "red",
                color: "lime",
                animationTime: 1000,
                borderWidth: 2,
            });

            this.maxHp = this.value = this.hp = maxHp;
        },
        
        setHp: function(hp){
            if(this.hp === hp) return;
            this.hp = hp;
            this.setValue(this.hp / this.maxHp * 100);
        },
    });
    
    game.EffectiveText = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(text){
            this.superInit();

            if(!text) return;
            
            this.text = text;
            this.count = 0;
            this.textColor = game.colorStyle.getColorStyle("blue");
            this.age = 0;
        },
        tick: function(){
            var count = this.children.length;
            if(count >= this.text.length){
                this.update = function(){ if(count < 1) this.remove(); };
                return;
            }

            var textShape = tm.display.TextShape({
                fontSize: 32,
//                fontFamily: "font",
                fillStyle: this.textColor.fillStyle,
                strokeStyle: this.textColor.strokeStyle,
                text: this.text[count]
            })
            .setPosition(count * 32 - this.text.length * 16, 0)
            .addChildTo(this);
            
            var sx = textShape.scaleX = 0.2;
            var sy = textShape.scaleY = 10.0;

            game.TweenAnimation(textShape, "draw_phase", 240, {scaleX: sx, scaleY: sy});

        },
        update: function(){
            if(this.age > 6){
                this.tick();
                this.age = 0;
            }
            this.age++;
        },
    });

    game.ModeChangeButton = tm.createClass({
        superClass: tm.display.Sprite,
        
        init: function(){
            this.superInit("polygon", 96, 96);
            this.setFrameIndex(2);
            
            this.setInteractive(true);
            this.boundingType = "circle";
            var text = tm.display.TextShape({
                text: "C",
                fontSize: 48,
            }).addChildTo(this);
        },
        onpointingstart: function(){
            this.setScale(0.9);
        },
        onpointingend: function(){
            this.setScale(1);
            var scene = this.parent;
            scene.pointingCheck.count = 0;
            scene.player.dispatchEvent(tm.event.Event("changemode"));
        }
    });
    
    game.GameFieldFrame = tm.createClass({
        superClass: tm.display.Shape,
        
        init: function(){
            this.superInit({
                width    : 640,
                height   : 960,
                fillStyle: "rgb(127, 127, 196)"
            });

            this.autoRender = false;
        },
        _render: function(){
            this.canvas.fillRect(0, 0, this.width, this.height);
            this.canvas.clear(GAME_FIELD_LEFT, GAME_FIELD_TOP, 608, 688);
        }
    });
    
    game.EnemyCounter = tm.createClass({
        superClass: tm.display.Label,
        
        init: function(){
            this.superInit("enemy:000/ 000");
            this.setAlign("left");
            this.setFontSize(32);
            this.maxValue = 0;
        },
        update: function(app){
            var v = this.parent.enemyLayer.children.length;
            if(this.maxValue < v) this.maxValue = v;
            this.text = "enemy:" + ("000" + v).substr(-3) + "/" + ("000" + this.maxValue).substr(-3);
        }
    });
    
    game.BulletCounter = tm.createClass({
        superClass: tm.display.Label,
        
        init: function(){
            this.superInit("bullet:0000/0000");
            this.setAlign("left");
            this.setFontSize(32);
            this.maxValue = 0;
            this.autoRender = false;
        },
        update: function(app){
            var v = this.parent.bulletLayer.children.length;
            if(this.maxValue < v) this.maxValue = v;
            this.text = "bullet:" + ("0000" + v).substr(-4) + "/" + ("0000" + this.maxValue).substr(-4);
        }
    });
})();