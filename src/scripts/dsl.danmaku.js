/*
 * dsl.danmaku.js
 */

var game = game || {};

(function(){
/*
 * 弾幕
 */
    var d = bulletml.dsl;
    var act = game.ActionPattern;
    var f = game.FirePattern;


    game.danmakuPattern = function(name, param){
        param = {rank: 0}.$extend(param);
        var zakoT = {
            type: "enemy",
            frameIndex: 5,
            hp: 12,
            isSyncRotation: true,
        };

        var missile = {
            type: "enemy",
            width: 48,
            height: 24,
            frameIndex: 3,
            boundingType: "rect",
            hp: 3,
            isSyncRotation: true,
        };

        var zakoR = {
            type: "enemy",
            frameIndex: 15,
            boundingType: "rect",
            hp: 15
        };

        var barrier = {
            type: "enemy",
            frameIndex: 17,
            boundingType: "rect",
            hp: 100,
        };

        var middleR = {
            type: "enemy",
            width: 64,
            height: 64,
            frameIndex: 18,
            boundingType: "rect",
            hp: 36,
        };

        var largeR = {
            type: "enemy",
            width: 64,
            height: 96,
            frameIndex: 7,
            boundingtype: "rect",
            hp: 45,
        };

        var zakoP = {
            type: "enemy",
            frameIndex: 7,
            hp: 18,
            isSyncRotation: true,
        };

        var boss = {
            type: "boss",
            width: 96,
            height: 96,
            frameIndex: 10,
            hp: 1500
        };

        var dummy = {
            type: "enemy",
            width: 96,
            height: 96,
            frameIndex: 10,
            hp: 100
        };

        var longBullet = {
            width         : 48,
            height        : 24,
            frameIndex    : 1,
            isSyncRotation: true,
        };

        var middleBullet = {
            width     : 32,
            height    : 32,
            frameIndex: 18,
        };

        var largeBullet = {
            width     : 64,
            height    : 64,
            frameIndex: 9,
        };

        var invisible = {
            type         : "invisible",
            fieldOutCheck: true
        };

        var timeAttackMove = ["time_attack_01", "time_attack_02", "time_attack_03", "time_attack_04"].random();
        var bossDanmaku = game.bossDanmaku[param.rank % game.bossDanmaku.length];

        var pattern = {
            "stage0_01": function(obj){
                boss.hp = 450;
                return {
                    "top": d.action([
                        d.wait(60),
                        d.notify("cutin", "画面をスライドして、自機を操作。弾は自動で発射します"),
                        f["offset"](320, 0, 180, "absolute", 5, boss, d.actionRef("boss")),
                        d.wait(30),
                        d.notify("cutin", "コアが出現しました。破壊してください")
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90, 120),
                        d.repeat(3, d.action([
                            d.changeSpeed(d.speed(2), 1),
                            d.repeat(360, [
                                act["change_direction"](1, "relative", 1)
                            ]),
                            d.repeat(360, [
                                act["change_direction"](-1, "relative", 1)
                            ]),
                            d.changeSpeed(d.speed(0), 1),
                            d.wait(120),
                        ]))
                    ])
                };
            },
            "stage0_02": function(obj){
                boss.hp = 1000;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 4, boss, d.actionRef("boss")),
                        d.wait(105),
                        d.notify("cutin", "コアが攻撃して来ました。弾を避けてください"),
                        d.wait(15),
                        d.notify("cutin", "エネルギーが50%以上あれば、バリアモードに切り替える事が出来ます"),
                        d.wait(15),
                        d.notify("cutin", "バリアモード時は敵の弾を跳ね返して攻撃することが出来ます")
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90),
                        d.repeat(99, [
                            d.repeat(5, [
                                d.repeat(11 + obj.rank, [
                                    f["normal"](43, "sequence", 3)
                                ]),
                                d.wait(15)
                            ]),
                            d.wait(60)
                        ])
                    ])
                };
            },
            "stage0_03": function(obj){
                boss.hp = 750;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 6, boss, d.actionRef("boss")),
                        d.wait(120),
                        d.notify("cutin", "コアがオブジェクトを発射しました。バリアで防ぐとエネルギーが大きく減少します"),
                        d.wait(30),
                        d.notify("cutin", "オブジェクトを破壊すると、弾をばら撒きます。バリアで跳ね返して攻撃しましょう")
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(105),
                        d.repeat(99, [
                            d.repeat(8, [
                                f["normal"](45, "sequence", 3, zakoT, d.actionRef("zako"))
                            ]),
                            d.wait(90),
                            d.repeat(8, [
                                f["normal"](45, "sequence", 3, zakoR, d.actionRef("zako"))
                            ]),
                            d.wait(90),
                            d.repeat(8, [
                                f["normal"](45, "sequence", 3, zakoP, d.actionRef("zako"))
                            ]),
                            d.wait(240)
                        ])
                    ]),
                    "zako": d.action([
                        d.wait(75),
                        f["normal"](120, "relative", 2),
                        d.repeat(2, [
                            f["normal"](60, "sequence", 2),
                        ])
                    ])
                };
            },
            "stage1_01": function(obj){
                boss.hp = 1350;
                zakoT.hp = 9;
                zakoT.addedAnimation = "zoom";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 4, boss, d.actionRef("boss")),
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90),
                        d.repeat(99, [
                            d.repeat(3, [
                                d.repeat(4, [
                                    f["normal"]("$rand * 180 + 90", "aim", 4, zakoT, d.actionRef("zakomove")),
                                    d.wait(5)
                                ]),
                                d.wait("60 - $loop.index * 5")
                            ]),
                            d.repeat(2, [
                                f["normal"]("$loop.index * 5", "absolute", 2),
                                d.repeat(35, [
                                    f["normal"](10, "sequence", 2),
                                ]),
                                d.wait(30)
                            ]),
                            d.wait("85 - $loop.index * 5")
                        ])
                    ]),
                    "zakomove": d.action([
                        act["change_speed"](6, 240, 30),
                        d.repeat(2, [
                            act["change_direction"](0, "aim", 60),
                        ])
                    ])
                };
            },
            "stage1_02": function(obj){
                boss.hp = 500 + obj.rank * 10;
                zakoP.danmaku = "zako05";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 4, boss, d.actionRef("boss")),
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90),
                        d.repeat(4, [
                            f["normal"](90, "sequence", 8, barrier, d.actionRef("barrier")),
                        ]),
                        d.repeat(99, [
                            d.wait(30),
                            d.changeDirection(d.direction(270, "absolute"), 1),
                            act["change_speed"](2.5, 1, 30),
                            f["normal"](240, "absolute", 12, zakoP, d.actionRef("zako")),
                            f["normal"](300, "absolute", 12, zakoP, d.actionRef("zako")),
                            act["change_direction"](180, "relative", 1, 60),
                            f["normal"](120, "absolute", 12, zakoP, d.actionRef("zako")),
                            f["normal"](60, "absolute", 12, zakoP, d.actionRef("zako")),
                            act["change_direction"](180, "relative", 1, 30),
                            act["change_speed"](0, 1, 300)
                        ]),
                    ]),
                    "barrier": d.action([
                        d.wait(4),
                        act["change_speed"](0, 1),
                        f["normal"](90, "relative", 8, barrier, d.actionRef("barrier")),
                        d.wait(25),
                        d.vanish()
                    ]),
                    "zako": d.action([
                        d.changeDirection(d.direction(180, "absolute"), 30),
                        act["change_speed"](0, 90),
                        d.changeSpeed(d.speed(0.01), 1),
                        d.repeat(10, [
                            act["change_direction"](0, "aim", 1),
                        ]),
                        d.wait(15),
                        d.changeDirection(d.direction(180, "aim"), 1),
                        d.changeSpeed(d.speed(2), 1),
                    ])
                };
            },
            "stage1_03": function(obj){
                boss.danmaku = "boss2";
                boss.hp = 1200;
                largeR.danmaku = "zako04";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 5, boss, d.actionRef("bossmove")),
                    ]),
                    "top2": d.action([
                        d.wait(90),
                        d.repeat(999, [
                            f["offset"]("$rand * 500 + 80", 0, 180, "absolute", 0, largeR,
                                act["change_speed"](3, 90)),
                            d.wait("~~(Math.cos($loop.index) * 150) + 240")
                        ])
                    ]),
                    "bossmove": d.action([
                        act["change_speed"](0, 90),
                        act["change_direction"](0, "absolute", 1),
                        d.repeat(99, [
                            act["circle_loop"](2, 120, 1, 1),
                            act["change_speed"](0, 1, 60),
                            act["circle_loop"](2, 120, -1, 1),
                            act["change_speed"](0, 1, 60),
                            act["change_direction"](180, "relative", 1, 60),
                        ]),
                    ])
                };
            },
            "stage2_01": function(obj){
                boss.hp = 1700;
                boss.danmaku = "boss4";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 5, boss, d.actionRef("boss")),
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90, 120),
                        d.repeat(99,[
                            d.repeat(5, [
                                f["normal"]("$loop.index * 30 + 60", "absolute", 4, largeBullet, d.actionRef("wing", 1, 0)),
                                f["normal"]("-$loop.index * 30 - 60", "absolute", 4, largeBullet, d.actionRef("wing", -1, 0)),
                                d.wait(30)
                            ]),
                            d.wait("~~(Math.cos($loop.index) * 360) + 390")
                        ])
                    ]),
                    "wing": d.action([
                        d.wait("15 + $2 * 15"),
                        f["normal"]("$1 * 60", "relative", 2, largeBullet, d.actionRef("wing", "$1", "$2 + 1")),
                        d.changeSpeed(d.speed(4), 150)
                    ])
                };
            },
            "stage2_02": function(obj){
                zakoP.danmaku = "single02";
                zakoP.addedAnimation = "zoom";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 260, 180, "absolute", 0, boss, d.actionRef("boss")),
                    ]),
                    "boss": d.action([
                        d.repeat(99, [
                            f["normal"](210, "absolute", 8, zakoP, d.actionRef("inside_move")),
                            d.repeat(8, [
                                f["normal"](36, "sequence", 8, zakoP, d.actionRef("inside_move")),
                            ]),
                            f["normal"](210, "absolute", 8, zakoP, d.actionRef("outside_move")),
                            d.repeat(24, [
                                f["normal"](12, "sequence", 8, zakoP, d.actionRef("outside_move")),
                            ]),
                            d.wait(480),
                        ])
                    ]),
                    "inside_move": d.action([
                        d.wait(10),
                        act["change_speed"](0, 1),
                        d.changeDirection(d.direction(-90, "relative"), 1),
                        act["circle_loop"](3, 80, -1, 3.5)
                    ]),
                    "outside_move": d.action([
                        d.wait(30),
                        act["change_speed"](0, 1),
                        d.changeDirection(d.direction(90, "relative"), 1),
                        act["circle_loop"](1, 240, 1, 1)
                    ]),
                };
            },
            "stage2_03": function(obj){
                zakoR.addedAnimation = "drop";
                boss.hp = 650;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](640, 96, 270, "absolute", 12, boss, d.actionRef("boss")),
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 100),
                        d.repeat(99, [
                            f["normal"](180, "absolute", 12, invisible, d.actionRef("bullet_point1", 1)),
                            d.actionRef("move", 12),
                            f["normal"](180, "absolute", 12, invisible, d.actionRef("bullet_point1", -1)),
                            d.wait(15),
                            d.actionRef("move", 12),
                            d.wait(1),
                            d.actionRef("move", 2),
                            d.wait(1),
                            d.actionRef("move", 2),
                            d.wait(180)
                        ])
                    ]),
                    "move": d.action([
                        d.changeDirection(d.direction(180, "relative"), 1),
                        d.changeSpeed(d.speed("$1"), 1),
                        d.wait("552 / $1"),
                        d.changeSpeed(d.speed(0), 1)
                    ]),
                    "bullet_point1": d.action([
                        d.wait("($1 > 0) ? 2 : 6"),
                        d.repeat(3, [
                            d.wait(8),
                            f["normal"]("-90 * $1", "relative", 12, invisible, d.actionRef("bullet_point2")),
                        ]),
                        d.vanish()
                    ]),
                    "bullet_point2": d.action([
                        d.repeat(6, [
                            f["normal"](0, "relative", 0, zakoR, d.action([
                                d.wait(240),
                                f["normal"]("~~($rand * 4) * 90", "absolute", 3, middleBullet),
                                d.repeat(3, [
                                    d.wait(120),
                                    f["normal"](90, "sequence", 3, middleBullet),
                                ]),
                                d.changeSpeed(d.speed(4), 1)
                            ])),
                            d.wait(8)
                        ])
                    ])
                };
            },
            "stage3_01": function(obj){
                largeR.fieldOutCheck = zakoP.fieldOutCheck = false;
                zakoP.isSyncRotation = false;
                largeR.hp = zakoP.hp = 550;
                boss.hp = 900;
                boss.danmaku = "boss3";
                zakoP.danmaku = "whip01";
                return {
                    "top": d.action([
                        d.wait(59),
                        f["offset"](639, 128, 270, "absolute", 7, boss, d.actionRef("bossmove", 1)),
                    ]),
                    "top1": d.action([
                        d.wait(60),
                        f["offset"](597, 160, 270, "absolute", 7, largeR, d.actionRef("bossmove", 0)),
                        f["offset"](569, 128, 270, "absolute", 7, largeR, d.actionRef("bossmove", 0)),
                        f["offset"](540, 102, 270, "absolute", 7, largeR, d.actionRef("bossmove", 0)),
                        f["offset"](585,  80, 270, "absolute", 7,  zakoP, d.actionRef("bossmove", 0)),
                        f["offset"](681, 160, 270, "absolute", 7, largeR, d.actionRef("bossmove", 0)),
                        f["offset"](710, 128, 270, "absolute", 7, largeR, d.actionRef("bossmove", 0)),
                        f["offset"](739, 102, 270, "absolute", 7, largeR, d.actionRef("bossmove", 0)),
                        f["offset"](693,  80, 270, "absolute", 7,  zakoP, d.actionRef("bossmove", 0)),
                    ]),
                    "bossmove": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait("$1 + 90"),
                        act["change_speed"](0, 60),
                        act["yura_yura"](2.5, 45),
                    ]),
                };
            },
            "stage3_02": function(obj){
                boss.danmaku = "boss7";
                boss.hp = 1850;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 6, boss, d.actionRef("boss")),
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 60),
                        act["change_direction"](90, "absolute", 1),
                        act["change_speed"](3, 1, 45),
                        act["round_trip"](3, 90),
                        d.changeSpeed(d.speed(0), 1)
                    ])
                };
            },
            "stage3_03": function(obj){
                boss.hp = 900;
                boss.danmaku = "boss1_01";
                middleR.hp = 75;
                middleR.danmaku = "single01";
                return {
                    "top0": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 4, boss, d.actionRef("boss")),
                    ]),
                    "top1": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(4, [
                                f["offset"]("$loop.index * 140 + 80", 0, 180, "absolute", 6, middleR, d.actionRef("middle", -1))
                            ]),
                            d.repeat(4, [
                                f["offset"]("$loop.index * 140 + 150", 0, 180, "absolute", 5, middleR, d.actionRef("middle", 1))
                            ]),
                            d.wait(720)
                        ])
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90),
                        act["yura_yura"](1, 60),
                    ]),
                    "middle": d.action([
                        d.wait(60),
                        act["change_speed"](0, 1, 20),
                        d.changeDirection(d.direction("$1 * 90", "relative"), 1),
                        d.repeat(99, [
                            act["change_speed"](1, 1, 70),
                            act["change_speed"](0, 1, 20),
                            d.changeDirection(d.direction(180, "absolute"), 1),
                            act["change_speed"](0.5, 1, 70),
                            act["change_speed"](0, 1, 20),
                            d.changeDirection(d.direction("$1 * 90", "relative"), 1)
                        ])
                    ])
                };
            },
            "stage4_01": function(obj){
                boss.danmaku = "boss8";
                boss.hp = 1650;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0 ,180, "absolute", 6, boss, d.action([
                            act["change_speed"](0, 60, 180),
                            act["triangle_loop"](4, "right", 60, 99, 240)
                        ]))
                    ])
                };
            },
            "stage4_02": function(obj){
                zakoR.hp = 120;
                zakoR.danmaku = "single03";
                boss.hp = 1350;
                boss.danmaku = "boss5";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 6, boss, d.actionRef("boss"))
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90),
                        d.repeat(99, [
                            f["normal"](60, "absolute", 4, zakoR, d.actionRef("zako")),
                            d.repeat(5, f["normal"](60, "sequence", 4, zakoR, d.actionRef("zako"))),
                            f["normal"](30, "absolite", 6, zakoR, d.actionRef("zako")),
                            d.repeat(11, f["normal"](30, "sequence", 6, zakoR, d.actionRef("zako"))),
                            d.wait(25),
                            act["yura_yura"](1.5, 60, 2),
                            d.wait(180)
                        ])
                    ]),
                    "zako": d.action([
                        act["change_speed"](0, 25),
                        act["yura_yura"](1.5, 60, 2),
                        act["change_direction"]("(~~($rand * 4)) * 90", "absolute", 1),
                        d.changeSpeed(d.speed(4), 59),
                    ]),
                };
            },
            "stage4_03": function(obj){
                zakoR.hp = 8;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 6, boss, d.action([
                            act["change_speed"](0, 90),
                            d.repeat(99, [
                                d.repeat(3, [
                                    f["normal"](90, "sequence", 4, zakoR, d.actionRef("zako"))
                                ]),
                                d.wait(10),
                                d.repeat(20, [
                                    f["normal"](27, "sequence", "$loop.index * 0.25 + 2", middleBullet),
                                    d.wait(1)
                                ]),
                                d.changeDirection(d.direction(90, "relative"), 1),
                                act["change_speed"](4, 30),
                                act["change_speed"](0, 30, 120),
                            ])
                        ])),
                    ]),
                    "top2": d.action([
                        d.wait(120),
                        d.repeat(99, [
                            f["offset"]("Math.sin($loop.index) * 130 + 480", GAME_FIELD_TOP, 180, "absolute", 6, zakoT, d.action([
                                d.wait(10),
                                d.repeat(4, [
                                    f["normal"]("$rand * 5 - 2", "aim", 2.5, longBullet),
                                    d.wait(15)
                                ])
                            ])),
                            d.wait("~~($rand * 210) + 30")
                        ])
                    ]),
                    "zako": d.action([
                        d.wait(12),
                        act["change_speed"](0, 1, 3),
                        d.bindVar("r", "$rand * 9"),
                        f["normal"]("($r < 1) ? -90 : ($r < 2) ? 90 : 0", "relative", 4, zakoR, d.actionRef("zako")),
                        d.wait(30),
                        d.vanish()
                    ])
                };
            },
            "stage4_04": function(obj){
                boss.hp = 1100;
                boss.danmaku = "boss6";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 6, boss, d.action([
                            act["change_speed"](0, 60),
                            act["yura_yura"](1, 60)
                        ])),
                    ]),
                    "top2": d.action([
                        d.repeat(99, [
                            d.wait(360),
                            f["offset"](17, 32, 135, "absolute", 10, invisible, d.actionRef("bullet")),
                            d.wait(240),
                            f["offset"](623, 240, 225, "absolute", 10, invisible, d.actionRef("bullet")),
                            d.wait(240),
                            f["offset"](623, 32, 225, "absolute", 10, invisible, d.actionRef("bullet")),
                            d.wait(240),
                            f["offset"](17, 240, 135, "absolute", 10, invisible, d.actionRef("bullet")),
                        ])
                    ]),
                    "bullet": d.action([
                        d.repeat(30, [
                            d.wait(4),
                            f["normal"](0, "aim", 0, middleBullet, d.action([ d.changeSpeed(d.speed(4), 240) ]))
                        ])
                    ]),
                };
            },
            "stage5_01": function(obj){
                zakoP.danmaku = "zako01";
                boss.hp = 1100;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 4, boss, d.actionRef("boss"))
                    ]),
                    "top2": d.action([
                        d.wait(210),
                        d.repeat(99, [
                            d.repeat(9, [
                                f["offset"]("$loop.index * 72 + 32", 32, 180, "absolute", 4, middleR),
                            ]),
                            d.wait(210),
                        ]),
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 90),
                        d.repeat(99, [
                            d.changeDirection(d.direction(240, "absolute"), 1),
                            act["change_speed"](8, 60),
                            act["change_speed"](0, 1),
                            f["normal"](120, "absolute", 12, zakoP, d.actionRef("zako")),
                            d.repeat(3, [
                                f["normal"](40, "sequence", 12, zakoP, d.actionRef("zako")),
                            ]),
                            d.actionRef("move"),
                            act["change_direction"](300, "absolute", 1, 15),
                            act["change_speed"](8, 60),
                            act["change_speed"](0, 1, 60),
                        ]),
                    ]),
                    "move": d.action([
                        act["change_speed"](0, 8),
                        act["change_direction"](90, "absolute", 1),
                        act["change_speed"](2, 1, 211),
                        act["change_speed"](0, 1),
                    ]),
                    "zako": d.action([
                        d.actionRef("move"),
                        act["change_direction"](180, "absolute", 1),
                        act["change_speed"](4, 1)
                    ])
                };
            },
            "stage5_02": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 13, boss, d.actionRef("boss"))
                    ]),
                    "boss": d.action([
                        d.repeat(99, [
                            act["change_speed"](0, 60),
                            d.changeDirection(d.direction(0, "absolute"), 1),
                            d.changeSpeed(d.speed(4), 1),
                            d.actionRef("shot", 2, 120, 120),
                            d.wait(60),
                            d.changeSpeed(d.speed(0), 1),
                            d.actionRef("shot", 2, 180, 90),
                            d.wait(120),
                            d.repeat(4, [
                                d.bindVar("dir", "($loop.index & 1) ? 1 : -1"),
                                d.repeat(10, [
                                    f["normal"]("$dir * ($loop.index * 12 + 90)", "absolute", 3.75, middleBullet),
                                    d.repeat(3, [
                                        f["normal"]("$dir * 15", "sequence", "3.5 - $loop.index * 0.25", middleBullet),
                                    ]),
                                    d.wait(10)
                                ]),
                                d.wait(45)
                            ]),
                            d.wait(120),
                            d.changeSpeed(d.speed(8), 1),
                            act["change_direction"](180, "absolute", 1),
                        ])
                    ]),
                    "shot": d.action([
                        d.repeat("$1", [
                            d.fire(
                                d.direction("$loop.index * $2 + $3", "absolute"),
                                d.speed(8),
                                d.bullet(zakoT, d.action([
                                    act["change_speed"](0, 30),
                                    d.repeat(3, [
                                        f["normal"]("$loop.index * 120", "absolute", 8, zakoT, d.actionRef("zako")),
                                    ]),
                                    d.vanish()
                                ]))
                            )
                        ]),
                    ]),
                    "zako": d.action([
                        act["change_speed"](0, 30),
                        d.changeDirection(d.direction(90, "relative"), 1),
                        act["change_speed"](Math.PI * 2 / 3, 1),
                        d.repeat(60, [
                            f["normal"](120, "relative", 12, barrier, d.action([ d.wait(13), d.vanish() ])),
                            act["change_direction"](8, "relative", 8),
                        ]),
                        d.changeSpeed(d.speed(6), 30)
                    ]),
                };
            },
            "stage5_03": function(obj){
                dummy.danmaku = "whip01";
                boss.danmaku = "boss9";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](640, 180, 270, "absolute", 8, boss, d.actionRef("boss"))
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 120),
                        d.repeat(99, [
                            d.repeat(3, [
                                f["normal"](180, "relative", 8, dummy, d.action([
                                    d.wait(40),
                                    act["round_trip"](4, 80, 3, 80),
                                ])),
                                d.wait(20),
                                act["round_trip"](4, 80, 1, 80),
                                act["change_speed"](0, 1, 60),
                            ]),
                            act["round_trip"](10, 32, 5),
                            act["change_speed"](0, 1, 80),
                        ])
                    ]),
                };
            },
            "stage5_04": function(){
                boss.danmaku = "boss10";
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 181, "absolute", 6, boss, d.actionRef("boss"))
                    ]),
                    "top2": d.action([
                        d.wait(120),
                        d.repeat(99, [
                            d.repeat(3, [
                                f["offset"]("$rand * 320 + 160", 32, 180, "absolute", 16, zakoP, d.action([
                                    act["change_speed"](0, "$loop.index * 15 + 30"),
                                    d.repeat(10, [
                                        d.repeat(2, [
                                            f["normal"](180, "sequence", 28, barrier, d.actionRef("barrier")),
                                        ]),
                                        d.wait(30),
                                    ]),
                                    d.vanish(),
                                ])),
                                d.wait(60),
                            ]),
                            d.wait(300),
                        ])
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 60),
                        act["yura_yura"](1, 120),
                    ]),
                    "barrier": d.action([
                        d.wait(1),
                        act["change_speed"](0, 1),
                        f["normal"](0, "relative", 26, barrier, d.actionRef("barrier")),
                        d.wait(27),
                        d.vanish(),
                    ])
                };
            },
            "stage5_05": function(obj){
                largeR.addedAnimation = "zoom";
                largeR.hp = 250;
                largeR.fieldOutCheck = zakoP.fieldOutCheck = false;
                zakoP.hp = 300;
                zakoP.isSyncRotation = false;
                zakoP.danmaku = "zako02";
                middleR.danmaku = "boss3";
                middleR.hp = 500;
                boss.danmaku = "boss11";
                boss.hp = 1800;
                return {
                    "top": d.action([
                        d.wait(60),
                        f["offset"](320, 0, 180, "absolute", 4, boss, d.actionRef("boss")),
                    ]),
                    "boss": d.action([
                        act["change_speed"](0, 60),
                        d.repeat(99, [
                            d.repeat(2, [
                                f["normal"]("$loop.index * 90 + 135", "absolute", 7, invisible, d.actionRef("set_largeR", 1)),
                                f["normal"]("$loop.index * 210 + 75", "absolute", 8, invisible, d.actionRef("set_largeR", 2)),
                                f["normal"]("$loop.index * 180 + 90", "absolute", 10, invisible, d.actionRef("set_largeR", 2)),
                                f["normal"]("$loop.index * 40 + 160", "absolute", 8, invisible, d.actionRef("set_largeR", 1)),
                            ]),
                            f["normal"](180, "absolute", 11, invisible, d.actionRef("set_largeR")),
                            d.repeat(2, [
                                f["normal"]("$loop.index * 270 + 45", "absolute", 15, zakoP, d.actionRef("zakoP")),
                                f["normal"]("$loop.index * 140 + 110", "absolute", 15, zakoP, d.actionRef("zakoP")),
                                f["normal"]("$loop.index * 220 + 70", "absolute", 24, zakoP, d.actionRef("zakoP")),
                            ]),
                            d.actionRef("boss_move", 16),
                            d.wait(240),
                            d.repeat(3, [
                                f["normal"]("$loop.index * 120 + 60", "absolute", 8, invisible, d.actionRef("set_middleR")),
                                f["normal"]("$loop.index * 120", "absolute", 8, zakoP, d.actionRef("zakoP")),
                            ]),
                            d.repeat(2, [
                                f["normal"]("$loop.index * 240 + 60", "absolute", 12, invisible, d.actionRef("set_largeR")),
                            ]),
                            d.actionRef("boss_move", 16),
                            d.wait(240),
                        ])
                    ]),
                    "boss_move": d.action([
                        d.wait("$1"),
                            act["triangle_loop"](2, "right", 240, 1, 60),
                            act["triangle_loop"](2, "left", 240, 1, 60),
                            d.wait(60),
                    ]),
                    "set_largeR": d.action([
                        d.repeat("$1", [
                            d.wait(8),
                            f["normal"](0, "relative", 0, largeR,
                                d.action([
                                    d.actionRef("boss_move", "10 - $loop.index * 8"),
                                    act["change_direction"]("~~($rand * 4) *90", "absolute", 1),
                                    act["change_speed"](6, 90, 240),
                                    d.vanish()
                                ])
                            )
                        ])
                    ]),
                    "set_middleR": d.action([
                        d.wait(8),
                        f["normal"](0, "relative", 0, middleR,
                            d.action([
                                d.actionRef("boss_move", 8),
                                act["change_direction"]("~~($rand * 2) *90 + 90", "absolute", 1),
                                act["change_speed"](5, 90, 240),
                                d.vanish()
                            ])
                        )
                    ]),
                    "zakoP": d.action([
                        act["change_speed"](0, 15),
                        d.actionRef("boss_move", 2),
                        act["change_direction"]("~~($rand * 2) *90 + 135", "absolute", 1),
                        act["change_speed"](5, 90, 240),
                        d.vanish()
                    ])
                };
            },
            "ta01": function(obj){
                boss.hp = 600 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                return {
                    "top": act["time_attack_01"](obj.rank, boss),
                }
            },
            "ta02": function(obj){
                boss.hp = 600 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                return {
                    "top": act["time_attack_02"](obj.rank, boss),
                };
            },
            "ta03": function(obj){
            boss.hp = 600 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                return {
                    "top": act["time_attack_03"](obj.rank, boss),
                }
            },
            "ta04": function(obj){
                boss.hp = 500 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                zakoT.danmaku = "boss3";
                return {
                    "top": act[timeAttackMove](obj.rank, boss),
                    "top2": d.action([
                        d.wait(120),
                        d.repeat(99, [
                            f["offset"]("Math.sin($loop.index) * 240 + 320", 16, 180, "absolute", 4 + obj.rank * 0.1, zakoT, d.action([
                                act["change_direction"]("($loop.index & 1) ? 90 : -90", "relative", 240)
                            ])),
                            d.wait("~~($rand * 75) + 45")
                        ])
                    ])
                }
            },
            "ta05": function(obj){
                boss.hp = 500 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                return {
                    "top": act[timeAttackMove](obj.rank, boss),
                    "top2": d.action([
                        d.wait(120 - obj.rank * 3),
                        d.repeat(99, [
                            d.bindVar("dd", "($loop.index & 1) * 48 + 48"),
                            d.repeat(6, [
                                f["offset"]("$loop.index * 96 + $dd", 32, 180, "absolute", 3 + obj.rank * 0.1, zakoR, d.action([
                                    d.repeat(3 + ~~(obj.rank * 0.2), [
                                        d.wait(Math.max(15, 30 - obj.rank)),
                                        f["normal"]("$rand * 5 - 2", "aim", 2 + obj.rank * 0.1, middleBullet)
                                    ])
                                ]))
                            ]),
                            d.wait(240 - obj.rank * 5)
                        ])
                    ])
                }
            },
            "ta06": function(obj){
                boss.hp = 500 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                zakoP.hp = 15 + obj.rank * 3;
                zakoP.danmaku = "zako03";
                return {
                    "top": act[timeAttackMove](obj.rank, boss),
                    "top2": d.action([
                        d.wait(120 - obj.rank * 3),
                        d.repeat(99, [
                            f["offset"](32, 32, 175, "absolute", 12, zakoP, d.actionRef("zako")),
                            d.repeat(6, [
                                d.wait(2),
                                f["offset"](32, 32, -10, "sequence", "$loop.index * 0.5 + 12.5", zakoP, d.actionRef("zako"))
                            ]),
                            d.wait(240 - obj.rank * 3)
                        ])
                    ]),
                    "top3": d.action([
                        d.wait(120 - obj.rank * 3),
                        d.repeat(99, [
                            f["offset"](608, 32, 185, "absolute", 12, zakoP, d.actionRef("zako")),
                            d.repeat(6, [
                                d.wait(2),
                                f["offset"](608, 32, 10, "sequence", "$loop.index * 0.5 + 12.5", zakoP, d.actionRef("zako"))
                            ]),
                            d.wait(240 - obj.rank * 3)
                        ])
                    ]),
                    "zako": d.action([
                        act["change_speed"](0, 60, 90)
                    ])
                }
            },
            "ta07": function(obj){
                boss.hp = 500 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                return {
                    "top": act[timeAttackMove](obj.rank, boss),
                    "top2": d.action([
                        d.wait(120 - obj.rank * 3),
                        d.repeat(99, [
                            f["offset"](48, 0, 180, "absolute", 8, middleR, d.actionRef("zako", -1)),
                            d.wait(360 - obj.rank * 3)
                        ])
                    ]),
                    "top3": d.action([
                        d.wait(120 - obj.rank * 3),
                        d.repeat(99, [
                            f["offset"](592, 0, 180, "absolute", 8, middleR, d.actionRef("zako", 1)),
                            d.wait(360 - obj.rank * 3)
                        ])
                    ]),
                    "zako": d.action([
                        d.repeat(3, [
                            d.repeat(6, [
                                d.wait(8),
                                f["normal"](0, "relative", 0, middleR, d.action([
                                    d.repeat(2 + ~~(obj.rank * 0.3), [
                                        d.wait(45 - obj.rank * 3),
                                        f["normal"]("($rand * 90 - 45)", "aim", 2.5, middleBullet),
                                    ]),
                                    d.vanish()
                                ])),
                            ]),
                            act["change_speed"](0, 1),
                            act["change_direction"]("90 * $1", "relative", 1, 120),
                            act["change_speed"](8, 1, 12)
                        ])
                    ])
                }
            },
            "ta08": function(obj){
                boss.hp = 500 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                largeR.danmaku = "zako04";
                return {
                    "top": act[timeAttackMove](obj.rank, boss),
                    "top2": d.action([
                        d.wait(120),
                        d.repeat(99, [
                            f["offset"]("Math.cos($loop.index) * 270 + 320", 0, 180, "absolute", 0, largeR, act["change_speed"](3, 90)),
                            d.wait("~~($rand * 210) + 90")
                        ])
                    ])
                }
            },
            "ta09": function(obj){
                boss.hp = 800 + obj.rank * 10;
                boss.danmaku = bossDanmaku;
                middleR.danmaku = "zako05";
                return {
                    "top": act[timeAttackMove](obj.rank, boss),
                    "top2": d.action([
                        d.wait(120),
                        d.repeat(99, [
                            d.repeat(2, [
                                f["offset"]("$loop.index * 420 + 120", 0, 180, "absolute", 14, middleR, d.action([
                                    act["change_speed"](0.01, 60, 119 - obj.rank * 5),
                                    act["change_direction"](180, "aim", 1),
                                    act["change_speed"](2, 1)
                                ])),
                            ]),
                            d.wait(420)
                        ])
                    ])
                }
            },
            "ta10": function(obj){
                boss.hp = 600 + obj.rank * 10;
                boss.danmaku = dummy.danmaku = "vortex02";
                return {
                    "top": d.action([
                        act[timeAttackMove](obj.rank, boss),
                        d.wait(90),
                        d.repeat(99, [
                            act[timeAttackMove](obj.rank, dummy),
                            d.wait(300 - obj.rank * 15),
                        ])
                    ])
                };
            },
            "explode": function(obj){
                var way = (obj.rank < 2) ? 2 :
                          (obj.rank > 6) ? obj.rank - (~~(obj.rank - 4) * 0.5) : obj.rank;
                return {
                    "top": d.action([
                        d.bindVar("r", Math.random() * 360 / Math.min(6, way) + 30),
                        f["normal"]("$rand * 300 + 30", "aim", 6, {}, act["change_speed"](2, 8)),
                        d.repeat(way - 1, [
                            f["normal"]("$r", "sequence", 6, {},
                                act["change_speed"](2, "$loop.index * 2 + 10")
                            ),
                            d.wait(1)
                        ]),
                        d.notify("destroy"),
                    ])
                };
            },
            "single01": function(obj){
                return {
                    "top": d.action([
                        d.bindVar("wait", "$rand * 20"),
                        d.wait(90),
                        d.repeat(99, [
                            d.wait("$wait * 15 + 45"),
                            f["normal"]("$rand * 5 - 2", "aim", 2, middleBullet),
                        ])
                    ])
                };
            },
            "single02": function(obj){
                return {
                    "top": d.action([
                        d.wait("~~($rand * 120) + 65"),
                        d.repeat(12, [
                            f["normal"](180, "absolute", 0, {}, d.action([ d.changeSpeed(d.speed(4), 180) ])),
                            d.wait("80 - $loop.index * 5")
                        ])
                    ])
                }
            },
            "single03": function(obj){
                return{
                    top: d.action([
                        d.repeat(99, [
                            d.wait("~~(Math.cos($loop.index) * 150) + 210"),
                            f["normal"](0, "aim", 0.5, middleBullet, d.action([ d.changeSpeed(d.speed(4), 240) ])),
                        ])
                    ])
                };
            },
            "whip01": function(obj){
                return {
                    "top": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.wait(120),
                            d.repeat(3, [
                                f["normal"]("$rand * 5 - 2", "aim", 3, middleBullet),
                                d.repeat(4, [
                                    d.wait(1),
                                    f["normal"](0, "sequence", "3.5 + $loop.index * 0.5", middleBullet),
                                ]),
                                d.wait(60)
                            ]),
                        ])
                    ])
                };
            },
            "whip02": function(obj){
                return {
                    "top": d.action([
                        d.bindVar("spd", obj.rank * 0.2 + 3),
                        d.repeat(99, [
                            d.wait("($loop.index & 2) ? 180 : 90"),
                            d.repeat(Math.min(7 + ~~(obj.rank * 0.5), 10), [
                                f["offset"](48, -48, "$loop.index * 15 +60", "absolute", "$spd", longBullet),
                                d.repeat(Math.min(3 + ~~(obj.rank * 0.3), 6), [
                                    f["offset"](48, -48, 12, "sequence", "$spd + $loop.index * 0.2 + 0.2", longBullet),
                                ]),
                                d.wait(Math.max(10, 15 - ~~(obj.rank * 0.5))),
                            ])
                        ])
                    ]),
                    "top2": d.action([
                        d.bindVar("spd", obj.rank * 0.2 + 3),
                        d.repeat(99, [
                            d.wait("($loop.index & 2) ? 180 : 90"),
                            d.repeat(Math.min(7 + ~~(obj.rank * 0.5), 10), [
                                f["offset"](-48, -48, "-$loop.index * 15 + 300", "absolute", "$spd", longBullet),
                                d.repeat(Math.min(3 + ~~(obj.rank * 0.3), 6), [
                                    f["offset"](-48, -48, -12, "sequence", "$spd + $loop.index * 0.2 + 0.2", longBullet),
                                ]),
                                d.wait(Math.max(10, 15 - ~~(obj.rank * 0.5))),
                            ])
                        ])
                    ]),
                    "top3": d.action([
                        d.repeat(99, [
                            d.wait(Math.max(60, 240 - obj.rank * 15)),
                            f["normal"]("$rand * 5 - 2", "aim", 3, middleBullet),
                            d.repeat(4, [
                                d.wait(Math.max(1, ~~(5 - obj.rank * 0.2))),
                                f["normal"](0, "sequence", "3.25 + $loop.index * 0.25", middleBullet),
                            ]),
                        ])
                    ])
                };
            },
            "vortex01": function(obj){
                return {
                    "top": d.action([
                        d.wait(30),
                        f["normal"](180, "aim", 24, invisible),
                        d.repeat(13, [
                            d.wait(4),
                            f["normal"](25, "sequence", 12, middleBullet, d.action([
                                act["change_speed"](0, 15, 60 - obj.rank),
                                act["change_speed"](4 + obj.rank * 0.3, 60),
                            ])),
                        ]),
                    ]),
                    "top2": d.action([
                        d.wait(30),
                        f["normal"](180, "aim", 24, invisible),
                        d.repeat(13, [
                            d.wait(4),
                            f["normal"](-25, "sequence", 12, middleBullet, d.action([
                                act["change_speed"](0, 15, 60 - obj.rank),
                                act["change_speed"](4 * obj.rank * 0.3, 60),
                            ])),
                        ]),
                    ]),
                };
            },
            "vortex02": function(obj){
                var r = (Math.random() < 0.5) ? 1 : -1;
                return {
                    "top": d.action([
                        d.wait(60),
                        d.bindVar("r", r),
                        d.repeat(99, [
                            f["normal"]("-90 * $r", "aim", 10, {}),
                            d.repeat(50, [
                                d.wait(Math.max(3, 8 - ~~(obj.rank * 0.5))),
                                f["normal"]("$loop.index * $r", "sequence", 5 + obj.rank, {}, act["change_speed"](3, 45 - obj.rank)),
                            ]),
                            d.wait(60)
                        ])
                    ]),
                    "top2": d.action([
                        d.wait(90),
                        d.bindVar("r", r),
                        d.repeat(99, [
                            f["normal"]("90 * $r", "aim", 11, middleBullet),
                            d.repeat(50, [
                                d.wait(Math.max(4, 9 - ~~(obj.rank * 0.5))),
                                f["normal"]("-$loop.index * $r * 2", "sequence", 5 + obj.rank, middleBullet, act["change_speed"](3, 45 - obj.rank)),
                            ]),
                            d.wait(90)
                        ])
                    ]),
                    "top3": d.action([
                        d.wait(120),
                        d.bindVar("r", r),
                        d.repeat(99, [
                            f["normal"]("-90 * $r", "aim", 10, longBullet),
                            d.repeat(50, [
                                d.wait(Math.max(5, 10 - ~~(obj.rank * 0.5))),
                                f["normal"]("$loop.index * $r * 2", "sequence", 5 + obj.rank, longBullet, act["change_speed"](3, 45 - obj.rank)),
                            ]),
                            d.wait(120)
                        ])
                    ]),
                    "top4": d.action([
                        d.wait(150),
                        d.bindVar("r", r),
                        d.repeat(99, [
                            f["normal"]("90 * $r", "aim", 7, missile),
                            d.repeat(20, [
                                d.wait(Math.max(10, 20 - obj.rank)),
                                f["normal"]("-$loop.index * $r * 5", "sequence", 2 + obj.rank, missile),
                            ]),
                            d.wait(150)
                        ])
                    ]),
                };
            },
            "boss1_01": function(obj){
                return {
                    "top": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(13, [
                                d.repeat(7, [
                                    f["normal"](11, "sequence", 3.5, missile, d.action([
                                        d.wait(10),
                                        d.changeDirection(d.direction(90, "relative"), 30)
                                    ])),
                                ]),
                                d.wait(60),
                            ]),
                            d.wait(180)
                        ])
                    ])
                };
            },
            "boss2": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.wait(150),
                            d.repeat(3, [
                                f["normal"](-60, "aim", 3, zakoP),
                                d.repeat(5, [
                                    f["normal"](20, "sequence", 3, zakoP),
                                ]),
                                d.wait(90),
                            ])
                        ])
                    ])
                };
            },
            "boss3": function(obj){
                return {
                    "top": d.action([
                        d.wait(Math.max(90 - obj.rank * 5, 15)),
                        d.repeat(99, [
                            d.repeat(5, [
                                f["normal"]("$rand * 165 - 90", "aim", 3),
                                d.repeat(3, [
                                    f["normal"](5, "sequence", 3),
                                ]),
                                d.wait(45)
                            ]),
                            d.wait(90)
                        ])
                    ]),
                    "top2": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.wait(240),
                            f["normal"](-30, "aim", 4, zakoT),
                            d.repeat(3, f["normal"](20, "sequence", 4, zakoT)),
                            d.wait(30),
                            d.repeat(3, f["normal"](-20, "sequence", 4, zakoT)),
                        ])
                    ]),
                };
            },
            "boss4": function(obj){
                return {
                    "top": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(18, [
                                f["normal"](20, "sequence", 5, middleBullet),
                                d.wait(5)
                            ]),
                            d.actionRef("way", "($loop.index & 1) ? 1 : -1"),
                            d.wait("~~(Math.sin($loop.index) * 59) + 60"),
                            d.actionRef("way", "($loop.index & 1) ? -1 : 1"),
                            d.actionRef("way", "($loop.index & 1) ? 1 : -1"),
                            d.wait("~~(Math.sin($loop.index) * 60) + 120"),
                        ]),
                    ]),
                    "way": d.action([
                        d.repeat(7, [
                            f["normal"]("$1 * $loop.index * 20 + (($1 === 1) ? 90 : 270)", "absolute", 8, missile),
                            d.repeat(3, [
                                f["normal"]("$1 * 20", "sequence", 8, missile)
                            ]),
                            d.wait(6)
                        ])
                    ])
                };
            },
            "boss5": function(obj){
                return {
                    "top": d.action([
                        d.wait(240),
                        d.repeat(99, [
                            f["normal"]("$rand * 360", "absolute", 8, zakoP, d.actionRef("zako", "~~($rand * 2)")),
                            d.wait("$rand * 210 + 60")
                        ])
                    ]),
                    "zako": d.action([
                        d.changeSpeed(d.speed(0), 30),
                        d.wait(60),
                        d.repeat(3, [
                            f["normal"]("(($1) ? 6 : -6)", "aim", 4),
                            d.repeat(4, [
                                d.wait(2),
                                f["normal"]("(($1) ? -3 : 3)", "sequence", "$loop.index * 0.2 + 4.2"),
                            ]),
                            d.wait(5)
                        ]),
                        d.wait(60),
                        d.changeSpeed(d.speed(3), 90)
                    ])
                };
            },
            "boss6": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(4, [
                                d.repeat(3, [
                                    d.repeat(4, [
                                        f["normal"](95, "sequence", 4, zakoP),
                                    ]),
                                    d.wait(5)
                                ]),
                                d.wait(30)
                            ]),
                            d.wait(90)
                        ])
                    ])
                };
            },
            "boss7": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            act["nway_shot"](obj.rank, -15, 60, "aim", 12, largeBullet, longBullet),
                            d.wait(75),
                            act["nway_shot"](obj.rank, 15, -60, "aim", 12, largeBullet, longBullet),
                            d.wait(180)
                        ]),
                    ]),
                    "top2": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(2, [
                                d.bindVar("dir", "$loop.index"),
                                d.repeat(4, [
                                    d.repeat(8, [
                                        d.wait(10),
                                        f["normal"]("($dir === 0) ? 15 : -15", "sequence", 3.5, zakoP),
                                    ]),
                                    d.wait(30)
                                ]),
                                d.wait(60)
                            ])
                        ])
                    ]),
                    "nway_bullet": d.action([
                        f["normal"]("$1 * 60", "aim", 12, largeBullet, d.actionRef("burst", "$1")),
                        d.repeat(9, [
                            d.wait(3),
                            f["normal"]("-15 * $1", "sequence", "11 - $loop.index", largeBullet, d.actionRef("burst", "$1")),
                        ])
                    ]),
                    "burst": d.action([
                        act["change_speed"](0, 45, 15),
                        f["normal"]("$1", "relative", 3, longBullet),
                        d.repeat(4, [
                            d.wait(9),
                            f["normal"]("$1 * 4", "sequence", 3, longBullet)
                        ]),
                        d.vanish()
                    ]),
                };
            },
            "boss8": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(5, [
                                f["normal"]("$loop.index * 6", "absolute", 3, middleBullet, act["change_speed"](2, 45)),
                                d.repeat(6, [
                                    f["normal"](60, "sequence", 3, middleBullet, act["change_speed"](2, 45)),
                                ]),
                                d.wait(5)
                            ]),
                            d.wait(240)
                        ])
                    ]),
                    "top2": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(5, [
                                f["normal"]("-$loop.index* 6", "absolute", 4, middleBullet, act["change_speed"](2, 45)),
                                d.repeat(6, [
                                    f["normal"](-60, "sequence", 4, middleBullet, act["change_speed"](2, 45)),
                                ]),
                                d.wait(4)
                            ]),
                            d.wait(180)
                        ])
                    ]),
                    "top3": d.action([
                        d.wait(180),
                        d.repeat(99, [
                            f["normal"](-60, "aim", 4, missile),
                            d.repeat(8, [
                                d.wait(2),
                                f["normal"](15, "sequence", 4, missile),
                            ]),
                            d.wait(120),
                        ])
                    ])
                };
            },
            "boss9": function(obj){
                 return {
                     "top": d.action([
                         d.wait(840),
                         d.repeat(99, [
                             d.repeat(50, [
                                 d.repeat(4, [
                                     f["normal"](85, "sequence", 5, longBullet),
                                 ]),
                                 d.wait(3)
                             ]),
                             d.wait(820),
                             d.repeat(34, [
                                 d.repeat(3, [
                                     f["normal"](130, "sequence", 6, missile),
                                 ]),
                                 d.wait(5),
                             ]),
                             d.wait(800),
                         ])
                     ])
                 };
            },
            "boss10": function(obj){
                return {
                    "top": d.action([
                        d.repeat(99, [
                            d.wait(Math.max(30, 230 - obj.rank * 15)),
                            d.repeat("($loop.index & 1) ? 3 : 5", [
                                d.repeat(4, [
                                    d.bindVar("dir", "$rand * 220 + 70"),
                                    f["normal"]("$dir", "sequence", 4.5, longBullet),
                                    d.repeat(2 + ~~(obj.rank * 0.3), [
                                        f["normal"](0, "sequence", "$loop.index * 0.5 + 5", longBullet),
                                    ]),
                                ]),
                                d.wait(12),
                            ])
                        ])
                    ]),
                    "top2": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(5, [
                                f["normal"]("$loop.index * 5", "absolute", 3, middleBullet),
                                d.repeat(11, [
                                    f["normal"](30, "sequence", 3, middleBullet)
                                ]),
                                d.wait(Math.max(10, 45 - obj.rank * 3))
                            ]),
                            d.wait(180),
                        ])
                    ]),
                };
            },
            "boss11": function(){
                middleR.hp = 200;
                middleR.danmaku = "boss3";
                return {
                    "top": d.action([
                        d.wait(120),
                        d.repeat(99, [
                            f["normal"](90, "sequence", 2.5, largeBullet),
                            d.repeat(2, [
                                f["normal"](30, "sequence", 2.5, largeBullet),
                            ]),
                            d.wait(30),
                            d.repeat(5, [
                                f["normal"](30, "sequence", 4, zakoT),
                                d.wait(5),
                            ]),
                            d.wait("~~(Math.cos($loop.index) * 120) + 150"),
                        ]),
                    ]),
                };
            },
            "boss12": function(obj){
                return {
                    "top": d.action([
                        d.repeat(99, [
                            d.wait(90 - obj.rank * 2),
                            d.repeat(6 + ~~(obj.rank * 0.5), [
                                d.repeat(3, [
                                    f["normal"](125, "sequence", 3 + obj.rank * 0.2, longBullet),
                                ]),
                                d.wait(Math.max(4, ~~(10 - obj.rank * 0.2))),
                            ])
                        ])
                    ]),
                    "top2": d.action([
                        d.repeat(99, [
                            d.wait(90 - obj.rank * 2),
                            d.repeat(6 + ~~(obj.rank * 0.5), [
                                d.repeat(3, [
                                    f["normal"](115, "sequence", 3 + obj.rank * 0.2, longBullet),
                                ]),
                                d.wait(Math.max(4, ~~(10 - obj.rank * 0.2))),
                            ])
                        ])
                    ]),
                    "top3": d.action([
                        d.repeat(99, [
                            d.wait(180 - obj.rank * 3),
                            d.repeat(2 + obj.rank, [
                                d.repeat(2, [
                                    f["normal"](191, "sequence", 4 + obj.rank * 0.2, missile),
                                ]),
                                d.wait(Math.max(5, ~~(15 - obj.rank * 0.2))),
                            ])
                        ])
                    ]),
                    "top4": d.action([
                        d.repeat(99, [
                            d.wait(180 - obj.rank * 3),
                            d.repeat(2 + obj.rank, [
                                d.repeat(2, [
                                    f["normal"](169, "sequence", 4 + obj.rank * 0.2, missile),
                                ]),
                                d.wait(Math.max(5, ~~(15 - obj.rank * 0.2))),
                            ])
                        ])
                    ]),
                }
            },
            "boss13": function(obj){
                var num = obj.rank % 3;
                var bullet = [middleBullet, longBullet, largeBullet][num];
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(7, [
                                d.repeat("($loop.index & 1) ? 5 : 11", [
                                    f["normal"](17 + num * 6, "sequence", 2.4 + num * 0.2, bullet)
                                ]),
                                d.wait(Math.max(10, ~~(30 - obj.rank))),
                            ]),
                            d.wait(120 + num * 20)
                        ])
                    ]),
                    "top2": d.action([
                        d.wait(90),
                        d.repeat(999, [
                            d.repeat(20, [
                                f["normal"](-26, "sequence", 3 + num * 0.2, {}),
                                d.wait(Math.max(1, 3 - ~~(obj.rank * 0.3)))
                            ]),
                            d.wait("($loop.index & 1) ? 60 : 180")
                        ])
                    ])
                };
            },
            "boss14": function(obj){
                invisible.danmaku = "vortex01";
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat("($loop.index & 1) + 1", [
                                f["normal"]("$rand * 360", "aim", 12, invisible, d.action([
                                    act["change_speed"](0, 15, 180),
                                    d.vanish()
                                ])),
                                d.wait(Math.max(30, ~~(90 - obj.rank * 5))),
                            ]),
                            d.wait(120 - obj.rank * 2)
                        ])
                    ]),
                };
            },
            "boss15": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99,[
                            act["nway_shot"](obj.rank, -15, 60 + obj.rank * 2, "aim", 10 + obj.rank * 0.2, largeBullet, longBullet),
                            d.wait(15 - obj.rank),
                            act["nway_shot"](obj.rank, 15, -60 - obj.rank * 2, "aim", 10 + obj.rank * 0.2, largeBullet, longBullet),
                            d.wait("($loop.index & 1) ? 90 : 240"),
                        ])
                    ])
                }
            },
            "zako01": function(obj){
                return {
                    "top": d.action([
                        d.wait(15),
                        d.repeat(33, [
                            f["normal"](180, "absolute", 16, middleBullet),
                            d.wait(6),
                        ])
                    ])
                };
            },
            "zako02": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(6, [
                                d.repeat(2, [
                                    f["normal"](25, "sequence", 4, longBullet),
                                    d.repeat(2, [
                                        f["normal"](120, "sequence", 4, longBullet),
                                    ]),
                                    d.wait(15),
                                ]),
                                d.wait(90),
                            ]),
                            d.actionRef("whip", 2),
                            d.wait(120),
                        ])
                    ]),
                    "top2": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(4, [
                                d.repeat(3, [
                                    f["normal"](-20, "sequence", 4, longBullet),
                                    d.repeat(2, [
                                        f["normal"](120, "sequence", 4, longBullet),
                                    ]),
                                    d.wait(15),
                                ]),
                                d.wait(135),
                            ]),
                            d.wait(60),
                            d.actionRef("whip", -2),
                            d.wait(60),
                        ])
                    ]),
                    "whip": d.action([
                        d.bindVar("r", "$rand * 4 + 2"),
                        d.wait("120 - $r * 2"),
                        d.repeat("$r", [
                            f["normal"]("$1", "aim", 4, middleBullet),
                            d.repeat(2, [
                                d.wait(1),
                                f["normal"](0, "sequence", "$loop.index * 0.5 + 4.5", middleBullet),
                            ]),
                            d.wait("600 / $r"),
                        ])
                    ]),
                };
            },
            "zako03": function(){
                return {
                    "top": d.action([
                        d.wait(120),
                        d.notify("destroy")
                    ])
                };
            },
            "zako04": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(11 + ~~(obj.rank * 0.2), [
                            f["normal"]("185 + $loop.index * 7", "absolute", 3, middleBullet),
                            f["normal"]("175 -($loop.index * 7)", "absolute", 3, middleBullet),
                            d.wait(5 - ~~(obj.rank * 0.25))
                        ])
                    ])
                };
            },
            "zako05": function(obj){
                return {
                    "top": d.action([
                        d.wait(120 - obj.rank * 5),
                        d.bindVar("spd", 1.8 + ~~(obj.rank * 0.2)),
                        d.repeat(10 + ~~(obj.rank * 0.4), [
                            d.repeat(2, [
                                f["normal"]("$rand * 120 - 60", "aim", 9, longBullet, d.actionRef("change_speed" , "$spd", 60)),
                                f["normal"]("$rand * 120 - 60", "aim", 8, middleBullet, d.actionRef("change_speed", "$spd", 45)),
                            ]),
                            f["normal"]("$rand * 120 - 60", "aim", 7, largeBullet, d.actionRef("change_speed", "$spd", 30)),
                            d.wait(3 - ~~(obj.rank * 0.1))
                        ]),
                    ]),
                    "change_speed": d.action([
                        d.changeSpeed(d.speed("$1"), "$2"),
                        d.wait("$2 * 3"),
                        d.changeSpeed(d.speed("$1 * 2"), "$2")
                    ])
                };
            }
        }

        return new bulletml.Root(pattern[name](param));
    };

})();
