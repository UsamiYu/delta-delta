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
 
var game = game || {};

(function(){
    game.colorStyle = {
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
    
    game.TweenAnimation = function(obj, type, time, param){
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
                   .wait(time * 5)
                   .to(param, time)
                   .call(function(){ if(this.parent) this.remove(); }.bind(obj));
            break;
            default:
            break;
        };
    };

    game.param = {
        ENEMY_DEFAULT_ATTR: {
            width         : 48,
            height        : 48,
            hp            : 2000,
            image         : "",
            frameIndex    : 0,
            boundingType  : "circle",
            type          : "enemy",
            danmaku       : "",
            fieldOutCheck : true,
            addedAnimation: "",
            isSyncRotation: false,
            target        : "player",
        },
        BULLET_DEFAULT_ATTR: {
            width         : 24,
            height        : 24,
            color         : "red",
            frameIndex    : 0,
            isSyncRotation: false
        },
    };

    game.gameFieldOut = function(elm){
        if(elm.top    > GAME_FIELD_BOTTOM ||
           elm.bottom < GAME_FIELD_TOP ||
           elm.left   > GAME_FIELD_RIGHT ||
           elm.right  < GAME_FIELD_LEFT) return true;
           
        return false;
    }
    
    game.setDanmaku = function(elm, target, scene, param){

        var config = {
            target: target,
            createNewBullet: function(runner, attr){
                switch(attr.type){
                    case "enemy":
                    case "boss" :
                        var enemy = game.Enemy(runner, attr).addChildTo(scene.enemyLayer);
                    break;
                    case "invisible":
                        var enemy = game.InvisibleEnemy(runner, attr).addChildTo(scene.bulletLayer);
                    break;
                    default:
                        var bullet = game.EnemyBullet(runner, attr).addChildTo(scene.bulletLayer);
                    break;
                }
            }
        }

        elm.startDanmaku(game.danmakuPattern(elm.danmaku, param), config);

    };
    
    game.danmakuList = function(num){
        var list = [
            ["test1"],
            ["stage0_1", "stage0_2", "stage0_3"],
            ["stage1_1", "stage1_2", "stage1_3"],
            ["stage2_1", "stage2_2", "stage2_3"],
            ["stage3_1", "stage3_2", "stage3_3"],
            ["stage4_1", "stage4_2", "stage4_3", "stage4_4"]
            
        ];
        
        return list[num];
    };

})();