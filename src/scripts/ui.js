/*
 * ui.js
 */

var myClass = myClass || {};

(function(){

    myClass.ScoreLabel = tm.createClass({
         superClass: tm.display.Label,
         
         init: function(){
             this.superInit("SCORE:0000000000");
             this.setAlign("left");
             this.x = 22;
             this.y = 48;
             
             this.score = 0;
             this.v = 600 / GAME_FPS; //スコア係数
         },
         update: function(){
             this.text = "SCORE:" + ("0000000000" + ~~(this.score)).substr(-10);
         },
    });

    myClass.EnemyHpGauge = tm.createClass({
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
    
    myClass.EffectiveText = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(text){
            this.superInit();

            if(!text) return;
            
            this.text = text;
            this.textColor = myClass.colorStyle.getColorStyle("blue");
            this.age = 0;
/*
            for(var i = 0,l = text.length;i < l;i++){
                var textShape = tm.display.TextShape({
                    fontSize: 32,
                    fillStyle: color.fillStyle,
                    strokeStyle: color.strokeStyle,
                    text: text[i]
                })
                .setPosition(i * 32 - l * 16, 0)
                .addChildTo(this);
                textShape.scaleX = 5.0;
                textShape.scaleY = 0.2;

                myClass.TweenAnimation(textShape, "in", 250, {scaleX: 1.0, scaleY: 1.0});
                
            } */
        },
        update: function(){
            var textShape = tm.display.TextShape({
                fontSize: 32,
                fillStyle: this.textColor.fillStyle,
                strokeStyle: this.textColor.strokeStyle,
                text: this.text[this.age]
            })
            .setPosition(this.age * 32 - this.text.length * 16, 0)
            .addChildTo(this);

            var sx = 0.2;
            var sy = 9.0;
            
            textShape.scaleX = sx;
            textShape.scaleY = sy;
            
            myClass.TweenAnimation(textShape, "draw_phase", 250, {scaleX: sx, scaleY: sy});

            this.age++;
            if(this.age >= this.text.length){
                this.tweener
                    .wait(1500)
                    .call(function(){ this.remove(); }.bind(this));

                this.update = function(){};
            }
        },
    });

})();