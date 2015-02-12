/*
 * danmaku.dsl.js
 */

var game = game || {};

(function(){
/*
 * 弾幕
 */
    var d = bulletml.dsl;

    game.ActionPattern = function(name, val, type, duration){
        if(!name || !type) return;
        val = val || 0;
        duration = duration || 1;
        return {
            "change_direction": function(val, type, duration){
                d.action([
                    d.changeDirection(d.direction(val, type), duration),
                    d.wait(duration)
                ])
            },
            "change_speed": function(val, type, duration){
                d.action([
                    d.changeSpeed(d.speed(val, type), duration),
                    d.wait(duration)
                ])
            }
        };
    };

    game.danmakuPattern = function(name, param){
        param = {rank: 0}.$extend(param);
        var zakoT = {
            type: "enemy",
            image: "triangle",
            hp: 12,
            isSyncRotation: true,
        };

        var missile = {
            type: "enemy",
            image: "triangle",
            width: 48,
            height: 24,
            frameIndex: 2,
            boundingType: "rect",
            hp: 3,
            isSyncRotation: true,
        };

        var zakoR = {
            type: "enemy",
            image: "rectangle",
            boundingType: "rect",
            hp: 15
        };

        var barrier = {
            type: "enemy",
            image: "rectangle",
            frameIndex: 2,
            boundingType: "rect",
            hp: 100,
        };

        var middleR = {
            type: "enemy",
            image: "rectangle",
            width: 64,
            height: 64,
            frameIndex: 4,
            boundingType: "rect",
            hp: 36,
        };

        var largeR = {
            type: "enemy",
            image: "rectangle",
            width: 64,
            height: 96,
            frameIndex: 6,
            boundingtype: "rect",
            hp: 45,
        };

        var zakoP = {
            type: "enemy",
            image: "polygon",
            hp: 18,
            isSyncRotation: true,
        };

        var boss = {
            type: "boss",
            image: "polygon",
            width: 96,
            height: 96,
            frameIndex: 1,
            hp: 2000
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
            frameIndex: 6,
        };
        
        var largeBullet = {
            width     : 64,
            height    : 64,
            frameIndex: 3,
        };
        
        var invisible = {
            type         : "invisible",
            fieldOutCheck: true
        }

        var pattern = {
            "test1": function(obj){
                zakoR.hp = 180;
                zakoR.danmaku = "single03";
                boss.hp = 1800;
                boss.danmaku = "boss5";
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(6),
                            d.bullet(boss, d.actionRef("boss"))
                        )
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(90),
                        d.repeat(99, [
                            d.fire(
                                d.direction(60, "absolute"),
                                d.speed(4),
                                d.bullet(zakoR, d.actionRef("zako"))
                            ),
                            d.repeat(5, d.fireRef("wall", 60)),
                            d.fire(
                                d.direction(30, "absolute"),
                                d.speed(6),
                                d.bullet(zakoR, d.actionRef("zako"))
                            ),
                            d.repeat(11, d.fireRef("wall", 30)),
                            d.wait(25),
                            d.actionRef("move"),
                            d.wait(180)
                        ])
                    ]),
                    "wall": d.fire(
                        d.direction("$1", "sequence"),
                        d.speed(0, "sequence"),
                        d.bullet(zakoR, d.actionRef("zako"))
                    ),
                    "zako": d.action([
                        d.changeSpeed(d.speed(0), 25),
                        d.wait(25),
                        d.actionRef("move"),
                        d.changeDirection(d.direction("(~~($rand * 4)) * 90", "absolute"), 1),
                        d.wait(1),
                        d.changeSpeed(d.speed(4), 59),
                    ]),
                    "move": d.action([
                        d.changeSpeed(d.speed(1.5), 1),
                        d.repeat(2, [
                            d.actionRef("change_direction", 120,  60),
                            d.actionRef("change_direction",  60,  60),
                            d.actionRef("change_direction", 300,  60),
                            d.actionRef("change_direction", 240, 120),
                            d.actionRef("change_direction", 300,  60),
                            d.actionRef("change_direction",  60,  60),
                            d.actionRef("change_direction", 120,  60),
                        ]),
                        d.changeSpeed(d.speed(0), 1)
                    ]),
                    "change_direction": d.action([
                        d.changeDirection(d.direction("$1", "absolute"), 1),
                        d.wait("$2"),
                    ])
                };
            },
            "test2": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(13),
                            d.bullet(boss, d.actionRef("boss"))
                        ),
                    ]),
                    "boss": d.action([
                        d.repeat(99, [
                            d.changeSpeed(d.speed(0), 60),
                            d.wait(60),
                            d.changeDirection(d.direction(0, "absolute"), 1),
                            d.changeSpeed(d.speed(4), 1),
                            d.actionRef("shot", 2, 120, 120),
                            d.wait(60),
                            d.changeSpeed(d.speed(0), 1),
                            d.actionRef("shot", 3, 90, 90),
                            d.wait(120),
                            d.repeat(20, [
                                d.fire(
                                    d.direction("$rand * 60 - 45", "aim"),
                                    d.speed(9),
                                    d.bullet(middleBullet, d.actionRef("change_speed"))
                                ),
                                d.repeat(3, [
                                    d.fire(
                                        d.direction(10, "sequence"),
                                        d.speed(9),
                                        d.bullet(middleBullet, d.actionRef("change_speed"))
                                    ),
                                ]),
                                d.wait(15)
                            ]),
                            d.wait(240),
                            d.changeSpeed(d.speed(8), 1),
                            d.changeDirection(d.direction(180, "absolute"), 1),
                            d.wait(1)
                        ])
                    ]),
                    "shot": d.action([
                        d.repeat("$1", [
                            d.fire(
                                d.direction("$loop.index * $2 + $3", "absolute"),
                                d.speed(8),
                                d.bullet(zakoT, d.action([
                                    d.changeSpeed(d.speed(0), 30),
                                    d.wait(30),
                                    d.repeat(3, [
                                        d.fire(
                                            d.direction("$loop.index * 120", "absolute"),
                                            d.speed(8),
                                            d.bullet(zakoT, d.actionRef("zako"))
                                        )
                                    ]),
                                    d.vanish()
                                ]))
                            )
                        ]),
                    ]),
                    "zako": d.action([
                        d.changeSpeed(d.speed(0), 30),
                        d.wait(30),
                        d.changeDirection(d.direction(90, "relative"), 1),
                        d.changeSpeed(d.speed("240 * Math.PI / 360"), 1),
                        d.wait(1),
                        d.repeat(60, [
                            d.fire(
                                d.direction(120, "relative"),
                                d.speed(12),
                                d.bullet(barrier, d.action([
                                    d.wait(13),
                                    d.vanish()
                                ]))
                            ),
                            d.changeDirection(d.direction(8, "relative"), 8),
                            d.wait(8),
                        ]),
                        d.changeSpeed(d.speed(6), 30)
                    ]),
                    "change_speed": d.action([
                        d.changeSpeed(d.speed(2), 45)
                    ])
                };
            },
            "test3": function(obj){
                boss.hp = 2700;
                boss.danmaku = "boss6";
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(6),
                            d.bullet(boss, d.action([
                                d.changeSpeed(d.speed(0), 60),
                                d.repeat(99, [
                                    d.wait(60),
                                    d.actionRef("move")
                                ])
                            ]))
                        ),
                    ]),
                    "top2": d.action([
                        d.repeat(99, [
                            d.wait(360),
                            d.actionRef("bullet_point",  32,  32),
                            d.wait(240),
                            d.actionRef("bullet_point", 608, 320),
                            d.wait(240),
                            d.actionRef("bullet_point", 608,  32),
                            d.wait(240),
                            d.actionRef("bullet_point",  32, 320),
                        ])
                    ]),
                    "bullet_point": d.action([
                        d.fire(
                            d.offsetX("$1"),
                            d.offsetY("$2"),
                            d.direction("($1 < 180) ? 135 : 225", "absolute"),
                            d.speed(10),
                            d.bullet(invisible, d.actionRef("bullet"))
                        ),
                    ]),
                    "bullet": d.action([
                        d.repeat(30, [
                            d.wait(4),
                            d.fire(
                                d.direction(0, "aim"),
                                d.speed(0),
                                d.bullet(middleBullet, d.action([ d.changeSpeed(d.speed(4), 240) ]))
                            ),
                        ])
                    ]),
                    "move": d.action([
                        d.changeSpeed(d.speed(1), 1),
                        d.repeat(2, [
                            d.actionRef("change_direction", 120,  60),
                            d.actionRef("change_direction",  60,  60),
                            d.actionRef("change_direction", 300,  60),
                            d.actionRef("change_direction", 240, 120),
                            d.actionRef("change_direction", 300,  60),
                            d.actionRef("change_direction",  60,  60),
                            d.actionRef("change_direction", 120,  60),
                        ]),
                        d.changeSpeed(d.speed(0), 1)
                    ]),
                    "change_direction": d.action([
                        d.changeDirection(d.direction("$1", "absolute"), 1),
                        d.wait("$2"),
                    ])
                };
            },
            "test4": function(obj){
                zakoR.addedAnimation = "zoom";
                boss.hp = 900;
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(640),
                            d.offsetY(96),
                            d.direction(270, "absolute"),
                            d.speed(12),
                            d.bullet(boss, d.actionRef("boss"))
                       )
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 100),
                        d.wait(100),
                        d.repeat(99, [
                            d.fireRef("invisible", 1),
                            d.actionRef("move", 12),
                            d.fireRef("invisible", -1),
                            d.wait(15),
                            d.actionRef("move", 12),
                            d.wait(1),
                            d.actionRef("move", 2),
                            d.wait(1),
                            d.actionRef("move", 2),
                            d.wait(180)
                        ])
                    ]),
                    "invisible": d.fire(
                        d.direction(180, "absolute"),
                        d.speed(12),
                        d.bullet(invisible, d.actionRef("bullet_point1", "$1"))
                    ),
                    "move": d.action([
                        d.changeDirection(d.direction(180, "relative"), 1),
                        d.changeSpeed(d.speed("$1"), 1),
                        d.wait("552 / $1"),
                        d.changeSpeed(d.speed(0), 1)
                    ]),
                    "bullet_point1": d.action([
                        d.wait("($1 > 0) ? 1 : 5"),
                        d.repeat(4, [
                            d.wait(8),
                            d.fire(
                                d.direction("-90 * $1", "relative"),
                                d.speed(12),
                                d.bullet(invisible, d.actionRef("bullet_point2"))
                            ),
                        ]),
                        d.vanish()
                    ]),
                    "bullet_point2": d.action([
                        d.repeat(6, [
                            d.fire(
                                d.direction(0, "relative"),
                                d.speed(0),
                                d.bullet(zakoR, d.action([
                                    d.wait(240),
                                    d.fire(
                                        d.direction("~~($rand * 4) * 90", "absolute"),
                                        d.speed(3),
                                        d.bullet(middleBullet)
                                    ),
                                    d.repeat(3, [
                                        d.wait(120),
                                        d.fire(
                                            d.direction(90, "sequence"),
                                            d.speed(3),
                                            d.bullet(middleBullet)
                                        )
                                    ]),
                                    d.changeSpeed(d.speed(4), 1)
                                ]))
                            ),
                            d.wait(8)
                        ])
                    ])
                    
                };
            },
            "test5": function(obj){
                boss.danmaku = "boss7";
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(6),
                            d.bullet(boss, d.actionRef("boss"))
                        )
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 60),
                        d.wait(60),
                        d.changeDirection(d.direction(90, "absolute"), 1),
                        d.wait(1),
                        d.changeSpeed(d.speed(1.5), 15),
                        d.wait(75),
                        d.repeat(999, [
                            d.changeSpeed(d.speed(0), 1),
                            d.changeDirection(d.direction(180, "relative"), 1),
                            d.wait(1),
                            d.changeSpeed(d.speed(3), 30),
                            d.wait(90),
                        ]),
                        d.changeSpeed(d.speed(0), 1)
                    ])
                };
            },
            "test6": function(){
                return {
                    "top": d.action([
                        d.repeat(999, [
                            d.fire(
                                d.offsetX(320),
                                d.offsetY(120),
                                d.direction("$rand * 180 + 90", "absolute"),
                                d.speed(2),
                                d.bullet(largeR)
                            ),
                            d.repeat(99, [
                                d.wait(15),
                                d.fire(
                                    d.offsetX(320),
                                    d.offsetY(120),
                                    d.direction("$rand * 180 + 90", "absolute"),
                                    d.speed(2),
                                    d.bullet(largeR)
                                ),
                            ])
                        ])
                    ])
                };
            },

            "stage0_01": function(obj){
                boss.hp = 450;
                return {
                    "top": d.action([
                        d.wait(60),
                        d.notify("cutin", "画面をスライドして、自機を操作。弾は自動で発射します"),
                        d.fire(
                            d.offsetX(320),
                            d.speed(4),
                            d.bullet(boss, d.actionRef("boss"))
                        ),
                        d.wait(30),
                        d.notify("cutin", "コアが出現しました。破壊してください")
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(120),
                        d.repeat(3, d.action([
                            d.changeSpeed(d.speed(2.5), 1),
                            d.repeat(180, d.action([
                                d.changeDirection(d.direction(2, "relative"), 1),
                                d.wait(1)
                            ])),
                            d.repeat(180, d.action([
                                d.changeDirection(d.direction(-2, "relative"), 1),
                                d.wait(1)
                            ])),
                            d.changeSpeed(d.speed(0), 1),
                            d.wait(120),
                        ]))
                    ])
                }
            },
            "stage0_02": function(obj){
                boss.hp = 1400;
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(6),
                            d.bullet(boss, d.actionRef("boss"))
                        ),
                        d.wait(105),
                        d.notify("cutin", "コアが攻撃して来ました。弾を避けてください"),
                        d.wait(15),
                        d.notify("cutin", "エネルギーが50%以上あれば、バリアモードに切り替える事が出来ます"),
                        d.wait(15),
                        d.notify("cutin", "バリアモード時は敵の弾を跳ね返して攻撃することが出来ます")
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(5, [
                                d.repeat(11 + obj.rank, [
                                    d.fire(
                                        d.direction(43, "sequence"),
                                        d.speed(3),
                                        d.bullet()
                                    )
                                ]),
                                d.wait(15)
                            ]),
                            d.wait(60)
                        ])
                    ])
                };
            },
            "stage0_03": function(obj){
                return {
                    "top": d.action([
                        d.wait(90),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(6),
                            d.bullet(boss, d.actionRef("boss"))
                        ),
                        d.wait(120),
                        d.notify("cutin", "コアがオブジェクトを発射しました。バリアでは防げないので、ショットで破壊してください"),
                        d.wait(30),
                        d.notify("cutin", "オブジェクトを破壊すると、弾をばら撒きます。バリアで跳ね返して攻撃しましょう")
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(105),
                        d.repeat(99, [
                            d.repeat(8, [
                                d.fire(
                                    d.direction(45, "sequence"),
                                    d.speed(3),
                                    d.bullet(zakoT, d.actionRef("zako"))
                                ),
                            ]),
                            d.wait(90),
                            d.repeat(8, [
                                d.fire(
                                    d.direction(45, "sequence"),
                                    d.speed(3),
                                    d.bullet(zakoR, d.actionRef("zako"))
                                ),
                            ]),
                            d.wait(90),
                            d.repeat(8, [
                                d.fire(
                                    d.direction(45, "sequence"),
                                    d.speed(3),
                                    d.bullet(zakoP, d.actionRef("zako"))
                                ),
                            ]),
                            d.wait(240)
                        ])
                    ]),
                    "zako": d.action([
                        d.wait(75),
                        d.fire(d.direction(120, "relative"), d.speed(2), d.bullet()),
                        d.repeat(2, [
                            d.fire(d.direction(60, "sequence"), d.speed(2), d.bullet())
                        ])
                    ])
                };
            },
            "stage1_01": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(4),
                            d.bullet(boss, d.actionRef("boss"))
                        )
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(5, [
                                d.repeat(4, [
                                    d.fireRef("fire", "$rand * 180 + 90"),
                                    d.wait(5)
                                ]),
                                d.wait("30 - $loop.index * 5")
                            ]),
                            d.repeat(2, [
                                d.fire(d.direction("$loop.index * 5", "absolute"), d.speed(2), d.bullet()),
                                d.repeat(35, [
                                    d.fire(d.direction(10, "sequence"), d.speed(2), d.bullet()),
                                ]),
                                d.wait(15)
                            ]),
                            d.wait("85 - $loop.index * 5")
                        ])
                    ]),
                    "fire": d.fire(
                        d.direction("$1", "aim"),
                        d.speed(4),
                        d.bullet(zakoT, d.actionRef("zakomove"))
                    ),
                    "zakomove": d.action([
                        d.wait(30),
                        d.changeDirection(d.direction(0, "aim"), 10),
                        d.wait(10),
                        d.changeSpeed(d.speed(5), 1)
                    ])
                };    
            },
            "stage1_02": function(obj){
                boss.hp = 1200;
                boss.danmaku = "boss1_01";
                middleR.hp = 90;
                middleR.danmaku = "single01";
                return {
                    "top0": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(4),
                            d.bullet(boss, d.actionRef("boss"))
                        )
                    ]),
                    "top1": d.action([
                        d.wait(30),
                        d.repeat(99, [
                            d.repeat(4, [
                                d.fireRef("middle", 80, 5, -1),
                            ]),
                            d.repeat(4, [
                                d.fireRef("middle", 150, 4, 1),
                            ]),
                            d.wait(720)
                        ])
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(90),
                        d.changeSpeed(d.speed(1.5), 1),
                        d.repeat(999, [
                            d.actionRef("change_direction", 120,  30),
                            d.actionRef("change_direction",  60,  30),
                            d.actionRef("change_direction", 300,  30),
                            d.actionRef("change_direction", 240,  60),
                            d.actionRef("change_direction", 300,  30),
                            d.actionRef("change_direction",  60,  30),
                            d.actionRef("change_direction", 120,  30),
                        ]),
                        d.changeSpeed(d.speed(0), 1)
                    ]),
                    "middle": d.fire(
                        d.offsetX("$loop.index * 140 + $1"),
                        d.offsetY(0),
                        d.direction(180, "absolute"),
                        d.speed("$2"),
                        d.bullet(middleR, d.action([
                            d.wait(60),
                            d.changeSpeed(d.speed(0), 1),
                            d.wait(20),
                            d.changeDirection(d.direction("$3 * 90", "relative"), 1),
                            d.repeat(99, [
                                d.changeSpeed(d.speed(1), 1),
                                d.wait(70),
                                d.changeSpeed(d.speed(0), 1),
                                d.wait(20),
                                d.changeDirection(d.direction(180, "absolute"), 1),
                                d.changeSpeed(d.speed(0.5), 1),
                                d.wait(70),
                                d.changeSpeed(d.speed(0), 1),
                                d.wait(20),
                                d.changeDirection(d.direction("$3 * 90", "relative"), 1)
                            ])
                        ]))
                    ),
                    "change_direction": d.action([
                        d.changeDirection(d.direction("$1", "absolute"), 1),
                        d.wait("$2"),
                    ])
                };
            },
            "stage1_03": function(obj){
                boss.hp = 1800;
                return {
                    "top": d.action([
                        d.wait(90),
                        d.fire(
                            d.offsetX(320),
                            d.offsetY(0),
                            d.speed(4),
                            d.bullet(boss, d.actionRef("boss"))
                        )
                    ]),
                    "top2": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(60, [
                                d.fire(
                                    d.offsetX(120),
                                    d.offsetY(180),
                                    d.direction(17, "sequence"),
                                    d.speed(3),
                                    d.bullet(zakoT)
                                ),
                                d.wait(15)
                            ]),
                            d.wait(120)
                        ])
                    ]),
                    "top3": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(60, [
                                d.fire(
                                    d.offsetX(520),
                                    d.offsetY(180),
                                    d.direction(17, "sequence"),
                                    d.speed(3),
                                    d.bullet(zakoP)
                                ),
                                d.wait(15)
                            ]),
                            d.wait(120)
                        ])
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 60),
                        d.wait(60),
                        d.repeat(99, [
                            d.repeat(45, [
                                d.fire(d.direction(7, "sequence"), d.speed(4), d.bullet(middleBullet)),
                                d.wait(2)
                            ]),
                            d.wait(180)
                        ])
                    ])
                };
            },
            "stage2_01": function(obj){
                zakoR.hp = 12;
                return {
                    "top": d.action([
                        d.wait(30),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(8),
                            d.bullet(boss, d.action([
                                d.changeSpeed(d.speed(0), 60),
                                d.wait(60),
                                d.repeat(99, [
                                    d.repeat(3, [
                                        d.fire(
                                            d.direction(90, "sequence"),
                                            d.speed(4),
                                            d.bullet(zakoR, d.actionRef("zako"))
                                        )
                                    ]),
                                    d.wait(10),
                                    d.repeat(20, [
                                        d.fire(
                                            d.direction(27, "sequence"),
                                            d.speed("$loop.index * 0.25 + 2"),
                                            d.bullet(middleBullet)
                                        ),
                                        d.wait(1)
                                    ]),
                                    d.changeDirection(d.direction(90, "relative"), 1),
                                    d.changeSpeed(d.speed(2), 1),
                                    d.wait(30),
                                    d.changeSpeed(d.speed(0), 1),
                                    d.wait(120)
                                ])
                            ]))
                        )
                    ]),
                    "zako": d.action([
                        d.wait(12),
                        d.changeSpeed(d.speed(0), 1),
                        d.wait(3),
                        d.bindVar("r", "$rand * 9"),
                        d.fire(
                           d.direction("($r < 1) ? -90 : ($r < 2) ? 90 : 0", "relative"),
                           d.speed(4),
                           d.bullet(zakoR, d.actionRef("zako"))
                        ),
                        d.wait(30),
                        d.vanish()
                    ])
                };
            },
            "stage2_02": function(obj){
                boss.danmaku = "boss2";
                boss.hp = 2200;
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(6),
                            d.bullet(boss, d.actionRef("bossmove"))
                        ),
                    ]),
                    "top2": d.action([
                        d.wait(90),
                        d.repeat(999, [
                            d.fire(
                                d.offsetX("$rand * 500 + 80"),
                                d.direction(180, "absolute"),
                                d.speed(0),
                                d.bullet(largeR, d.action([
                                    d.changeSpeed(d.speed(3), 90),
                                    d.wait(60),
                                    d.repeat(11, [
                                        d.fireRef("fire", "$loop.index * 7 + 5"),
                                        d.fireRef("fire", "-$loop.index * 7 - 5"),
                                        d.wait(5)
                                    ])
                                ]))
                            ),
                            d.wait("~~(Math.cos($loop.index) * 150) + 240")
                        ])
                    ]),
                    "fire": d.fire(
                        d.direction("$1", "relative"),
                        d.speed(3),
                        d.bullet()
                    ),
                    "bossmove": d.action([
                        d.changeSpeed(d.speed(0), 60),
                        d.wait(60),
                        d.repeat(99, [
                            d.changeSpeed(d.speed(2), 1),
                            d.repeat(360, [
                                d.changeDirection(d.direction("$loop.index", "absolute"), 1),
                                d.wait(1),
                            ]),
                            d.changeSpeed(d.speed(0), 1),
                            d.wait(60),
                            d.changeSpeed(d.speed(2), 1),
                            d.repeat(360, [
                                d.changeDirection(d.direction("-$loop.index", "absolute"), 1),
                                d.wait(1),
                            ]),
                            d.changeSpeed(d.speed(0), 1),
                            d.wait(120)
                        ]),
                    ])
                };
            },
            "stage2_03": function(obj){
                boss.hp = 500;
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(6),
                            d.bullet(boss, d.actionRef("boss"))
                        )
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 60),
                        d.wait(60),
                        d.repeat(4, [
                            d.fire(
                                d.direction(90, "sequence"),
                                d.speed(8),
                                d.bullet(barrier, d.actionRef("zakoA"))
                            )
                        ]),
                        d.repeat(99, [
                            d.wait(30),
                            d.changeDirection(d.direction(270, "absolute"), 1),
                            d.changeSpeed(d.speed(2), 1),
                            d.wait(30),
                            d.fireRef("zako_fire", 240),
                            d.fireRef("zako_fire", 300),
                            d.changeDirection(d.direction(90, "absolute"), 1),
                            d.changeSpeed(d.speed(2), 1),
                            d.wait(60),
                            d.fireRef("zako_fire", 120),
                            d.fireRef("zako_fire", 60),
                            d.changeDirection(d.direction(270, "absolute"), 1),
                            d.wait(30),
                            d.changeSpeed(d.speed(0), 1),
                            d.wait(300)
                        ]),
                    ]),
                    "zakoA": d.action([
                        d.wait(4),
                        d.changeSpeed(d.speed(0), 1),
                        d.wait(1),
                        d.fire(
                            d.direction(90, "relative"),
                            d.speed(8),
                            d.bullet(barrier, d.actionRef("zakoA"))
                        ),
                        d.wait(30),
                        d.vanish()
                    ]),
                    "zako_fire": d.fire(
                        d.direction("$1", "absolute"),
                        d.speed(12),
                        d.bullet(zakoP, d.actionRef("zako"))
                    ),
                    "zako": d.action([
                        d.changeDirection(d.direction(180, "absolute"), 30),
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(90),
                        d.changeSpeed(d.speed(0.01), 1),
                        d.repeat(10, [
                            d.changeDirection(d.direction(0, "aim"), 1),
                            d.wait(1)
                        ]),
                        d.wait(15),
                        d.changeDirection(d.direction(180, "aim"), 1),
                        d.changeSpeed(d.speed(2), 1),
                        d.repeat(15, [
                            d.fire(
                                d.direction("$rand * 120 + 120", "relative"),
                                d.speed(9),
                                d.bullet(d.actionRef("change_speed", 2, 60))
                            ),
                            d.fire(
                                d.direction("$rand * 120 + 120", "relative"),
                                d.speed(8),
                                d.bullet(middleBullet, d.actionRef("change_speed", 2, 45))
                            ),
                            d.fire(
                                d.direction("$rand * 120 + 120", "relative"),
                                d.speed(7),
                                d.bullet(largeBullet, d.actionRef("change_speed", 2, 30))
                            ),
                            d.wait(2)
                        ]),
                    ]),
                    change_speed: d.action([
                        d.changeSpeed(d.speed("$1"), "$2"),
                        d.wait("$2 * 3"),
                        d.changeSpeed(d.speed("$1 * 2"), "$2")
                    ])
                }
            },
            "stage3_01": function(obj){
                largeR.fieldOutCheck = zakoP.fieldOutCheck = false;
                zakoP.isSyncRotation = false;
                largeR.hp = zakoP.hp = 550;
                boss.hp = 1200;
                boss.danmaku = "boss3";
                zakoP.danmaku = "whip01";
                return {
                    "top": d.action([
                        d.wait(59),
                        d.fire(
                            d.offsetX(639),
                            d.offsetY(128),
                            d.direction(270, "absolute"),
                            d.speed(7),
                            d.bullet(boss, d.actionRef("bossmove", 1))
                        )
                    ]),
                    "top1": d.action([
                        d.wait(60),
                        d.fireRef("set_largeR", 597, 160),
                        d.fireRef("set_largeR", 569, 128),
                        d.fireRef("set_largeR", 540, 102),
                        d.fireRef("set_zakoP"  , 585, 80),
                        d.fireRef("set_largeR", 681, 160),
                        d.fireRef("set_largeR", 710, 128),
                        d.fireRef("set_largeR", 739, 102),
                        d.fireRef("set_zakoP"  , 693, 80),

                    ]),
                    "set_largeR": d.fire(
                        d.offsetX("$1"),
                        d.offsetY("$2"),
                        d.direction(270, "absolute"),
                        d.speed(7),
                        d.bullet(largeR, d.actionRef("bossmove", 0))
                    ),
                    "set_zakoP": d.fire(
                        d.offsetX("$1"),
                        d.offsetY("$2"),
                        d.direction(270, "absolute"),
                        d.speed(7),
                        d.bullet(zakoP, d.actionRef("bossmove", 0))
                    ),
                    "bossmove": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait("$1 + 90"),
                        d.changeDirection(d.direction(180, "absolute"), 1),
                        d.changeSpeed(d.speed(2), 1),
                        d.wait(30),
                        d.changeSpeed(d.speed(0), 60),
                        d.wait(60),
                        d.actionRef("zigzag", 120),
                        d.repeat(99, [
                            d.repeat(2, d.actionRef("zigzag", -120)),
                            d.repeat(2, d.actionRef("zigzag", 120)),
                        ])
                    ]),
                    "zigzag": d.action([
                        d.changeDirection(d.direction("$1", "relative"), 1),
                        d.changeSpeed(d.speed(7), 1),
                        d.wait(9),
                        d.changeSpeed(d.speed(0), 51),
                        d.wait(51),
                        d.changeDirection(d.direction(180, "absolute"), 1),
                        d.changeSpeed(d.speed(2), 1),
                        d.wait(30),
                        d.changeSpeed(d.speed(0), 60),
                        d.wait(60),
                    ])
                };
            },
            "stage3_02": function(obj){
                zakoP.danmaku = "single02";
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.offsetY(260),
                            d.direction(180, "absolute"),
                            d.speed(0),
                            d.bullet(boss, d.actionRef("boss"))
                        ),
                    ]),
                    "boss": d.action([
                        d.repeat(99, [
                            d.actionRef("zakoP", 10, 160 * Math.PI / 360, 3, -1, 8, 36),
                            d.actionRef("zakoP", 30, 480 * Math.PI / 360, 1, 1, 24, 12),
                            d.wait(420)
                        ])
                    ]),
                    "zakoP": d.action([
                        d.fire(
                            d.direction("$rand * 36 + 195", "absolute"),
                            d.speed(8),
                            d.bullet(zakoP, d.actionRef("clockwise", "$1", "$2", "$3", "$4"))
                        ),
                        d.repeat("$5", [
                            d.fire(
                                d.direction("$6", "sequence"),
                                d.speed(8),
                                d.bullet(zakoP, d.actionRef("clockwise", "$1", "$2", "$3", "$4"))
                            )
                        ]),
                    ]),
                    "clockwise": d.action([
                        d.wait("$1"),
                        d.changeSpeed(d.speed(0), 1),
                        d.wait(1),
                        d.changeDirection(d.direction("$4 * 90", "relative"), 1),
                        d.changeSpeed(d.speed("$2 * $3"), 1),
                        d.repeat(300, [
                            d.wait(1),
                            d.changeDirection(d.direction("$3 * $4", "relative"), 1),
                        ]) 
                    ])
                };
            },
            "stage3_03": function(obj){
                boss.hp = 4000;
                boss.danmaku = "boss4";
                return {
                    "top": d.action([
                        d.wait(60),
                        d.fire(
                            d.offsetX(320),
                            d.direction(180, "absolute"),
                            d.speed(5),
                            d.bullet(boss, d.actionRef("boss"))
                        )
                    ]),
                    "boss": d.action([
                        d.changeSpeed(d.speed(0), 90),
                        d.wait(120),
                        d.repeat(99,[
                            d.repeat(5, [
                                d.fire(
                                    d.direction("$loop.index * 30 + 60", "absolute"),
                                    d.speed(4),
                                    d.bullet(largeBullet, d.actionRef("wing", 1, 0))
                                ),
                                d.fire(
                                    d.direction("-$loop.index * 30 - 60", "absolute"),
                                    d.speed(4),
                                    d.bullet(largeBullet, d.actionRef("wing", -1, 0))
                                ),
                                d.wait(30)
                            ]),
                            d.wait("~~(Math.cos($loop.index) * 360) + 390")
                        ])
                    ]),
                    "wing": d.action([
                        d.wait("15 + $2 * 15"),
                        d.fire(
                            d.direction("$1 * 60", "relative"),
                            d.speed(2),
                            d.bullet(largeBullet, d.actionRef("wing", "$1", "$2 + 1"))
                        ),
                        d.changeSpeed(d.speed(4), 150)
                    ])
                };
            },
            "explode": function(obj){
                var way = (obj.rank < 2) ? 2 : obj.rank;
                return {
                    "top": d.action([
                        d.bindVar("wt", (way > 9) ? 10 : 20 - way),
                        d.fire(
                            d.direction("$rand * 160 + 10", "aim"),
                            d.speed(5),
                            d.bullet(d.action([
                                d.changeSpeed(d.speed("$rand * 2 + 1"), "$wt")
                            ]))
                        ),
                        d.repeat(way - 1, [
                            d.fire(
                                d.direction("$rand * 160 + 10", "sequence"),
                                d.speed(1, "sequence"),
                                d.bullet(d.action([
                                    d.changeSpeed(d.speed("$rand * 2 + 1"), "$wt")
                                ]))
                            )
                        ]),
                        d.vanish()
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
                            d.fire(
                                d.direction("$rand * 5 - 3", "aim"),
                                d.speed(2),
                                d.bullet(middleBullet)
                            )
                        ])
                    ])
                };
            },
            "single02": function(obj){
                return {
                    "top": d.action([
                        d.wait(65),
                        d.repeat(12, [
                            d.fire(
                                d.direction(180, "absolute"),
                                d.speed(0),
                                d.bullet(d.action([
                                    d.changeSpeed(d.speed(4), 180)
                                ]))
                            ),
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
                            d.fire(
                                d.direction(0, "aim"),
                                d.speed(0.5),
                                d.bullet(middleBullet, d.action([
                                    d.changeSpeed(d.speed(4), 240)
                                ]))
                            ),
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
                            d.repeat(2, [
                                d.fire(d.direction("$rand * 5 - 3", "aim"), d.speed(3), d.bullet(middleBullet)),
                                d.repeat(4, [
                                    d.wait(1),
                                    d.fire(d.direction(0, "sequence"), d.speed(0.5, "sequence"), d.bullet(middleBullet))
                                ]),
                                d.wait(90)
                            ]),
                        ])
                    ])
                };
            },
            "boss1_01": function(obj){
                return {
                    "top": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(13, [
                                d.repeat(7, [
                                    d.fire(
                                        d.direction(11, "sequence"),
                                        d.speed(3.5),
                                        d.bullet(missile, d.action([
                                            d.wait(10),
                                            d.changeDirection(d.direction(90, "relative"), 15)
                                        ]))
                                    )
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
                                d.fire(
                                    d.direction(-60, "aim"),
                                    d.speed(3),
                                    d.bullet(zakoP)
                                ),
                                d.repeat(5, [
                                    d.fire(
                                        d.direction(20, "sequence"),
                                        d.speed(3),
                                        d.bullet(zakoP)
                                    ),
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
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(5, [
                                d.fire(d.direction("$rand * 165 - 90", "aim"), d.speed(3), d.bullet()),
                                d.repeat(3, [
                                    d.fire(d.direction(5, "sequence"), d.speed(3), d.bullet())
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
                            d.fire(
                                d.direction(-30, "aim"),
                                d.speed(4),
                                d.bullet(zakoT)
                            ),
                            d.repeat(3, d.fireRef("zakoT_fire", 20)),
                            d.wait(30),
                            d.repeat(3, d.fireRef("zakoT_fire", -20)),
                        ])
                    ]),
                    "zakoT_fire": d.fire(
                        d.direction("$1", "sequence"),
                        d.speed(4),
                        d.bullet(zakoT)
                    )
                };
            },
            "boss4": function(obj){
                return {
                    "top": d.action([
                        d.wait(90),
                        d.repeat(99, [
                            d.repeat(18, [
                                d.fire(
                                    d.direction(20, "sequence"),
                                    d.speed(5),
                                    d.bullet(zakoT, d.action([
                                        d.wait(30),
                                        d.changeDirection(d.direction(0, "aim"), 45),
                                    ]))
                                ),
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
                            d.fire(
                                d.direction("$1 * $loop.index * 20 + (($1 === 1) ? 90 : 270)", "absolute"),
                                d.speed(3),
                                d.bullet(longBullet)
                            ),
                            d.repeat(3, [
                                d.fire(
                                    d.direction("$1 * 20", "sequence"),
                                    d.speed(3),
                                    d.bullet(longBullet)
                                )
                            ]),
                            d.wait(15)
                        ])
                    ])
                };
            },
            "boss5": function(obj){
                return {
                    "top": d.action([
                        d.wait(240),
                        d.repeat(99, [
                            d.fire(
                                d.direction("$rand * 360", "absolute"),
                                d.speed(8),
                                d.bullet(zakoP, d.actionRef("zako", "~~($rand * 2)"))
                            ),
                            d.wait("$rand * 210 + 60")
                        ])
                    ]),
                    "zako": d.action([
                        d.changeSpeed(d.speed(0), 30),
                        d.wait(60),
                        d.repeat(3, [
                            d.fire(d.direction("(($1) ? 6 : -6)", "aim"), d.speed(4), d.bullet()),
                            d.repeat(4, [
                                d.wait(2),
                                d.fire(d.direction("(($1) ? -3 : 3)", "sequence"), d.speed(0.2, "sequence"), d.bullet()),
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
                            d.repeat(50, [
                                d.repeat("6 + $loop.index", [
                                    d.fire(
                                        d.direction(185, "sequence"),
                                        d.speed(3),
                                        d.bullet()
                                    ),
                                    d.wait(1)
                                ]),
                                d.wait("50 - $loop.index")
                            ]),
                            d.wait(180)
                        ])
                    ])
                };
            },
            "boss7": function(obj){
                return {
                    "top": d.action([
                        d.wait(60),
                        d.repeat(99, [
                            d.actionRef("nway_bullet", 1),
                            d.wait(45),
                            d.actionRef("nway_bullet", -1),
                            d.wait(120)
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
                                        d.fire(
                                            d.direction("($dir === 0) ? 15 : -15", "sequence"),
                                            d.speed(3.5),
                                            d.bullet(zakoP)
                                        )
                                    ]),
                                    d.wait(15)
                                ]),
                                d.wait(45)
                            ])
                        ])
                    ]),
                    "nway_bullet": d.action([
                        d.fire(
                            d.direction("$1 * 60", "aim"),
                            d.speed(12),
                            d.bullet(largeBullet, d.actionRef("burst", "$1"))
                        ),
                        d.repeat(9, [
                            d.wait(3),
                            d.fire(
                                d.direction("-15 * $1", "sequence"),
                                d.speed(-1, "sequence"),
                                d.bullet(largeBullet, d.actionRef("burst", "$1"))
                            )
                        ])
                    ]),
                    "burst": d.action([
                        d.actionRef("change_speed", 0, 45, 15),
                        d.fire(
                            d.direction("$1", "relative"),
                            d.speed(3),
                            d.bullet(longBullet)
                        ),
                        d.repeat(4, [
                            d.wait(9),
                            d.fire(
                                d.direction("$1 * 3", "sequence"),
                                d.speed(3),
                                d.bullet(longBullet)
                            )
                        ]),
                        d.vanish()
                    ]),
                    "change_speed": d.action([
                        d.changeSpeed(d.speed("$1"), "$2"),
                        d.wait("$3")
                    ])
                };
            }
        }

        return new bulletml.Root(pattern[name](param));
    };

})();