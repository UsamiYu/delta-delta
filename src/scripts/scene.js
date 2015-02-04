/*
 * scene
 */
var myClass = myClass || {};

(function(){
/**
 * Sceneクラス
 */

    myClass.ShootingScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(num){
            this.superInit();
            //ダブルタップチェック用変数
            this.pointingCheck = {
                count: 0,
                time: 0,
                durationTime: GAME_FPS / 4, //250ms
            };
            //ゲーム描画領域(シーン描画領域とは異なる)
            this.gameField = tm.display.CanvasElement().addChildTo(this);
            //敵描画レイヤー
            this.enemyLayer = tm.display.CanvasElement().addChildTo(this.gameField);
            this.enemies = [];

            this.player = myClass.Player();
            this.player.addChildTo(this.gameField);
            //弾描画レイヤー
            this.bulletLayer = tm.display.CanvasElement().addChildTo(this.gameField);

            //ゲーム描画領域より上に描画するもの
            var frame = tm.display.RectangleShape({
                width      : 634,
                height     : 708,
                fillStyle  : "rgba(0, 0, 0, 0.0)",
                strokeStyle: myClass.colorStyle.getColorStyle("blue").strokeStyle,
                lineWidth  : 16}).setPosition(319,369).addChildTo(this);

            this.scoreLabel = myClass.ScoreLabel().addChildTo(this);
            
            this.stage = num || 0;
            this.danmaku = "";
            this.danmakuList = myClass.danmakuList(this.stage);
            this.age = this.timeBounus = this.missCount = 0;
            this.phase = 0;
            this.stepTick();
        },

        stepTick: function(){
            this.danmaku = this.danmakuList[this.phase];
            if(this.danmakuList.length <= this.phase){
                this.result();
                return;
            }
//            this.danmakuList.splice(0, 1);
            if(this.danmaku === "") return;

            this.stopDanmaku();
            myClass.setDanmaku(this, this.player, this);
            this.timeBounus += 60 * GAME_FPS;
            this.phase++;

            myClass.EffectiveText("PHASE " + ("00" + this.phase).substr(-2))
                   .setPosition(320, 240)
                   .addChildTo(this);
        },
        
        update: function(){
            this.age++;
            if(this.pointingCheck.count > 0){
                this.pointingCheck.time++;

                if(this.pointingCheck.time > this.pointingCheck.durationTime){
                    this.pointingCheck.time = this.pointingCheck.count = 0;
                }
            }
        },
        
        onpointingstart: function(){
            this.pointingCheck.time = 0;
            if(this.pointingCheck.count === 0) this.pointingCheck.count = 1;
            if(this.pointingCheck.count === 2){
                this.pointingCheck.count = 0;
                var player = this.player;
                if(player.getParent() === this.gameField) player.fire(tm.event.Event("changemode"));
            };
        },

        onpointingend: function(){
            this.pointingCheck.time = 0;
            if(this.pointingCheck.count === 1) this.pointingCheck.count = 2;
            var player = this.player;
            if(player.getParent() === this.gameField){
                player.vx = player.vy = 0;
//                if(this.pointingCheck.count === 3) player.changeMode();
            }
            
        },

        onpointingmove: function(e){
            var p = e.pointing;
            var player = this.player;
            if(player.tweener.isPlaying){
                player.vx = player.vy = 0;
                return;
            }

            if(player.getParent() === this.gameField){
                player.vx = Math.min(Math.max(-player.radius, p.dx), player.radius);
                player.vy = Math.min(Math.max(-player.radius, p.dy), player.radius);
            }
        },
        
        onclearstage: function(){
            this.stopDanmaku();
            var enemies = this.enemyLayer.children;
            for(var i = 0, l = enemies.length;i < l;i++){
                enemies[i]._isHitTestEnable = false;
                enemies[i].stopDanmaku();
                myClass.destroyAnimation(enemies[i]);
            }
            this.enemies.length = 0;
            this.bulletLayer.removeChildren();

            this.stepTick();
        },

        ondanmakuend: function(){
            this.stepTick();
        },

        oncutin: function(e){
            //チュートリアルなどを差し込む
//            var scene = tm.app.Scene();
            var text = e.parm;
            alert(e.parm);
/*            scene.onenterframe = function(){
               alert(text);
               this.app.popScene();
            }
            this.app.pushScene(scene); */
        },
        result: function(){
            var color = myClass.colorStyle.getColorStyle("blue");
            var param = color.$extend({
                width     : 640,
                height    : 48,
                fontSize  : 48,
                fontFamily: "'Consolas', 'Monaco', 'ＭＳ ゴシック'",
                text      : "RESULT"});
            var result = tm.display.TextShape(param)
                .setPosition(320, 140)
                .addChildTo(this);
                
            var t = this.age / GAME_FPS;
            var ms = ~~((t - ~~(t)) * 100);
            var mm = Math.floor(t / 60);
            var ss = Math.floor(t) - mm * 60;
            param.text = "CLEAR TIME     {0}:{1}.{2}".format(
                ("00" + mm).substr(-2),
                ("00" + ss).substr(-2),
                ("00" + ms).substr(-2)
            );
            param.fontSize = 32;
            param.fontFamily = "'Consolas', 'Monaco', 'ＭＳ ゴシック'";
            var time = tm.display.TextShape(param)
                .setPosition(320, 260)
                .addChildTo(this);
            
            var tb = (this.timeBounus - this.age) * 1000;
            tb = (tb < 1) ? 0 : tb;
/*            param.text = "TIME BOUNUS    {0}".format(("00000000" + tb).substr(-8));
            var timeBounus = tm.display.TextShape(640, 48, param)
                .setPosition(320, 320)
                .addChildTo(this);
*/
            param.text = "MISS                {0}".format(("   " + this.missCount).substr(-3));
            var miss = tm.display.TextShape(param)
                .setPosition(320, 360)
                .addChildTo(this);
            
            var score = ~~(tb / (this.missCount + 1) / 10) * 10;
            this.scoreLabel.score += score;
            param.text = "TOTAL BOUNUS {0}".format(("0000000000" + score).substr(-10));
            var score = tm.display.TextShape(param)
                .setPosition(320, 500)
                .addChildTo(this);
        }
    });

    myClass.SelectScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            var buttons = ["Test", "Tutrial", "Stage1", "Stage2", "Stage3"];
            
            for(var i = 0,l = buttons.length;i < l;i++){
                var button = tm.ui.FlatButton({
                    width : 240,
                    height: 120,
                    text  : buttons[i]})
                    .setPosition((i & 1) * 280 + 180, ~~(i / 2) * 150 + 120).addChildTo(this);
                button.num = i;
                button.onpointingend = function(){
                    this.parent.app.replaceScene(myClass.ShootingScene(this.num));
                }
            }
        },
    });

})();