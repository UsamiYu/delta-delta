/*
 * parameter
 */

/*
 * 定数
 */
 
var SCREEN_WIDTH      = 640;
var SCREEN_HEIGHT     = 960;

var GAME_FIELD_LEFT   = 16;
var GAME_FIELD_RIGHT  = 624;
var GAME_FIELD_TOP    = 32;
var GAME_FIELD_BOTTOM = 720;

var GAME_FPS          = 60;

/*
 *  自分用クラスをグローバルに確保
 */
 
var myClass = myClass || {};

(function(){
    myClass.colorStyle = {
        RED   : {fillStyle: "hsl(  0, 100%, 95%)", strokeStyle: "hsl(  0, 100%, 75%)", index: 0 },
        ORANGE: {fillStyle: "hsl( 30, 100%, 95%)", strokeStyle: "hsl( 30, 100%, 75%)", index: 1 },
        YELLOW: {fillStyle: "hsl( 60, 100%, 95%)", strokeStyle: "hsl( 60, 100%, 75%)", index: 2 },
        LIME  : {fillStyle: "hsl( 90, 100%, 95%)", strokeStyle: "hsl( 90, 100%, 75%)", index: 3 },
        GREEN : {fillStyle: "hsl(120, 100%, 95%)", strokeStyle: "hsl(120, 100%, 75%)", index: 4 },
        CYAN  : {fillStyle: "hsl(180, 100%, 95%)", strokeStyle: "hsl(180, 100%, 75%)", index: 5 },
        BLUE  : {fillStyle: "hsl(240, 100%, 95%)", strokeStyle: "hsl(240, 100%, 75%)", index: 6 },
        PURPLE: {fillStyle: "hsl(270, 100%, 95%)", strokeStyle: "hsl(270, 100%, 75%)", index: 7 },
        PINK  : {fillStyle: "hsl(300, 100%, 95%)", strokeStyle: "hsl(300, 100%, 75%)", index: 8 },
        GRAY  : {fillStyle: "#7f7f7f",             strokeStyle: "#3a3a3a",             index: 9 },
        WHITE : {fillStyle: "#b7b7b7",             strokeStyle: "#efefef",             index:10 },
        getColorStyle: function(name){
            return {
                "red"   : this.RED,
                "orange": this.ORANGE,
                "yellow": this.YELLOW,
                "lime"  : this.LIME,
                "green" : this.GREEN,
                "cyan"  : this.CYAN,
                "blue"  : this.BLUE,
                "purple": this.PURPLE,
                "pink"  : this.PINK,
                "gray"  : this.GRAY,
                "white" : this.WHITE
            }[name];
        },
        getColorIndex: function(name){
            return this.getColorStyle(name).index;
/*
            return {
                "red"   : this.RED.index,
                "orange": this.ORANGE.index,
                "yellow": this.YELLOW.index,
                "lime"  : this.LIME.index,
                "green" : this.GREEN.index,
                "cyan"  : this.CYAN.index,
                "blue"  : this.BLUE.index,
                "purple": this.PURPLE.index,
                "pink"  : this.PINK.index,
                "gray"  : this.GRAY.index,
                "white" : this.WHITE.index
            }[name];
            */
        },
        getIndexOfColor: function(num){
            return this.getColorStyle([
                "red",
                "orange",
                "yellow",
                "lime",
                "green",
                "cyan",
                "blue",
                "purple",
                "pink",
                "gray",
                "white"
            ][num]);
        },
    };
    
    myClass.TweenAnimation = function(obj, type, time, param){
        param = param.$safe({
            scaleX  : 1.0,
            scaleY  : 1.0,
            alpha   : 1.0,
            rotation: 0,
        });
        
        if(time < 1) return;

        switch (type){
            case "in":
                obj.tweener
                   .clear()
                   .to(param, time);
            break;
            case "out":
                obj.update = function(){};
                obj.tweener
                   .clear()
                   .to(param, time)
                   .call(function(){ if(this.parent) this.remove(); }.bind(obj));
            break;
            case "draw_phase":
                obj.tweener
                   .clear()
                   .to({scaleX: 1.0, scaleY: 1.0}, time)
                   .wait(time * 2)
                   .to(param, time)
                   .call(function(){ if(this.parent) this.remove(); }.bind(obj));
            break;
            default:
            break;
        };
    };

    var bulletImage = tm.graphics.Canvas().resize(32 * 11, 32 * 2);
    for(var i = 0;i < 11; i++){
 //24x24弾画像
        bulletImage.save();
        bulletImage.translate(24 * i, 0);

        bulletImage.lineWidth = 4;
        
        var colorStyle = myClass.colorStyle.getIndexOfColor(i);

        bulletImage.setFillStyle(colorStyle.fillStyle)
                   .fillCircle(12, 12, 10)
                   .setStrokeStyle(colorStyle.strokeStyle)
                   .strokeCircle(12, 12, 9);
        bulletImage.restore();
//32x32弾画像
        bulletImage.save();
        bulletImage.translate(32 * i, 32);
        
        bulletImage.lineWidth = 6;
        
        bulletImage.setFillStyle(colorStyle.fillStyle)
                   .fillCircle(16, 16, 13)
                   .setStrokeStyle(colorStyle.strokeStyle)
                   .strokeCircle(16, 16, 13);
        bulletImage.restore();
    }

    tm.asset.Manager.set("bullet", bulletImage);


    myClass.param = {
        ENEMY_DEFAULT_ATTR: {
            x             : 0,
            y             : 0,
            width         : 48,
            height        : 48,
            hp            : 2000,
            sides         : 6,
            color         : "purple",
            danmaku       : "",
            fieldOutCheck : true,
            isSyncRotation: false,
            target        : "player",
        },
        BULLET_DEFAULT_ATTR: {
            width : 24,
            height: 24,
            color : "red",
        },
    };

    myClass.gameFieldOut = function(elm){
        if(elm.top    > GAME_FIELD_BOTTOM ||
           elm.bottom < GAME_FIELD_TOP ||
           elm.left   > GAME_FIELD_RIGHT ||
           elm.right  < GAME_FIELD_LEFT) return true;
           
        return false;
    }
    
    myClass.setDanmaku = function(elm, target, scene, param){

        var config = {
            target: target,
            createNewBullet: function(runner, attr){
                switch(attr.type){
                    case "enemy":
                    case "boss" :
                        var enemy = myClass.EnemyCore(runner, attr).addChildTo(scene.enemyLayer);
                    break;
                    case "invisible":
                    //実装予定
                    break;
                    default:
                        var bullet = myClass.EnemyBullet(runner, attr).addChildTo(scene.bulletLayer);
                    break;
                }
            }
        }

        elm.startDanmaku(myClass.danmakuPattern(elm.danmaku, param), config);

    };
    
    myClass.danmakuList = function(num){
        var list = [
            ["test1"],
            ["stage0_01", "stage0_02", "stage0_03"],
            ["stage1_01", "stage1_03", "stage2_01"],
            ["stage3_03", "stage2_02", "stage3_02"],
            ["stage3_01", "stage2_03", "stage1_02"]
        ];
        
        return list[num];
    };

})();