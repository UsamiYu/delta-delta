/*
 * scene
 */
var game = game || {};

(function(){
/**
 * Sceneクラス
 */

    game.ShootingScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(num){
            this.superInit();
            this.background = game.BackGround().setPosition(320, 480).addChildTo(this);
            //ゲーム描画領域(シーン描画領域とは異なる)
            this.gameField = tm.display.CanvasElement().addChildTo(this);
            this.gameField.onquake = function(e){
                var rx = (Math.random() * 2 < 1) ? 8 : -8;
                var ry = (Math.random() * 2 < 1) ? 8 : -8;
                this.tweener
                    .clear()
                    .moveBy(rx, ry, ~~(1000 / GAME_FPS))
                    .moveBy(-2 * rx, -2 * ry, ~~(2000 / GAME_FPS))
                    .move(0, 0, ~~(1000 / GAME_FPS))
                    .call(function(){
                        if(e.count > 0){
                            e.count -= 1;
                            this.tweener.rewind();
                        }
                    }.bind(this), ~~(1000 / GAME_FPS));
            }
            //弾描画レイヤー
            this.bulletLayer = tm.display.CanvasElement().addChildTo(this.gameField);
            //敵描画レイヤー
            this.enemyLayer = tm.display.CanvasElement().addChildTo(this.gameField);

            this.player = game.Player();
            this.player.addChildTo(this.gameField);
            
            //ゲーム描画領域より上に描画するもの
            var frame = game.GameFieldFrame().setPosition(320,480).addChildTo(this);
            //デバッグ情報用
//            var info = game.EnemyInfomation().setPosition(542, 776).addChildTo(this);

            this.scoreLabel = game.ScoreLabel().setPosition(24, 56);
            if(num > 0) this.scoreLabel.addChildTo(this);
            
            this.button = game.ModeChangeButton().setPosition(64, 654).setAlpha(0.3).addChildTo(this);
            
            this.stage = num || 0;
            this.danmakuList = game.danmakuList(this.stage);
            this.stepTick();
        },
        //ダブルタップチェック用変数
        pointingCheck: {
            count: 0,
            time: 0,
            durationTime: GAME_FPS / 4, //250ms
        },
        age: 0,
        timeBonus: 0,
        missCount: 0,
        danmaku: "",
        phase: 0,

        stepTick: function(){
            this.danmaku = this.danmakuList[this.phase];
            if(this.danmakuList.length <= this.phase){
                this.result();
                return;
            }
            if(this.danmaku === "") return;

            this.stopDanmaku();
            game.setDanmaku(this, this.player, this);
            this.timeBonus += 60 * GAME_FPS;
            this.phase++;

            game.EffectiveText("PHASE " + ("00" + this.phase + "/").substr(-3) + ("00" + this.danmakuList.length).substr(-2))
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
                if(player.getParent() === this.gameField) player.dispatchEvent(tm.event.Event("changemode"));
            };
        },

        onpointingend: function(){
            this.pointingCheck.time = 0;
            if(this.pointingCheck.count === 1) this.pointingCheck.count = 2;
            var player = this.player;
            if(player.getParent() === this.gameField){
                player.vx = player.vy = 0;
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
                game.destroyAnimation(enemies[i]);
            }
            this.bulletLayer.removeChildren();

            this.stepTick();
        },

        oncutin: function(e){
            //チュートリアルなどを差し込む
            var text = e.parm;
            alert(e.parm);
        },
        result: function(){
            if(this.stage !== 0){
                var bonus = Math.max(0, ~~((this.timeBonus - this.age) / (this.missCount + 1)) * 500);
                var result = game.Result(this.age, this.missCount, bonus).addChildTo(this);
                this.scoreLabel.score += bonus;
            }
             var text = tm.display.TextShape({
                 text: "Touch to Stage Select",
                 fillStyle: "hsl(240, 100%, 95%)",
                 strokeStyle: "hsl(240, 100%, 75%)",
                 fontSize: 32,
                 fontFamily: "Audiowide",
            });
            text.setPosition(320, 600);
            
            text.tweener
                .wait(1000)
                .fadeOut(1)
                .wait(500)
                .fadeIn(1)
                .setLoop(true);
            
            this.tweener
                .clear()
                .wait(1500)
                .call(function(){
                    this.player.remove();
                    text.addChildTo(this);
                    this.ontouchstart = function(){};
                    this.ontouchmove = function(){};
                    this.ontouchend = function(){
                        this.removeChildren();
                        this.app.replaceScene(game.SelectScene());
                    };
                }.bind(this));
        } 
    });
    
    game.TitleScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            
            this.setInteractive(false);
            game.BackGround().setPosition(320, 480).addChildTo(this);
            
            var title = tm.display.Sprite("title", 300, 120);
            title.setAlpha(0).setPosition(320, 320).setScale(2).addChildTo(this);
            
            title.tweener
                 .clear()
                 .fadeIn(1500)
                 .call(function(){ this.touchEnable() }.bind(this));
        },
        ontouchend: function(){
            this.app.replaceScene(game.SelectScene());
        },
        touchEnable: function(){
            this.setInteractive(true);
            var param = {
                fontSize: 32,
                fontFamily: "Audiowide",
                fillStyle: "hsl(240, 100%, 95%)",
                strokeStyle: "hsl(240, 100%, 75%)",
            };
            
            var title = tm.display.TextShape({text: "delta-delta"}.$safe(param)).setPosition(520, 420).addChildTo(this);
            
            var touch = tm.display.TextShape({text: "TOUCH START"}.$safe(param)).setPosition(320, 640).addChildTo(this);
            touch.tweener
                 .clear()
                 .fadeIn(1)
                 .wait(1000)
                 .fadeOut(1)
                 .wait(500)
                 .setLoop(true);
        }
    });

    game.SelectScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            
            var bg = game.BackGround().setPosition(320, 480).addChildTo(this);

            var buttons = ["Tutrial", "Stage1", "Stage2", "Stage3", "Stage4", "Stage5"];
            
            for(var i = 0,l = buttons.length;i < l;i++){
                var button = tm.ui.FlatButton({
                    width : 240,
                    height: 120,
                    text  : buttons[i]
                }).setPosition((i & 1) * 280 + 180, ~~(i / 2) * 150 + 120).addChildTo(this);
                button.num = i;
                button.onpointingend = function(){
                    this.parent.app.replaceScene(game.ShootingScene(this.num));
                }
            }
        },
    });

})();
