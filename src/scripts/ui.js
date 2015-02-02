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

})();